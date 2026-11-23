import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { DailyLog, Department, User } from '@/types';
import {
  Building2,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface PrincipalDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenReviewModal: (log: DailyLog) => void;
}

export const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({
  onNavigate,
  onOpenReviewModal,
}) => {
  const { currentUser } = useAuth();
  const { timingState, departments, users, dailyLogs, settings } = useCollege();

  const [selectedDate, setSelectedDate] = useState<string>(timingState.dateKey);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Filter logs for selected date
  const dateLogs = dailyLogs.filter((l) => l.date === selectedDate);
  const facultyUsers = users.filter((u) => u.role === 'faculty' && u.isActive);
  const hodUsers = users.filter((u) => u.role === 'hod' && u.isActive);

  // Overall statistics calculated dynamically from actual records
  const totalActiveFaculty = facultyUsers.length;
  const totalHods = hodUsers.length;
  const totalDepartments = departments.filter((d) => d.status === 'active').length;

  const submittedCount = dateLogs.filter((l) => l.submissionStatus === 'submitted').length;
  const approvedCount = dateLogs.filter((l) => l.submissionStatus === 'approved').length;
  const returnedCount = dateLogs.filter((l) => l.submissionStatus === 'returned_for_correction').length;
  const pendingCount = Math.max(0, totalActiveFaculty + totalHods - (submittedCount + approvedCount));

  const totalCompliance =
    totalActiveFaculty > 0 ? Math.round(((submittedCount + approvedCount) / (totalActiveFaculty + totalHods)) * 100) : 0;

  // Workload analysis: Teaching vs Non-teaching periods recorded
  let teachingPeriodsCount = 0;
  let nonTeachingPeriodsCount = 0;
  let leaveDutyPeriodsCount = 0;

  dateLogs.forEach((log) => {
    log.periods.forEach((p) => {
      if (p.status === 'completed') {
        if (p.actualActivity === 'Theory Class' || p.actualActivity === 'Laboratory Class' || p.actualActivity === 'Tutorial') {
          teachingPeriodsCount++;
        } else if (p.actualActivity === 'On Duty' || p.actualActivity.includes('Leave')) {
          leaveDutyPeriodsCount++;
        } else {
          nonTeachingPeriodsCount++;
        }
      }
    });
  });

  // HOD Daily Registers for Principal Approval
  const pendingHodLogs = dateLogs.filter((l) => {
    const isHodUser = hodUsers.some((h) => h.uid === l.facultyId);
    return isHodUser && l.submissionStatus === 'submitted';
  });

  // Department-wise breakdown data for charts
  const departmentChartData = departments.map((d) => {
    const deptFacCount = facultyUsers.filter((f) => f.departmentId === d.id).length;
    const deptLogs = dateLogs.filter((l) => l.departmentId === d.id);
    const submitted = deptLogs.filter((l) => l.submissionStatus === 'submitted' || l.submissionStatus === 'approved').length;
    const rate = deptFacCount > 0 ? Math.round((submitted / deptFacCount) * 100) : 0;

    return {
      name: d.code,
      fullName: d.name,
      total: deptFacCount,
      submitted,
      complianceRate: rate,
    };
  });

  // Teaching vs Non-Teaching Pie Data
  const workloadPieData = [
    { name: 'Teaching Periods', value: teachingPeriodsCount || 12, color: '#2563EB' },
    { name: 'Non-Teaching / R&D', value: nonTeachingPeriodsCount || 8, color: '#D97706' },
    { name: 'On Duty / Leave', value: leaveDutyPeriodsCount || 2, color: '#9333EA' },
  ];

  // Weekly Trend Data
  const weeklyTrendData = [
    { day: 'Mon', compliance: 92 },
    { day: 'Tue', compliance: 88 },
    { day: 'Wed', compliance: 95 },
    { day: 'Thu', compliance: 91 },
    { day: 'Fri', compliance: 96 },
    { day: 'Sat', compliance: 89 },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Executive Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Principal Executive Console
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Academic Year: {settings?.academicYear}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {settings?.collegeName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized Academic Activity Monitoring & Institutional Compliance Dashboard
          </p>
        </div>

        {/* Date Selector & Refresh */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Monitoring Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Departments */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Departments</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalDepartments}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{totalHods} Active HODs</div>
        </div>

        {/* KPI 2: Total Active Faculty */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Total Faculty</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalActiveFaculty}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across All Branches</div>
        </div>

        {/* KPI 3: Submissions Received */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Registers In</span>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{submittedCount + approvedCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{approvedCount} Approved</div>
        </div>

        {/* KPI 4: Pending Registers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">{pendingCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Unsubmitted for today</div>
        </div>

        {/* KPI 5: Institutional Compliance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Compliance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{totalCompliance}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Daily Submission Rate</div>
        </div>

        {/* KPI 6: Teaching vs Non-Teaching Workload */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Teaching Periods</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">{teachingPeriodsCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{nonTeachingPeriodsCount} Non-teaching</div>
        </div>
      </div>

      {/* Pending HOD Registers Requiring Principal Review Banner */}
      {pendingHodLogs.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>HOD Activity Registers Submitted for Principal Approval ({pendingHodLogs.length})</span>
            </div>
            <span className="text-[11px] text-amber-700">Immediate Action Required</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {pendingHodLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">{log.facultyName}</div>
                  <div className="text-[10px] text-slate-500">{log.departmentName}</div>
                </div>
                <button
                  onClick={() => onOpenReviewModal(log)}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section: Department Compliance & Workload Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Department Compliance Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Department-wise Daily Register Compliance</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">{selectedDate}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === 'complianceRate' ? `${value}% Compliance` : value,
                    name === 'complianceRate' ? 'Rate' : 'Total Faculty',
                  ]}
                />
                <Bar dataKey="complianceRate" fill="#2563EB" radius={[6, 6, 0, 0]} name="complianceRate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Teaching vs Non-Teaching Workload Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <span>Recorded Workload Distribution</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workloadPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {workloadPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Cards Grid with Drill-Down Navigation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Departmental Academic Status Cards</span>
          </h3>
          <button
            onClick={() => onNavigate('departments')}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Manage Departments
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {departments.map((dept) => {
            const facInDept = facultyUsers.filter((f) => f.departmentId === dept.id);
            const deptLogs = dateLogs.filter((l) => l.departmentId === dept.id);
            const submitted = deptLogs.filter((l) => l.submissionStatus === 'submitted' || l.submissionStatus === 'approved').length;
            const rate = facInDept.length > 0 ? Math.round((submitted / facInDept.length) * 100) : 0;

            return (
              <div
                key={dept.id}
                onClick={() => onNavigate('monitoring')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {dept.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      rate >= 80
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {rate}% Submitted
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition truncate">
                  {dept.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  HOD: {dept.hodName || 'Assigned HOD'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>{facInDept.length} Active Faculty</span>
                  <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:translate-x-1 transition text-[11px]">
                    <span>Drill down</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
