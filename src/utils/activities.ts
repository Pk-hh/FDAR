import { AcademicActivityType, NonTeachingActivityType, OtherActivityType, ActivityType } from '@/types';

export const ACADEMIC_ACTIVITIES: { type: AcademicActivityType; label: string; icon: string }[] = [
  { type: 'Theory Class', label: 'Theory Class', icon: 'BookOpen' },
  { type: 'Laboratory Class', label: 'Laboratory Class', icon: 'FlaskConical' },
  { type: 'Tutorial', label: 'Tutorial', icon: 'HelpCircle' },
  { type: 'Remedial Class', label: 'Remedial Class', icon: 'GraduationCap' },
  { type: 'Class Substitution', label: 'Class Substitution', icon: 'UserCheck' },
  { type: 'Student Mentoring', label: 'Student Mentoring', icon: 'Users' },
  { type: 'Project Guidance', label: 'Project Guidance', icon: 'Compass' },
  { type: 'Seminar', label: 'Seminar', icon: 'Presentation' },
  { type: 'Workshop', label: 'Workshop', icon: 'Wrench' },
  { type: 'Examination Duty', label: 'Examination Duty', icon: 'FileText' },
  { type: 'Invigilation', label: 'Invigilation', icon: 'Eye' },
  { type: 'Answer Script Evaluation', label: 'Answer Script Evaluation', icon: 'CheckSquare' },
  { type: 'Lesson Preparation', label: 'Lesson Preparation', icon: 'FileEdit' },
  { type: 'Question Paper Preparation', label: 'Question Paper Preparation', icon: 'FileSignature' },
  { type: 'Academic Documentation', label: 'Academic Documentation', icon: 'FolderGit2' },
];

export const NON_TEACHING_ACTIVITIES: { type: NonTeachingActivityType; label: string; icon: string }[] = [
  { type: 'Research and Development', label: 'Research and Development (R&D)', icon: 'Atom' },
  { type: 'Departmental Work', label: 'Departmental Work', icon: 'Building2' },
  { type: 'Administrative Work', label: 'Administrative Work', icon: 'Briefcase' },
  { type: 'Accreditation Work', label: 'Accreditation Work', icon: 'Award' },
  { type: 'NAAC Documentation', label: 'NAAC Documentation', icon: 'ClipboardCheck' },
  { type: 'NBA Documentation', label: 'NBA Documentation', icon: 'ShieldCheck' },
  { type: 'Faculty Meeting', label: 'Faculty Meeting', icon: 'Users2' },
  { type: 'Library Work', label: 'Library Work', icon: 'Library' },
  { type: 'Training', label: 'Training', icon: 'TrendingUp' },
  { type: 'Faculty Development Programme', label: 'Faculty Development Programme (FDP)', icon: 'Award' },
  { type: 'Placement Activity', label: 'Placement Activity', icon: 'Target' },
  { type: 'Admission Duty', label: 'Admission Duty', icon: 'UserPlus' },
  { type: 'Institutional Activity', label: 'Institutional Activity', icon: 'Landmark' },
];

export const OTHER_STATUSES: { type: OtherActivityType; label: string; icon: string }[] = [
  { type: 'Free Period', label: 'Free Period', icon: 'Coffee' },
  { type: 'On Duty', label: 'On Duty (OD)', icon: 'BadgeAlert' },
  { type: 'Casual Leave', label: 'Casual Leave (CL)', icon: 'CalendarOff' },
  { type: 'Medical Leave', label: 'Medical Leave (ML)', icon: 'HeartPulse' },
  { type: 'Approved Leave', label: 'Approved Leave', icon: 'CalendarX' },
  { type: 'Other Activity', label: 'Other Activity', icon: 'MoreHorizontal' },
];

export function getActivityCategory(activity: ActivityType): 'academic' | 'non_teaching' | 'other' {
  if (ACADEMIC_ACTIVITIES.some((a) => a.type === activity)) return 'academic';
  if (NON_TEACHING_ACTIVITIES.some((a) => a.type === activity)) return 'non_teaching';
  return 'other';
}

export function getActivityColor(activity: string): { bg: string; text: string; border: string } {
  if (!activity) return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };

  if (activity === 'Free Period') {
    return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
  }

  if (activity === 'On Duty') {
    return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
  }

  if (activity.includes('Leave')) {
    return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
  }

  const category = getActivityCategory(activity as ActivityType);
  if (category === 'academic') {
    return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  }

  if (category === 'non_teaching') {
    return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
  }

  return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
}
