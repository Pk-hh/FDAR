import { CollegeTiming } from '@/types';

export const DEFAULT_TIMINGS: CollegeTiming[] = [
  {
    periodNumber: 1,
    name: 'Period 1',
    startTime: '09:30 AM',
    endTime: '10:20 AM',
    startMinutes: 9 * 60 + 30, // 570
    endMinutes: 10 * 60 + 20,  // 620
    isBreak: false,
  },
  {
    periodNumber: 2,
    name: 'Period 2',
    startTime: '10:20 AM',
    endTime: '11:10 AM',
    startMinutes: 10 * 60 + 20, // 620
    endMinutes: 11 * 60 + 10,   // 670
    isBreak: false,
  },
  {
    periodNumber: 0,
    name: 'Short Break',
    startTime: '11:10 AM',
    endTime: '11:20 AM',
    startMinutes: 11 * 60 + 10, // 670
    endMinutes: 11 * 60 + 20,   // 680
    isBreak: true,
    breakType: 'short_break',
  },
  {
    periodNumber: 3,
    name: 'Period 3',
    startTime: '11:20 AM',
    endTime: '12:10 PM',
    startMinutes: 11 * 60 + 20, // 680
    endMinutes: 12 * 60 + 10,   // 730
    isBreak: false,
  },
  {
    periodNumber: 4,
    name: 'Period 4',
    startTime: '12:10 PM',
    endTime: '01:00 PM',
    startMinutes: 12 * 60 + 10, // 730
    endMinutes: 13 * 60,        // 780
    isBreak: false,
  },
  {
    periodNumber: 0,
    name: 'Lunch Break',
    startTime: '01:00 PM',
    endTime: '01:35 PM',
    startMinutes: 13 * 60,       // 780
    endMinutes: 13 * 60 + 35,   // 815
    isBreak: true,
    breakType: 'lunch_break',
  },
  {
    periodNumber: 5,
    name: 'Period 5',
    startTime: '01:35 PM',
    endTime: '02:25 PM',
    startMinutes: 13 * 60 + 35, // 815
    endMinutes: 14 * 60 + 25,   // 865
    isBreak: false,
  },
  {
    periodNumber: 6,
    name: 'Period 6',
    startTime: '02:25 PM',
    endTime: '03:10 PM',
    startMinutes: 14 * 60 + 25, // 865
    endMinutes: 15 * 60 + 10,   // 910
    isBreak: false,
  },
  {
    periodNumber: 7,
    name: 'Period 7',
    startTime: '03:10 PM',
    endTime: '03:55 PM',
    startMinutes: 15 * 60 + 10, // 910
    endMinutes: 15 * 60 + 55,   // 955
    isBreak: false,
  },
];

export const COLLEGE_START_MINUTES = 9 * 60 + 30; // 09:30 AM (570)
export const COLLEGE_END_MINUTES = 15 * 60 + 55;  // 03:55 PM (955)

/**
 * Returns current Date in Asia/Kolkata timezone
 */
export function getKolkataTime(): Date {
  const now = new Date();
  const kolkataString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(kolkataString);
}

/**
 * Converts a Date to total minutes from midnight
 */
export function getMinutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * Converts minutes to 12-hour formatted time (e.g. 570 -> "09:30 AM")
 */
export function minutesToFormattedTime(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours12)}:${pad(minutes)} ${period}`;
}

/**
 * Converts "09:30 AM" string to minutes from midnight
 */
export function formattedTimeToMinutes(timeStr: string): number {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export interface CurrentTimingState {
  currentTimeFormatted: string;
  currentDateFormatted: string;
  dayName: string;
  dateKey: string; // YYYY-MM-DD
  currentMinutes: number;
  status: 'before_college' | 'in_period' | 'in_break' | 'after_college';
  statusText: string;
  currentPeriod: CollegeTiming | null;
  nextPeriod: CollegeTiming | null;
  remainingMinutesInCurrent: number;
  isCollegeHoursCompleted: boolean;
  canFinalSubmit: boolean;
}

export function getCurrentTimingState(
  timings: CollegeTiming[] = DEFAULT_TIMINGS,
  customDate?: Date
): CurrentTimingState {
  const kolkataNow = customDate || getKolkataTime();
  const currentMinutes = getMinutesFromMidnight(kolkataNow);
  
  // Formatters
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[kolkataNow.getDay()];
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateKey = `${kolkataNow.getFullYear()}-${pad(kolkataNow.getMonth() + 1)}-${pad(kolkataNow.getDate())}`;

  const currentTimeFormatted = kolkataNow.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const currentDateFormatted = kolkataNow.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const collegeStart = timings[0]?.startMinutes ?? COLLEGE_START_MINUTES;
  const collegeEnd = timings[timings.length - 1]?.endMinutes ?? COLLEGE_END_MINUTES;

  let currentPeriod: CollegeTiming | null = null;
  let nextPeriod: CollegeTiming | null = null;
  let remainingMinutesInCurrent = 0;
  let status: CurrentTimingState['status'] = 'before_college';
  let statusText = 'College Starts at ' + (timings[0]?.startTime || '09:30 AM');

  if (currentMinutes < collegeStart) {
    status = 'before_college';
    statusText = `College Starts at ${timings[0]?.startTime || '09:30 AM'}`;
    nextPeriod = timings[0] || null;
  } else if (currentMinutes >= collegeEnd) {
    status = 'after_college';
    statusText = 'College Hours Completed';
  } else {
    // Find matching period or break
    for (let i = 0; i < timings.length; i++) {
      const item = timings[i];
      if (currentMinutes >= item.startMinutes && currentMinutes < item.endMinutes) {
        currentPeriod = item;
        remainingMinutesInCurrent = item.endMinutes - currentMinutes;
        nextPeriod = timings[i + 1] || null;
        if (item.isBreak) {
          status = 'in_break';
          statusText = `${item.name} (${remainingMinutesInCurrent} mins left)`;
        } else {
          status = 'in_period';
          statusText = `${item.name} (${remainingMinutesInCurrent} mins left)`;
        }
        break;
      }
    }
  }

  // Final submission allowed after college hours (03:55 PM) or during/after last period
  const canFinalSubmit = currentMinutes >= collegeEnd;
  const isCollegeHoursCompleted = currentMinutes >= collegeEnd;

  return {
    currentTimeFormatted,
    currentDateFormatted,
    dayName,
    dateKey,
    currentMinutes,
    status,
    statusText,
    currentPeriod,
    nextPeriod,
    remainingMinutesInCurrent,
    isCollegeHoursCompleted,
    canFinalSubmit,
  };
}

/**
 * Validate timing configurations to ensure no overlaps and correct order
 */
export function validateTimings(timings: CollegeTiming[]): { isValid: boolean; error?: string } {
  if (timings.length === 0) {
    return { isValid: false, error: 'At least one period/break must be defined.' };
  }

  for (let i = 0; i < timings.length; i++) {
    const cur = timings[i];
    if (cur.startMinutes >= cur.endMinutes) {
      return { isValid: false, error: `${cur.name}: Start time must be before end time.` };
    }
    if (i > 0) {
      const prev = timings[i - 1];
      if (cur.startMinutes < prev.endMinutes) {
        return { isValid: false, error: `Overlap detected between ${prev.name} and ${cur.name}.` };
      }
    }
  }

  const academicPeriods = timings.filter((t) => !t.isBreak);
  if (academicPeriods.length !== 7) {
    return { isValid: false, error: `Exactly 7 academic periods must be configured (Found: ${academicPeriods.length}).` };
  }

  return { isValid: true };
}
