import {
  Department,
  User,
  DailyLog,
  TimetableEntry,
  Holiday,
  LeaveRecord,
  Announcement,
  AuditLog,
  CollegeSettings,
  NotificationItem,
} from '@/types';
import {
  INITIAL_COLLEGE_SETTINGS,
  INITIAL_DEPARTMENTS,
  INITIAL_USERS,
  INITIAL_HOLIDAYS,
  INITIAL_TIMETABLES,
  generateInitialDailyLogs,
} from '@/utils/collegeData';
import { db, isFirebaseConfigured } from '@/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const KEYS = {
  SETTINGS: 'giits_settings',
  DEPARTMENTS: 'giits_departments',
  USERS: 'giits_users',
  TIMETABLES: 'giits_timetables',
  DAILY_LOGS: 'giits_daily_logs',
  HOLIDAYS: 'giits_holidays',
  LEAVES: 'giits_leaves',
  ANNOUNCEMENTS: 'giits_announcements',
  AUDIT_LOGS: 'giits_audit_logs',
  NOTIFICATIONS: 'giits_notifications',
  OFFLINE_QUEUE: 'giits_offline_queue',
};

// Purge any legacy mock cache from browser localStorage on load
const DATA_VERSION = 'giits_prod_v3_clean';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('giits_data_version') !== DATA_VERSION) {
      localStorage.removeItem(KEYS.USERS);
      localStorage.removeItem(KEYS.DAILY_LOGS);
      localStorage.removeItem(KEYS.TIMETABLES);
      localStorage.removeItem(KEYS.LEAVES);
      localStorage.removeItem(KEYS.ANNOUNCEMENTS);
      localStorage.removeItem('giits_auth_user');
      localStorage.setItem('giits_data_version', DATA_VERSION);
    }
  } catch (e) {
    console.warn('LocalStorage cleanup:', e);
  }
}

// Memory cache & local storage helpers
function loadLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function saveLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

export class StorageService {
  // --- Settings & Initial Firestore Seeding ---
  static async getCollegeSettings(): Promise<CollegeSettings> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'collegeSettings', 'main'));
        if (snap.exists()) {
          return snap.data() as CollegeSettings;
        } else {
          // Auto-seed initial GIITS institutional data into newly connected Firestore
          this.seedInitialFirestoreData().catch((e) => console.warn('Auto-seed Firestore warning:', e));
        }
      } catch (err) {
        console.warn('Firestore settings fetch fallback to local:', err);
      }
    }
    return loadLocal<CollegeSettings>(KEYS.SETTINGS, INITIAL_COLLEGE_SETTINGS);
  }

  static async seedInitialFirestoreData(): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
      console.log('[Firestore] Initializing clean GIITS collections for project fdar-cb701...');
      // 1. Settings
      await setDoc(doc(db, 'collegeSettings', 'main'), INITIAL_COLLEGE_SETTINGS);
      // 2. Departments
      for (const dept of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, 'departments', dept.id), dept);
      }
      // 3. Principal User Only
      for (const user of INITIAL_USERS) {
        await setDoc(doc(db, 'users', user.uid), user);
      }
      console.log('[Firestore] Clean GIITS institutional schema ready.');
    } catch (err) {
      console.warn('[Firestore] Could not auto-seed Firestore (check Security Rules or permissions):', err);
    }
  }

  static async updateCollegeSettings(
    settings: Partial<CollegeSettings>,
    updatedBy: string
  ): Promise<CollegeSettings> {
    const current = await this.getCollegeSettings();
    const updated: CollegeSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    saveLocal(KEYS.SETTINGS, updated);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'collegeSettings', 'main'), {
          ...updated,
          serverTimestamp: serverTimestamp(),
        });
      } catch (err) {
        console.error('Firestore settings update error:', err);
      }
    }

    await this.addAuditLog({
      userId: updatedBy,
      userName: 'Administrator',
      userRole: 'principal',
      action: 'UPDATE_COLLEGE_SETTINGS',
      affectedRecordId: 'main',
      reason: 'Institutional settings revised',
    });

    return updated;
  }

  // --- Departments ---
  static async getDepartments(): Promise<Department[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'departments'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as Department);
          saveLocal(KEYS.DEPARTMENTS, list);
          return list;
        }
      } catch (err) {
        console.warn('Firestore departments fetch fallback:', err);
      }
    }
    return loadLocal<Department[]>(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  }

  static async saveDepartment(dept: Department, actingUserId: string): Promise<void> {
    const list = await this.getDepartments();
    const existingIdx = list.findIndex((d) => d.id === dept.id);
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...dept, updatedAt: new Date().toISOString() };
    } else {
      list.push(dept);
    }
    saveLocal(KEYS.DEPARTMENTS, list);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'departments', dept.id), dept);
      } catch (e) {
        console.error('Firestore save department error:', e);
      }
    }

    await this.addAuditLog({
      userId: actingUserId,
      userName: 'Principal',
      userRole: 'principal',
      action: existingIdx >= 0 ? 'UPDATE_DEPARTMENT' : 'CREATE_DEPARTMENT',
      affectedRecordId: dept.id,
      updatedValue: dept.name,
    });
  }

  // --- Users & Faculty Management ---
  static async getUsers(): Promise<User[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          const users = snap.docs.map((d) => d.data() as User);
          saveLocal(KEYS.USERS, users);
          return users;
        }
      } catch (e) {
        console.warn('Firestore users fallback:', e);
      }
    }
    return loadLocal<User[]>(KEYS.USERS, INITIAL_USERS);
  }

  static async getUser(uid: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.uid === uid) || null;
  }

  static async saveUser(user: User, actingUserId: string): Promise<void> {
    const list = await this.getUsers();
    const idx = list.findIndex((u) => u.uid === user.uid);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...user, updatedAt: new Date().toISOString() };
    } else {
      list.push(user);
    }
    saveLocal(KEYS.USERS, list);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'users', user.uid), user);
      } catch (e) {
        console.error('Firestore save user error:', e);
      }
    }

    await this.addAuditLog({
      userId: actingUserId,
      userName: 'Administrator',
      userRole: 'hod',
      action: idx >= 0 ? 'UPDATE_FACULTY' : 'CREATE_FACULTY',
      affectedRecordId: user.uid,
      updatedValue: `${user.fullName} (${user.employeeId})`,
    });
  }

  static async toggleUserStatus(uid: string, isActive: boolean, actingUserId: string, reason?: string): Promise<void> {
    const user = await this.getUser(uid);
    if (!user) return;
    user.isActive = isActive;
    user.updatedAt = new Date().toISOString();
    await this.saveUser(user, actingUserId);

    await this.addAuditLog({
      userId: actingUserId,
      userName: 'Administrator',
      userRole: 'hod',
      action: isActive ? 'REACTIVATE_FACULTY' : 'DEACTIVATE_FACULTY',
      affectedRecordId: uid,
      reason: reason || (isActive ? 'Faculty reactivated' : 'Faculty deactivated'),
    });
  }

  // --- Daily Logs (Deterministic doc ID: facultyId_YYYY-MM-DD) ---
  static async getDailyLogs(filters?: {
    facultyId?: string;
    departmentId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    submissionStatus?: string;
  }): Promise<DailyLog[]> {
    let logs: DailyLog[] = [];

    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'dailyLogs'));
        if (!snap.empty) {
          logs = snap.docs.map((d) => d.data() as DailyLog);
          saveLocal(KEYS.DAILY_LOGS, logs);
        }
      } catch (e) {
        console.warn('Firestore daily logs fallback:', e);
      }
    }

    if (logs.length === 0) {
      logs = loadLocal<DailyLog[]>(KEYS.DAILY_LOGS, generateInitialDailyLogs());
    }

    // Apply filters
    if (filters) {
      if (filters.facultyId) {
        logs = logs.filter((l) => l.facultyId === filters.facultyId);
      }
      if (filters.departmentId) {
        logs = logs.filter((l) => l.departmentId === filters.departmentId);
      }
      if (filters.date) {
        logs = logs.filter((l) => l.date === filters.date);
      }
      if (filters.startDate) {
        logs = logs.filter((l) => l.date >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter((l) => l.date <= filters.endDate!);
      }
      if (filters.submissionStatus) {
        logs = logs.filter((l) => l.submissionStatus === filters.submissionStatus);
      }
    }

    return logs.sort((a, b) => b.date.localeCompare(a.date));
  }

  static async getDailyLog(id: string): Promise<DailyLog | null> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'dailyLogs', id));
        if (snap.exists()) {
          return snap.data() as DailyLog;
        }
      } catch (e) {
        console.warn('Firestore single log fetch fallback:', e);
      }
    }
    const all = await this.getDailyLogs();
    return all.find((l) => l.id === id) || null;
  }

  static async saveDailyLog(log: DailyLog, actingUserId: string): Promise<void> {
    const list = await this.getDailyLogs();
    const idx = list.findIndex((l) => l.id === log.id);
    const updatedLog = {
      ...log,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      list[idx] = updatedLog;
    } else {
      list.push(updatedLog);
    }
    saveLocal(KEYS.DAILY_LOGS, list);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'dailyLogs', log.id), updatedLog);
      } catch (e) {
        console.error('Firestore save log error:', e);
      }
    }
  }

  // Workflow: Approve / Return / Reopen
  static async updateLogStatus(
    logId: string,
    action: 'submit' | 'approve' | 'return' | 'reopen',
    actor: User,
    remarks?: string,
    reason?: string
  ): Promise<DailyLog> {
    const log = await this.getDailyLog(logId);
    if (!log) throw new Error('Daily log not found');

    const now = new Date().toISOString();

    if (action === 'submit') {
      log.submissionStatus = 'submitted';
      log.submittedAt = now;
      if (reason) {
        log.isLateSubmission = true;
        log.lateSubmissionReason = reason;
      }
      await this.addAuditLog({
        userId: actor.uid,
        userName: actor.fullName,
        userRole: actor.role,
        action: 'SUBMIT_DAILY_REGISTER',
        affectedRecordId: logId,
        reason: reason || 'Standard daily register submission',
      });
      // Notify HOD
      await this.addNotification({
        userId: log.departmentId, // broadcasts to dept HODs
        title: 'New Register Submitted',
        message: `${log.facultyName} submitted daily register for ${log.date}.`,
        type: 'submission',
      });
    } else if (action === 'approve') {
      log.submissionStatus = 'approved';
      log.reviewedBy = actor.uid;
      log.reviewedByName = actor.fullName;
      log.reviewedAt = now;
      log.approvalRemarks = remarks || 'Approved as submitted.';
      await this.addAuditLog({
        userId: actor.uid,
        userName: actor.fullName,
        userRole: actor.role,
        action: 'APPROVE_DAILY_REGISTER',
        affectedRecordId: logId,
        reason: remarks,
      });
      // Notify Faculty
      await this.addNotification({
        userId: log.facultyId,
        title: 'Register Approved',
        message: `Your activity register for ${log.date} has been approved by ${actor.fullName}.`,
        type: 'approval',
      });
    } else if (action === 'return') {
      log.submissionStatus = 'returned_for_correction';
      log.reviewedBy = actor.uid;
      log.reviewedByName = actor.fullName;
      log.reviewedAt = now;
      log.returnRemarks = remarks || 'Correction needed.';
      log.revisionNumber = (log.revisionNumber || 1) + 1;
      await this.addAuditLog({
        userId: actor.uid,
        userName: actor.fullName,
        userRole: actor.role,
        action: 'RETURN_DAILY_REGISTER',
        affectedRecordId: logId,
        reason: remarks,
      });
      // Notify Faculty
      await this.addNotification({
        userId: log.facultyId,
        title: 'Register Returned for Correction',
        message: `Your register for ${log.date} was returned: ${remarks}`,
        type: 'return',
      });
    } else if (action === 'reopen') {
      log.submissionStatus = 'under_review';
      log.reopenedBy = actor.uid;
      log.reopenedAt = now;
      log.reopenReason = reason || 'Reopened for administrative review';
      await this.addAuditLog({
        userId: actor.uid,
        userName: actor.fullName,
        userRole: actor.role,
        action: 'REOPEN_APPROVED_REGISTER',
        affectedRecordId: logId,
        reason,
      });
    }

    await this.saveDailyLog(log, actor.uid);
    return log;
  }

  // --- Timetables ---
  static async getTimetables(departmentId?: string, facultyId?: string): Promise<TimetableEntry[]> {
    let list = loadLocal<TimetableEntry[]>(KEYS.TIMETABLES, INITIAL_TIMETABLES);
    if (departmentId) list = list.filter((t) => t.departmentId === departmentId);
    if (facultyId) list = list.filter((t) => t.facultyId === facultyId);
    return list;
  }

  static async saveTimetableEntry(entry: TimetableEntry, actingUserId: string): Promise<void> {
    const list = await this.getTimetables();
    const idx = list.findIndex((t) => t.id === entry.id);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.push(entry);
    }
    saveLocal(KEYS.TIMETABLES, list);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'timetables', entry.id), entry);
      } catch (e) {
        console.error('Firestore save timetable error:', e);
      }
    }
  }

  static async deleteTimetableEntry(id: string): Promise<void> {
    let list = await this.getTimetables();
    list = list.filter((t) => t.id !== id);
    saveLocal(KEYS.TIMETABLES, list);
  }

  // --- Holidays ---
  static async getHolidays(): Promise<Holiday[]> {
    return loadLocal<Holiday[]>(KEYS.HOLIDAYS, INITIAL_HOLIDAYS);
  }

  static async saveHoliday(h: Holiday, actingUserId: string): Promise<void> {
    const list = await this.getHolidays();
    const idx = list.findIndex((x) => x.id === h.id);
    if (idx >= 0) list[idx] = h;
    else list.push(h);
    saveLocal(KEYS.HOLIDAYS, list);

    await this.addAuditLog({
      userId: actingUserId,
      userName: 'Principal',
      userRole: 'principal',
      action: 'UPDATE_CALENDAR_HOLIDAY',
      affectedRecordId: h.id,
      updatedValue: `${h.title} (${h.date})`,
    });
  }

  // --- Leave Records ---
  static async getLeaveRecords(departmentId?: string, facultyId?: string): Promise<LeaveRecord[]> {
    let list = loadLocal<LeaveRecord[]>(KEYS.LEAVES, []);
    if (departmentId) list = list.filter((l) => l.departmentId === departmentId);
    if (facultyId) list = list.filter((l) => l.facultyId === facultyId);
    return list;
  }

  static async saveLeaveRecord(record: LeaveRecord, actingUserId: string): Promise<void> {
    const list = await this.getLeaveRecords();
    const idx = list.findIndex((l) => l.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    saveLocal(KEYS.LEAVES, list);

    await this.addAuditLog({
      userId: actingUserId,
      userName: 'HOD',
      userRole: 'hod',
      action: 'RECORD_LEAVE',
      affectedRecordId: record.id,
      updatedValue: `${record.facultyName} - ${record.leaveType} (${record.startDate})`,
    });
  }

  // --- Announcements ---
  static async getAnnouncements(departmentId?: string): Promise<Announcement[]> {
    let list = loadLocal<Announcement[]>(KEYS.ANNOUNCEMENTS, [
      {
        id: 'ann_1',
        title: 'NAAC Peer Team Visit - Documentation Review',
        content: 'All faculty members and HODs are requested to ensure all daily activity logs and course files are updated up to date for internal academic audit.',
        type: 'college',
        priority: 'urgent',
        createdBy: 'user_principal',
        authorName: 'Dr. K. Satyanarayana (Principal)',
        authorRole: 'principal',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ann_2',
        title: 'Submission Deadline Reminder (03:55 PM)',
        content: 'Please submit your daily activity registers promptly after 03:55 PM daily. Late submissions require justification.',
        type: 'college',
        priority: 'normal',
        createdBy: 'user_principal',
        authorName: 'Academic Office',
        authorRole: 'principal',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
    if (departmentId) {
      list = list.filter((a) => a.type === 'college' || a.departmentId === departmentId);
    }
    return list;
  }

  static async saveAnnouncement(ann: Announcement, actingUserId: string): Promise<void> {
    const list = await this.getAnnouncements();
    list.unshift(ann);
    saveLocal(KEYS.ANNOUNCEMENTS, list);

    await this.addAuditLog({
      userId: actingUserId,
      userName: ann.authorName,
      userRole: ann.authorRole,
      action: 'PUBLISH_ANNOUNCEMENT',
      affectedRecordId: ann.id,
      updatedValue: ann.title,
    });
  }

  // --- Audit Trail ---
  static async getAuditLogs(): Promise<AuditLog[]> {
    return loadLocal<AuditLog[]>(KEYS.AUDIT_LOGS, [
      {
        id: 'aud_init_1',
        userId: 'system',
        userName: 'System Initializer',
        userRole: 'principal',
        action: 'SYSTEM_BOOTSTRAP',
        affectedRecordId: 'giits_root',
        timestamp: new Date().toISOString(),
        reason: 'Initial setup of GIITS Faculty Daily Activity Register',
      },
    ]);
  }

  static async addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const list = await this.getAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
    };
    list.unshift(newLog);
    // Keep max 200 audit logs locally
    if (list.length > 200) list.pop();
    saveLocal(KEYS.AUDIT_LOGS, list);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      } catch (e) {
        console.error('Firestore audit log write error:', e);
      }
    }
  }

  // --- Notifications ---
  static async getNotifications(userId?: string): Promise<NotificationItem[]> {
    let list = loadLocal<NotificationItem[]>(KEYS.NOTIFICATIONS, [
      {
        id: 'notif_1',
        userId: 'user_fac_cse_1',
        title: 'Daily Log Submitted',
        message: 'Your register for today has been recorded and submitted to HOD CSE for review.',
        type: 'submission',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    if (userId) {
      list = list.filter((n) => n.userId === userId || n.userId === 'all');
    }
    return list;
  }

  static async addNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
    const list = await this.getNotifications();
    const item: NotificationItem = {
      ...notif,
      id: 'notif_' + Date.now(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    list.unshift(item);
    saveLocal(KEYS.NOTIFICATIONS, list);
  }

  static async markNotificationRead(id: string): Promise<void> {
    const list = await this.getNotifications();
    const found = list.find((n) => n.id === id);
    if (found) {
      found.isRead = true;
      saveLocal(KEYS.NOTIFICATIONS, list);
    }
  }

  // Reset to sample initial state
  static resetDemoData(): void {
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.DEPARTMENTS);
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.TIMETABLES);
    localStorage.removeItem(KEYS.DAILY_LOGS);
    localStorage.removeItem(KEYS.HOLIDAYS);
    localStorage.removeItem(KEYS.LEAVES);
    localStorage.removeItem(KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(KEYS.AUDIT_LOGS);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    window.location.reload();
  }
}
