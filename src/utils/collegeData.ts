import { Department, User, CollegeSettings, AcademicYear, TimetableEntry, DailyLog, Holiday } from '@/types';
import { DEFAULT_TIMINGS } from './timings';

export const INITIAL_COLLEGE_SETTINGS: CollegeSettings = {
  collegeName: 'Gonna Institute of Information Technology and Sciences',
  collegeCode: 'GIITS',
  tagline: 'Approved by AICTE, Affiliated to JNTUGV | Visakhapatnam, Andhra Pradesh',
  logoUrl: '/logo.png',
  address: 'Gonnavanipalem, Aganampudi, Visakhapatnam - 530053, Andhra Pradesh',
  academicYear: '2026-2027',
  currentSemester: 'EVEN',
  timings: DEFAULT_TIMINGS,
  reminderTime: '16:00',
  attendanceWarningThreshold: 75,
  campusLatitude: 17.6868,
  campusLongitude: 83.2185,
  campusRadiusMeters: 1500,
  updatedAt: new Date().toISOString(),
  updatedBy: 'pradeep4045t7@gmail.com',
};

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'ay_2026_2027',
    name: '2026-2027',
    startDate: '2026-06-15',
    endDate: '2027-05-15',
    currentSemester: 'EVEN',
    isActive: true,
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept_cse',
    name: 'Computer Science and Engineering',
    code: 'CSE',
    hodId: '',
    hodName: '',
    activeFacultyCount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept_ece',
    name: 'Electronics and Communication Engineering',
    code: 'ECE',
    hodId: '',
    hodName: '',
    activeFacultyCount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept_eee',
    name: 'Electrical and Electronics Engineering',
    code: 'EEE',
    hodId: '',
    hodName: '',
    activeFacultyCount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept_mech',
    name: 'Mechanical Engineering',
    code: 'MECH',
    hodId: '',
    hodName: '',
    activeFacultyCount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept_civil',
    name: 'Civil Engineering',
    code: 'CIVIL',
    hodId: '',
    hodName: '',
    activeFacultyCount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept_aiml',
    name: 'Artificial Intelligence and Machine Learning',
    code: 'AIML',
    hodId: '',
    hodName: '',
    activeFacultyCount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dept_hs',
    name: 'Humanities and Sciences',
    code: 'H&S',
    hodId: '',
    hodName: '',
    activeFacultyCount: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

// Sole authoritative initial user: Principal Dr P.S.N Murthy
export const INITIAL_USERS: User[] = [
  {
    uid: 'user_principal_pradeep',
    employeeId: 'GIITS-DIR-001',
    fullName: 'Dr P.S.N Murthy',
    email: 'pradeep4045t7@gmail.com',
    role: 'principal',
    departmentId: '',
    departmentName: 'GIITS Administration',
    designation: 'Professor',
    qualification: 'M.Tech, Ph.D.',
    mobileNumber: '',
    dateOfJoining: '2026-01-01',
    employmentStatus: 'Regular',
    assignedSubjects: [],
    assignedClasses: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    password: 'Pradeep@2005',
    initialPassword: 'Pradeep@2005',
  },
];

export const INITIAL_HOLIDAYS: Holiday[] = [];

export const INITIAL_TIMETABLES: TimetableEntry[] = [];

/**
 * Generate a blank 7-period DailyLog template for a given faculty and date
 */
export function generateDefaultDailyLog(
  user: User,
  dateStr: string,
  timings: typeof DEFAULT_TIMINGS = DEFAULT_TIMINGS,
  timetables: TimetableEntry[] = []
): DailyLog {
  const d = new Date(dateStr);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[d.getDay()];

  // Filter 7 academic periods
  const academicTimings = timings.filter((t) => !t.isBreak);

  // Find timetable entries for this day and user
  const dayTimetable = timetables.filter(
    (tt) => tt.facultyId === user.uid && tt.day.toLowerCase() === dayName.toLowerCase()
  );

  const periods = academicTimings.map((timing) => {
    const matchedTT = dayTimetable.find((tt) => tt.periodNumber === timing.periodNumber);
    const scheduled = matchedTT ? `${matchedTT.activityType} - ${matchedTT.subjectName}` : 'Free Period';
    
    return {
      periodNumber: timing.periodNumber,
      startTime: timing.startTime,
      endTime: timing.endTime,
      scheduledActivity: scheduled,
      actualActivity: matchedTT ? matchedTT.activityType : 'Free Period',
      subjectId: matchedTT?.subjectCode || '',
      subjectName: matchedTT?.subjectName || '',
      subjectCode: matchedTT?.subjectCode || '',
      year: matchedTT?.year || '',
      semester: matchedTT?.semester || '',
      section: matchedTT?.section || '',
      topicCovered: '',
      studentsPresent: undefined,
      totalStudents: 60,
      status: 'pending' as const,
      updatedAt: new Date().toISOString(),
    };
  });

  return {
    id: `${user.uid}_${dateStr}`,
    facultyId: user.uid,
    facultyName: user.fullName,
    employeeId: user.employeeId,
    departmentId: user.departmentId,
    departmentName: user.departmentName || '',
    designation: user.designation,
    academicYearId: 'ay_2026_2027',
    date: dateStr,
    day: dayName,
    periods,
    submissionStatus: 'draft',
    revisionNumber: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Returns empty array for daily logs (clean production state)
 */
export function generateInitialDailyLogs(): DailyLog[] {
  return [];
}
