import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  CalendarOff,
  Briefcase,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { DailyLog } from '@/types';

interface HodDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenReviewModal: (log: DailyLog) => void;
}

export const HodDashboard: React.FC<HodDashboardProps> = ({ onNavigate, onOpenReviewModal }) => {
  const { currentUser } = useAuth();
  const { timingState, users, dailyLogs } = useCollege();

  const deptId = currentUser?.departmentId || 'dept_cse';
  const deptFaculty = users.filter((u) => u.departmentId === deptId && u.role === 'faculty');
  const activeFacultyCount = deptFaculty.filter((u) => u.isActive).length;

  // Filter logs for today and this department
  const todayKey = timingState.dateKey;
  const todayDeptLogs = dailyLogs.filter(
    (l) => l.departmentId === deptId && l.date === todayKey
  );

  const submittedLogs = todayDeptLogs.filter((l) => l.submissionStatus === 'submitted');
  const approvedLogs = todayDeptLogs.filter((l) => l.submissionStatus === 'approved');
  const returnedLogs = todayDeptLogs.filter((l) => l.submissionStatus === 'returned_for_correction');
  const draftLogs = todayDeptLogs.filter((l) => l.submissionStatus === 'draft');

  // Submission percentage
  const totalSubmissions = submittedLogs.length + approvedLogs.length;
  const submissionPercentage =
    activeFacultyCount > 0 ? Math.round((totalSubmissions / activeFacultyCount) * 100) : 0;

  // On Leave / On Duty count from today's logs
  const onLeaveCount = todayDeptLogs.filter((l) =>
    l.periods.some((p) => p.actualActivity.includes('Leave'))
  ).length;

  const onDutyCount = todayDeptLogs.filter((l) =>
    l.periods.some((p) => p.actualActivity === 'On Duty')
  ).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Head of Department
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ID: {currentUser?.employeeId}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {currentUser?.fullName} • {currentUser?.departmentName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            GIITS Departmental Academic Operations & Activity Monitoring Console
          </p>
        </div>

        {/* Live Status Pill */}
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Today's Schedule</div>
            <div className="text-xs font-bold text-blue-300">{timingState.statusText}</div>
            <div className="text-[10px] text-slate-400">{timingState.currentDateFormatted}</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Active Faculty */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Total Faculty</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeFacultyCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active in Department</div>
        </div>

        {/* Card 2: Submitted */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Submitted</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{submittedLogs.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting Review</div>
        </div>

        {/* Card 3: Approved */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Approved</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{approvedLogs.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Registers Locked</div>
        </div>

        {/* Card 4: Returned */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Returned</span>
            <RotateCcw className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{returnedLogs.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">For Correction</div>
        </div>

        {/* Card 5: Compliance % */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Compliance</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{submissionPercentage}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Submission Rate</div>
        </div>

        {/* Card 6: On Duty / Leave */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">OD / Leave</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">
            {onDutyCount} / {onLeaveCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">On Duty / Approved Leave</div>
        </div>
      </div>

      {/* Quick Launch Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action 1: Open Matrix */}
        <div
          onClick={() => onNavigate('matrix')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition">
            Daily Faculty Activity Matrix
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Monitor all 7 periods of every faculty member in real-time with color codes and quick cell previews.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-semibold">
            <span>Launch Activity Matrix</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Action 2: Review Submitted Registers */}
        <div
          onClick={() => onNavigate('review')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition">
            Review Submitted Registers ({submittedLogs.length})
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Approve verified registers or return for correction with instructions and audit logging.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-semibold">
            <span>Review Pending Logs</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Action 3: HOD's Own Daily Register */}
        <div
          onClick={() => onNavigate('my_register')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-emerald-600 transition">
            HOD Daily Activity Register
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Record your daily teaching, administration, and NAAC work. Automatically routed to Principal.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <span>Open HOD Register</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Pending Submissions Requiring Your Approval ({submittedLogs.length})
          </h3>
          <button
            onClick={() => onNavigate('review')}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            View All in Review Center
          </button>
        </div>

        {submittedLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Check className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
            <p className="text-xs font-medium">All submitted registers for today have been reviewed!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Faculty Member</th>
                  <th className="py-2.5 px-3">Employee ID</th>
                  <th className="py-2.5 px-3">Submitted At</th>
                  <th className="py-2.5 px-3">7 Periods Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submittedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{log.facultyName}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{log.employeeId}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {log.submittedAt ? new Date(log.submittedAt).toLocaleTimeString() : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <span className="font-semibold text-emerald-600">
                        {log.periods.filter((p) => p.status === 'completed').length}
                      </span>
                      <span className="text-slate-400"> / 7 Completed</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onOpenReviewModal(log)}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
                      >
                        Review & Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
