import { Department, User, CollegeSettings, AcademicYear, TimetableEntry, DailyLog, Holiday } from '@/types';
import { DEFAULT_TIMINGS, getCurrentTimingState } from './timings';

export const INITIAL_COLLEGE_SETTINGS: CollegeSettings = {
  collegeName: 'Gonna Institute of Information Technology and Sciences',
  collegeCode: 'GIITS',
  tagline: 'Approved by AICTE, Affiliated to JNTUGV | Visakhapatnam, Andhra Pradesh',
  logoUrl: '', // Allow principal to upload custom logo
  address: 'Gonnavanipalem, Aganampudi, Visakhapatnam - 530053, Andhra Pradesh',
  academicYear: '2026-2027',
  currentSemester: 'EVEN',
  timings: DEFAULT_TIMINGS,
  reminderTime: '16:00',
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Init',
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
  {
    id: 'ay_2025_2026',
    name: '2025-2026',
    startDate: '2025-06-16',
    endDate: '2026-05-16',
    currentSemester: 'EVEN',
    isActive: false,
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept_cse',
    name: 'Computer Science and Engineering',
    code: 'CSE',
    hodId: 'user_hod_cse',
    hodName: 'Dr. V. Ramesh',
    activeFacultyCount: 4,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_ece',
    name: 'Electronics and Communication Engineering',
    code: 'ECE',
    hodId: 'user_hod_ece',
    hodName: 'Dr. S. Anitha',
    activeFacultyCount: 3,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_eee',
    name: 'Electrical and Electronics Engineering',
    code: 'EEE',
    hodId: 'user_hod_eee',
    hodName: 'Dr. P. Suresh',
    activeFacultyCount: 2,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_mech',
    name: 'Mechanical Engineering',
    code: 'MECH',
    activeFacultyCount: 2,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_civil',
    name: 'Civil Engineering',
    code: 'CIVIL',
    activeFacultyCount: 2,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_aiml',
    name: 'Artificial Intelligence and Machine Learning',
    code: 'AIML',
    activeFacultyCount: 3,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept_hs',
    name: 'Humanities and Sciences',
    code: 'H&S',
    activeFacultyCount: 3,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_USERS: User[] = [
  // Principal
  {
    uid: 'user_principal',
    employeeId: 'GIITS-DIR-001',
    fullName: 'Dr. K. Satyanarayana',
    email: 'principal@giits.edu.in',
    role: 'principal',
    departmentId: '',
    departmentName: 'Administration',
    designation: 'Professor',
    qualification: 'M.Tech, Ph.D. (IITM)',
    mobileNumber: '+91 98480 12345',
    dateOfJoining: '2018-05-10',
    employmentStatus: 'Regular',
    assignedSubjects: [],
    assignedClasses: [],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // HOD CSE
  {
    uid: 'user_hod_cse',
    employeeId: 'GIITS-CSE-001',
    fullName: 'Dr. V. Ramesh',
    email: 'hod.cse@giits.edu.in',
    role: 'hod',
    departmentId: 'dept_cse',
    departmentName: 'Computer Science and Engineering',
    designation: 'Professor',
    qualification: 'M.Tech, Ph.D.',
    mobileNumber: '+91 94401 23456',
    dateOfJoining: '2019-06-12',
    employmentStatus: 'Regular',
    assignedSubjects: ['Distributed Systems', 'Cloud Computing'],
    assignedClasses: ['IV-CSE-A', 'III-CSE-B'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // Faculty CSE 1
  {
    uid: 'user_fac_cse_1',
    employeeId: 'GIITS-CSE-012',
    fullName: 'Mr. B. Praveen Kumar',
    email: 'praveen.cse@giits.edu.in',
    role: 'faculty',
    departmentId: 'dept_cse',
    departmentName: 'Computer Science and Engineering',
    designation: 'Assistant Professor',
    qualification: 'M.Tech (CSE)',
    mobileNumber: '+91 98765 43210',
    dateOfJoining: '2021-07-15',
    employmentStatus: 'Regular',
    assignedSubjects: ['Database Management Systems', 'Web Development Lab'],
    assignedClasses: ['III-CSE-A', 'II-CSE-B'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // Faculty CSE 2
  {
    uid: 'user_fac_cse_2',
    employeeId: 'GIITS-CSE-015',
    fullName: 'Mrs. T. Lakshmi',
    email: 'lakshmi.cse@giits.edu.in',
    role: 'faculty',
    departmentId: 'dept_cse',
    departmentName: 'Computer Science and Engineering',
    designation: 'Assistant Professor',
    qualification: 'M.Tech (Software Engg)',
    mobileNumber: '+91 98491 55667',
    dateOfJoining: '2022-08-01',
    employmentStatus: 'Regular',
    assignedSubjects: ['Operating Systems', 'Python Programming'],
    assignedClasses: ['II-CSE-A', 'II-CSE-B'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // HOD ECE
  {
    uid: 'user_hod_ece',
    employeeId: 'GIITS-ECE-001',
    fullName: 'Dr. S. Anitha',
    email: 'hod.ece@giits.edu.in',
    role: 'hod',
    departmentId: 'dept_ece',
    departmentName: 'Electronics and Communication Engineering',
    designation: 'Professor',
    qualification: 'M.Tech, Ph.D.',
    mobileNumber: '+91 98481 99887',
    dateOfJoining: '2020-02-10',
    employmentStatus: 'Regular',
    assignedSubjects: ['Digital Signal Processing', 'VLSI Design'],
    assignedClasses: ['IV-ECE-A'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // Faculty ECE 1
  {
    uid: 'user_fac_ece_1',
    employeeId: 'GIITS-ECE-010',
    fullName: 'Mr. K. Ravi Teja',
    email: 'ravi.ece@giits.edu.in',
    role: 'faculty',
    departmentId: 'dept_ece',
    departmentName: 'Electronics and Communication Engineering',
    designation: 'Assistant Professor',
    qualification: 'M.Tech',
    mobileNumber: '+91 97012 34567',
    dateOfJoining: '2021-11-20',
    employmentStatus: 'Regular',
    assignedSubjects: ['Analog Circuits', 'Communication Systems Lab'],
    assignedClasses: ['II-ECE-A'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // HOD EEE
  {
    uid: 'user_hod_eee',
    employeeId: 'GIITS-EEE-001',
    fullName: 'Dr. P. Suresh',
    email: 'hod.eee@giits.edu.in',
    role: 'hod',
    departmentId: 'dept_eee',
    departmentName: 'Electrical and Electronics Engineering',
    designation: 'Professor',
    qualification: 'M.Tech, Ph.D.',
    mobileNumber: '+91 99887 76655',
    dateOfJoining: '2019-10-01',
    employmentStatus: 'Regular',
    assignedSubjects: ['Power Systems', 'Control Systems'],
    assignedClasses: ['III-EEE-A'],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: 'hol_1',
    date: '2026-08-15',
    title: 'Independence Day',
    type: 'holiday',
    description: 'National Holiday',
  },
  {
    id: 'hol_2',
    date: '2026-10-02',
    title: 'Gandhi Jayanti',
    type: 'holiday',
    description: 'National Holiday',
  },
  {
    id: 'hol_3',
    date: '2026-11-01',
    title: 'Andhra Pradesh Formation Day',
    type: 'event',
    description: 'State Celebration',
  },
  {
    id: 'hol_4',
    date: '2026-12-25',
    title: 'Christmas',
    type: 'holiday',
    description: 'Public Holiday',
  },
  {
    id: 'hol_5',
    date: '2027-01-14',
    title: 'Makara Sankranti',
    type: 'holiday',
    description: 'Harvest Festival',
  },
  {
    id: 'hol_6',
    date: '2027-01-26',
    title: 'Republic Day',
    type: 'holiday',
    description: 'National Holiday',
  },
];

// Sample timetables for faculty
export const INITIAL_TIMETABLES: TimetableEntry[] = [
  // Mr. B. Praveen Kumar (CSE) - Monday to Saturday
  // Monday
  {
    id: 'tt_csep_mon_1',
    departmentId: 'dept_cse',
    facultyId: 'user_fac_cse_1',
    day: 'Monday',
    periodNumber: 1,
    subjectName: 'Database Management Systems',
    subjectCode: 'CS301PC',
    year: 'III',
    semester: 'I',
    section: 'A',
    roomOrLab: 'LH-201',
    activityType: 'Theory Class',
  },
  {
    id: 'tt_csep_mon_2',
    departmentId: 'dept_cse',
    facultyId: 'user_fac_cse_1',
    day: 'Monday',
    periodNumber: 2,
    subjectName: 'Free Period / Prep',
    subjectCode: '',
    year: '',
    semester: '',
    section: '',
    activityType: 'Lesson Preparation',
  },
  {
    id: 'tt_csep_mon_3',
    departmentId: 'dept_cse',
    facultyId: 'user_fac_cse_1',
    day: 'Monday',
    periodNumber: 3,
    subjectName: 'Database Management Systems',
    subjectCode: 'CS301PC',
    year: 'III',
    semester: 'I',
    section: 'B',
    roomOrLab: 'LH-202',
    activityType: 'Theory Class',
  },
  {
    id: 'tt_csep_mon_4',
    departmentId: 'dept_cse',
    facultyId: 'user_fac_cse_1',
    day: 'Monday',
    periodNumber: 4,
    subjectName: 'Student Mentoring',
    subjectCode: '',
    year: 'III',
    semester: 'I',
    section: 'A',
    activityType: 'Student Mentoring',
  },
  {
    id: 'tt_csep_mon_5',
    departmentId: 'dept_cse',
    facultyId: 'user_fac_cse_1',
    day: 'Monday',
    periodNumber: 5,
    subjectName: 'Web Development Lab',
    subjectCode: 'CS305PC',
    year: 'III',
    semester: 'I',
    section: 'A',
    roomOrLab: 'Computer Lab 3',
    activityType: 'Laboratory Class',
    isLab: true,
    continuousSpan: 3,
  },
  {
    id: 'tt_csep_mon_6',
    departmentId: 'dept_cse',
    facultyId: 'user_fac_cse_1',
    day: 'Monday',
    periodNumber: 6,
    subjectName: 'Web Development Lab',
    subjectCode: 'CS305PC',
    year: 'III',
    semester: 'I',
    section: 'A',
    roomOrLab: 'Computer Lab 3',
    activityType: 'Laboratory Class',
    isLab: true,
  },
  {
    id: 'tt_csep_mon_7',
    departmentId: 'dept_cse',
    facultyId: 'user_fac_cse_1',
    day: 'Monday',
    periodNumber: 7,
    subjectName: 'Web Development Lab',
    subjectCode: 'CS305PC',
    year: 'III',
    semester: 'I',
    section: 'A',
    roomOrLab: 'Computer Lab 3',
    activityType: 'Laboratory Class',
    isLab: true,
  },

  // Dr. V. Ramesh (HOD CSE) - Monday
  {
    id: 'tt_cser_mon_1',
    departmentId: 'dept_cse',
    facultyId: 'user_hod_cse',
    day: 'Monday',
    periodNumber: 1,
    subjectName: 'Departmental Review & HOD Work',
    subjectCode: '',
    year: '',
    semester: '',
    section: '',
    activityType: 'Departmental Work',
  },
  {
    id: 'tt_cser_mon_2',
    departmentId: 'dept_cse',
    facultyId: 'user_hod_cse',
    day: 'Monday',
    periodNumber: 2,
    subjectName: 'Distributed Systems',
    subjectCode: 'CS402PC',
    year: 'IV',
    semester: 'I',
    section: 'A',
    roomOrLab: 'LH-301',
    activityType: 'Theory Class',
  },
  {
    id: 'tt_cser_mon_3',
    departmentId: 'dept_cse',
    facultyId: 'user_hod_cse',
    day: 'Monday',
    periodNumber: 3,
    subjectName: 'Administrative & NAAC Work',
    subjectCode: '',
    year: '',
    semester: '',
    section: '',
    activityType: 'NAAC Documentation',
  },
  {
    id: 'tt_cser_mon_4',
    departmentId: 'dept_cse',
    facultyId: 'user_hod_cse',
    day: 'Monday',
    periodNumber: 4,
    subjectName: 'Cloud Computing',
    subjectCode: 'CS304PC',
    year: 'III',
    semester: 'I',
    section: 'B',
    roomOrLab: 'LH-203',
    activityType: 'Theory Class',
  },
  {
    id: 'tt_cser_mon_5',
    departmentId: 'dept_cse',
    facultyId: 'user_hod_cse',
    day: 'Monday',
    periodNumber: 5,
    subjectName: 'Research and Development',
    subjectCode: '',
    year: '',
    semester: '',
    section: '',
    activityType: 'Research and Development',
  },
  {
    id: 'tt_cser_mon_6',
    departmentId: 'dept_cse',
    facultyId: 'user_hod_cse',
    day: 'Monday',
    periodNumber: 6,
    subjectName: 'Faculty Meeting & Monitoring',
    subjectCode: '',
    year: '',
    semester: '',
    section: '',
    activityType: 'Faculty Meeting',
  },
  {
    id: 'tt_cser_mon_7',
    departmentId: 'dept_cse',
    facultyId: 'user_hod_cse',
    day: 'Monday',
    periodNumber: 7,
    subjectName: 'Department Verification',
    subjectCode: '',
    year: '',
    semester: '',
    section: '',
    activityType: 'Departmental Work',
  },
];

/**
 * Generate a blank or default 7-period DailyLog template for a given faculty and date
 */
export function generateDefaultDailyLog(
  user: User,
  dateStr: string,
  timings: typeof DEFAULT_TIMINGS = DEFAULT_TIMINGS,
  timetables: TimetableEntry[] = INITIAL_TIMETABLES
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
      studentsPresent: matchedTT?.activityType === 'Theory Class' || matchedTT?.activityType === 'Laboratory Class' ? 58 : undefined,
      totalStudents: 64,
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
 * Generate initial sample logs for demonstration
 */
export function generateInitialDailyLogs(): DailyLog[] {
  const timingState = getCurrentTimingState();
  const today = timingState.dateKey;

  // 1. Praveen Kumar's log for today (submitted)
  const praveen = INITIAL_USERS.find((u) => u.uid === 'user_fac_cse_1')!;
  const log1 = generateDefaultDailyLog(praveen, today);
  log1.submissionStatus = 'submitted';
  log1.submittedAt = `${today}T16:05:00.000Z`;
  log1.dailySummary = 'Completed all scheduled DBMS lectures and conducted Web Technologies Lab sessions. Attendance average was 92%.';
  log1.periods = log1.periods.map((p, idx) => ({
    ...p,
    status: 'completed',
    topicCovered: idx === 0 
      ? 'Normalization up to BCNF with real-world banking schema examples' 
      : idx === 2 
      ? 'Relational Algebra Query optimization and cost evaluation' 
      : idx >= 4 
      ? 'Experiment 4: Responsive dashboard development with CSS Grid and Fetch API' 
      : 'Lesson planning and student query resolution',
    studentsPresent: 59,
    totalStudents: 64,
    remarks: 'Active student participation throughout the session.',
  }));

  // 2. Mrs Lakshmi's log for today (draft in progress)
  const lakshmi = INITIAL_USERS.find((u) => u.uid === 'user_fac_cse_2')!;
  const log2 = generateDefaultDailyLog(lakshmi, today);
  log2.submissionStatus = 'draft';
  log2.periods[0].status = 'completed';
  log2.periods[0].actualActivity = 'Theory Class';
  log2.periods[0].subjectName = 'Operating Systems';
  log2.periods[0].topicCovered = 'CPU Scheduling: Round Robin and Multilevel Queue Scheduling';
  log2.periods[0].studentsPresent = 55;

  // 3. ECE Ravi Teja's log for today (approved)
  const ravi = INITIAL_USERS.find((u) => u.uid === 'user_fac_ece_1')!;
  const log3 = generateDefaultDailyLog(ravi, today);
  log3.submissionStatus = 'approved';
  log3.submittedAt = `${today}T16:10:00.000Z`;
  log3.reviewedBy = 'user_hod_ece';
  log3.reviewedByName = 'Dr. S. Anitha';
  log3.reviewedAt = `${today}T16:30:00.000Z`;
  log3.approvalRemarks = 'Well documented analog circuit lab records. Verified topic completion.';
  log3.periods = log3.periods.map((p) => ({ ...p, status: 'completed', topicCovered: 'Operational amplifier frequency response and filter circuits.' }));

  // 4. HOD CSE log for today (submitted to Principal)
  const hodCse = INITIAL_USERS.find((u) => u.uid === 'user_hod_cse')!;
  const log4 = generateDefaultDailyLog(hodCse, today);
  log4.submissionStatus = 'submitted';
  log4.submittedAt = `${today}T16:20:00.000Z`;
  log4.dailySummary = 'Reviewed 3rd year syllabus coverage, attended NAAC criteria 2 documentation meeting, and conducted IV-CSE Distributed Systems lecture.';
  log4.periods = log4.periods.map((p) => ({ ...p, status: 'completed' }));

  return [log1, log2, log3, log4];
}
