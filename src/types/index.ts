export type UserRole = 'principal' | 'hod' | 'faculty';

export type Designation =
  | 'Professor'
  | 'Associate Professor'
  | 'Assistant Professor'
  | 'Lecturer'
  | 'Lab Instructor'
  | 'Other';

export interface User {
  uid: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName?: string;
  designation: Designation;
  qualification: string;
  mobileNumber: string;
  photoURL?: string;
  dateOfJoining: string;
  employmentStatus: 'Regular' | 'Contract' | 'Ad-hoc' | 'Visiting';
  assignedSubjects: string[];
  assignedClasses: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hodId?: string;
  hodName?: string;
  activeFacultyCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026-2027"
  startDate: string;
  endDate: string;
  currentSemester: 'ODD' | 'EVEN';
  isActive: boolean;
}

export interface CollegeTiming {
  periodNumber: number; // 0 for breaks or 1-7 for academic periods
  name: string;
  startTime: string; // "09:30 AM"
  endTime: string;   // "10:20 AM"
  startMinutes: number; // Minutes from 00:00 (e.g. 570)
  endMinutes: number;   // Minutes from 00:00
  isBreak: boolean;
  breakType?: 'short_break' | 'lunch_break';
}

export type AcademicActivityType =
  | 'Theory Class'
  | 'Laboratory Class'
  | 'Tutorial'
  | 'Remedial Class'
  | 'Class Substitution'
  | 'Student Mentoring'
  | 'Project Guidance'
  | 'Seminar'
  | 'Workshop'
  | 'Examination Duty'
  | 'Invigilation'
  | 'Answer Script Evaluation'
  | 'Lesson Preparation'
  | 'Question Paper Preparation'
  | 'Academic Documentation';

export type NonTeachingActivityType =
  | 'Research and Development'
  | 'Departmental Work'
  | 'Administrative Work'
  | 'Accreditation Work'
  | 'NAAC Documentation'
  | 'NBA Documentation'
  | 'Faculty Meeting'
  | 'Library Work'
  | 'Training'
  | 'Faculty Development Programme'
  | 'Placement Activity'
  | 'Admission Duty'
  | 'Institutional Activity';

export type OtherActivityType =
  | 'Free Period'
  | 'On Duty'
  | 'Casual Leave'
  | 'Medical Leave'
  | 'Approved Leave'
  | 'Other Activity';

export type ActivityType = AcademicActivityType | NonTeachingActivityType | OtherActivityType;

export type PeriodCompletionStatus = 'completed' | 'pending' | 'in_progress' | 'upcoming' | 'exempt';

export interface PeriodEntry {
  periodNumber: number; // 1 to 7
  startTime: string;
  endTime: string;
  scheduledActivity: string;
  actualActivity: string;
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;
  classId?: string;
  year?: string;
  semester?: string;
  section?: string;
  topicCovered?: string;
  studentsPresent?: number;
  totalStudents?: number;
  // Lab specific
  labName?: string;
  experimentNumber?: string;
  experimentTitle?: string;
  batch?: string;
  // Non-teaching specific
  workTitle?: string;
  outcome?: string;
  researchTitle?: string;
  progress?: string;
  // Leave specific
  leaveType?: string;
  approvalReference?: string;
  // General remarks
  description?: string;
  remarks?: string;
  status: PeriodCompletionStatus;
  isContinuousLab?: boolean;
  continuousPeriodSpan?: number;
  updatedAt: string;
}

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'returned_for_correction';

export interface DailyLog {
  id: string; // Deterministic: facultyId_YYYY-MM-DD
  facultyId: string;
  facultyName: string;
  employeeId: string;
  departmentId: string;
  departmentName: string;
  designation: Designation;
  academicYearId: string;
  date: string; // YYYY-MM-DD
  day: string; // e.g. "Monday"
  timetableVersionId?: string;
  periodConfigurationVersion?: number;
  periods: PeriodEntry[]; // Exactly 7 periods
  additionalActivities?: string;
  dailySummary?: string;
  submissionStatus: SubmissionStatus;
  submittedAt?: string;
  lateSubmissionReason?: string;
  isLateSubmission?: boolean;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  approvalRemarks?: string;
  returnRemarks?: string;
  reopenReason?: string;
  reopenedBy?: string;
  reopenedAt?: string;
  revisionNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableEntry {
  id: string;
  departmentId: string;
  facultyId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number; // 1 to 7
  subjectName: string;
  subjectCode: string;
  year: string;
  semester: string;
  section: string;
  roomOrLab?: string;
  activityType: ActivityType;
  isLab?: boolean;
  continuousSpan?: number; // e.g. 2 or 3 periods for lab
}

export interface TimetableVersion {
  id: string;
  departmentId: string;
  versionName: string;
  effectiveStartDate: string;
  academicYearId: string;
  semester: 'ODD' | 'EVEN';
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'holiday' | 'special_working_day' | 'exam_day' | 'event';
  description?: string;
}

export interface LeaveRecord {
  id: string;
  facultyId: string;
  facultyName: string;
  departmentId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  leaveType: 'Casual Leave' | 'Medical Leave' | 'On Duty' | 'Special Leave';
  isHalfDay: boolean;
  halfDaySession?: 'forenoon' | 'afternoon';
  periodSpecific?: number[]; // e.g. [1, 2]
  reason: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalRemarks?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Substitution {
  id: string;
  date: string; // YYYY-MM-DD
  periodNumber: number;
  originalFacultyId: string;
  originalFacultyName: string;
  substituteFacultyId: string;
  substituteFacultyName: string;
  departmentId: string;
  subjectName: string;
  section: string;
  status: 'assigned' | 'completed' | 'cancelled';
  reason?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  affectedRecordId: string;
  previousValue?: string;
  updatedValue?: string;
  reason?: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'college' | 'department';
  departmentId?: string;
  priority: 'normal' | 'urgent';
  createdBy: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'submission' | 'approval' | 'return' | 'reminder' | 'announcement' | 'substitution';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CollegeSettings {
  collegeName: string;
  collegeCode: string;
  tagline: string;
  logoUrl: string;
  address: string;
  academicYear: string;
  currentSemester: 'ODD' | 'EVEN';
  timings: CollegeTiming[];
  reminderTime: string; // e.g. "16:00"
  attendanceWarningThreshold?: number; // e.g. 75
  campusLatitude?: number; // e.g. 17.6868
  campusLongitude?: number; // e.g. 83.2185
  campusRadiusMeters?: number; // e.g. 1500
  updatedAt: string;
  updatedBy: string;
}
