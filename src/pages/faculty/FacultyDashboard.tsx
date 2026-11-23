import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Coffee,
  ArrowRight,
  Sparkles,
  BookOpen,
  Eye,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { DailyLog, PeriodCompletionStatus } from '@/types';
import { getActivityColor } from '@/utils/activities';

interface FacultyDashboardProps {
  onNavigate: (tab: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { timingState, dailyLogs, settings } = useCollege();

  // Find today's register for this faculty
  const todayKey = timingState.dateKey;
  const todayLog = dailyLogs.find(
    (l) => l.facultyId === currentUser?.uid && l.date === todayKey
  );

  const periods = todayLog?.periods || [];
  const completedCount = periods.filter((p) => p.status === 'completed').length;
  const pendingCount = periods.filter((p) => p.status === 'pending').length;
  const submissionStatus = todayLog?.submissionStatus || 'draft';

  // Status color mapper for the 7-period progress tracker
  const getPeriodTrackColor = (status: PeriodCompletionStatus, periodNum: number, actualActivity: string) => {
    if (actualActivity === 'On Duty') {
      return { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-600', label: 'On Duty' };
    }
    if (status === 'completed') {
      return { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-600', label: 'Completed' };
    }
    if (timingState.currentPeriod?.periodNumber === periodNum) {
      return { bg: 'bg-blue-600 animate-pulse', text: 'text-white', border: 'border-blue-600', label: 'Ongoing' };
    }
    if (status === 'pending') {
      return { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-500', label: 'Pending' };
    }
    return { bg: 'bg-slate-200', text: 'text-slate-600', border: 'border-slate-300', label: 'Upcoming' };
  };

  const getSubmissionBadge = () => {
    switch (submissionStatus) {
      case 'approved':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Approved by HOD' };
      case 'submitted':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Submitted (Under Review)' };
      case 'returned_for_correction':
        return { bg: 'bg-rose-100 text-rose-800 border-rose-300', label: 'Returned for Correction' };
      case 'draft':
      default:
        return { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Draft in Progress' };
    }
  };

  const submissionBadge = getSubmissionBadge();

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Welcome & Profile Summary Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser?.designation}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ID: {currentUser?.employeeId}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Welcome back, {currentUser?.fullName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Department of {currentUser?.departmentName || 'Computer Science & Engineering'} • GIITS
          </p>
        </div>

        {/* Live Period Banner */}
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-800 flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400">
            <Clock className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Current Academic Status
            </div>
            <div className="text-sm font-bold text-blue-300">
              {timingState.statusText}
            </div>
            <div className="text-[11px] text-slate-400">
              {timingState.currentDateFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Period Progress Tracker Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>Today's 7-Period Progress</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${submissionBadge.bg}`}>
                {submissionBadge.label}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {completedCount} of 7 periods logged • {pendingCount} pending entries
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('daily_log')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <span>Open Daily Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Grid (7 Periods) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => {
            const period = periods.find((p) => p.periodNumber === num);
            const status = period?.status || 'pending';
            const colors = getPeriodTrackColor(status, num, period?.actualActivity || '');
            const isCurrent = timingState.currentPeriod?.periodNumber === num;

            return (
              <div
                key={num}
                onClick={() => onNavigate('daily_log')}
                className={`p-3 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-800">P{num}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${colors.bg} ${colors.text}`}
                  >
                    {colors.label}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  {period?.startTime || `0${num + 8}:30 AM`}
                </div>
                <div className="mt-1.5 font-medium text-[11px] text-slate-800 truncate" title={period?.actualActivity || 'Not updated'}>
                  {period?.actualActivity || 'Pending'}
                </div>
                {period?.subjectCode && (
                  <div className="text-[10px] text-blue-600 font-semibold truncate">
                    {period.subjectCode}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-600 border-t border-slate-100">
          <span className="font-semibold text-slate-400">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Completed / Approved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Current Period / Submitted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Pending Entry</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span>On Duty</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Returned / Missing</span>
          </div>
        </div>
      </div>

      {/* Returned for Correction Alert Banner if applicable */}
      {todayLog?.submissionStatus === 'returned_for_correction' && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-2 text-rose-800 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Activity Register Returned for Correction by HOD</span>
          </div>
          <p className="text-rose-700 pl-6">
            <strong>HOD Instructions:</strong> "{todayLog.returnRemarks || 'Please update all period topic details and resubmit.'}"
          </p>
          <div className="pl-6 pt-1">
            <button
              onClick={() => onNavigate('daily_log')}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold transition"
            >
              Correct and Resubmit Register
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Cards & Timetable Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Action Card 1: Daily Log Register */}
        <div
          onClick={() => onNavigate('daily_log')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition">
            Record Daily Activities
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Record topic covered, student attendance, lab experiments, or administrative activities.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-semibold">
            <span>Open Register Form</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Quick Action Card 2: Weekly Schedule */}
        <div
          onClick={() => onNavigate('timetable')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition">
            My Weekly Timetable
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review allocated theory lectures, practical lab sessions, and classroom venues.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-semibold">
            <span>View Full Timetable</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Quick Action Card 3: Register History */}
        <div
          onClick={() => onNavigate('history')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-emerald-600 transition">
            Activity History & Reports
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Access previous approved daily logs, HOD remarks, and download certified PDF reports.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <span>Explore Past Logs</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* Today's Timetable Preview */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
          <span>Today's Allocated Schedule ({timingState.dayName})</span>
          <button
            onClick={() => onNavigate('timetable')}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            View Weekly Table
          </button>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Scheduled Class / Activity</th>
                <th className="py-2.5 px-3">Class & Section</th>
                <th className="py-2.5 px-3">Recorded Activity</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periods.map((p) => {
                const color = getActivityColor(p.actualActivity);
                return (
                  <tr key={p.periodNumber} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-800">Period {p.periodNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {p.startTime} - {p.endTime}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {p.scheduledActivity || 'Free Period'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {p.section ? `${p.year}-${p.section}` : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${color.bg} ${color.text} ${color.border}`}>
                        {p.actualActivity || 'Pending'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          p.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
