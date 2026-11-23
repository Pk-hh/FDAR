import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { DailyLog } from '@/types';
import { exportPDFReport, exportExcelReport } from '@/utils/reportGenerators';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Eye,
  Filter,
  Calendar,
  Building,
  Users,
  CheckCircle,
  FileText,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { departments, users, dailyLogs, settings } = useCollege();

  const isPrincipal = role === 'principal';
  const isHod = role === 'hod';
  const userDeptId = currentUser?.departmentId || 'dept_cse';

  // Report configurations
  const REPORT_TYPES = [
    { id: 'indiv_daily', name: '1. Individual Faculty Daily Activity Register', landscape: false },
    { id: 'dept_daily', name: '2. Department Daily Activity Register', landscape: true },
    { id: 'coll_daily', name: '3. Consolidated College Daily Activity Report', landscape: true },
    { id: 'weekly_fac', name: '4. Weekly Faculty Activity Report', landscape: true },
    { id: 'monthly_fac', name: '5. Monthly Faculty Activity Report', landscape: true },
    { id: 'workload', name: '6. Faculty Workload Report', landscape: false },
    { id: 'subject_wise', name: '7. Subject-wise Teaching Report', landscape: false },
    { id: 'period_wise', name: '8. Period-wise Activity Report', landscape: true },
    { id: 'pending_sub', name: '9. Pending Submission Report', landscape: false },
    { id: 'leave_od', name: '10. Faculty Leave and On-Duty Report', landscape: false },
    { id: 'hod_act', name: '11. HOD Activity Report', landscape: true },
    { id: 'compliance', name: '12. Department Submission Compliance Report', landscape: false },
    { id: 'acad_non_acad', name: '13. Academic vs Non-Academic Activity Report', landscape: false },
  ];

  const [selectedReportId, setSelectedReportId] = useState('indiv_daily');
  const [selectedDept, setSelectedDept] = useState(isPrincipal ? 'all' : userDeptId);
  const [selectedFaculty, setSelectedFaculty] = useState(role === 'faculty' ? currentUser?.uid || 'all' : 'all');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [isExporting, setIsExporting] = useState(false);

  // Filter logs for report
  const filteredLogs = dailyLogs.filter((log) => {
    if (selectedDept !== 'all' && log.departmentId !== selectedDept) return false;
    if (selectedFaculty !== 'all' && log.facultyId !== selectedFaculty) return false;
    if (log.date < startDate || log.date > endDate) return false;
    if (selectedStatus !== 'all' && log.submissionStatus !== selectedStatus) return false;
    return true;
  });

  const selectedReport = REPORT_TYPES.find((r) => r.id === selectedReportId) || REPORT_TYPES[0];

  const handleExportPDF = async () => {
    if (!settings) return;
    setIsExporting(true);
    try {
      const deptName = selectedDept === 'all' ? 'All Departments' : departments.find((d) => d.id === selectedDept)?.name;
      const facName = selectedFaculty === 'all' ? undefined : users.find((u) => u.uid === selectedFaculty)?.fullName;

      await exportPDFReport(
        selectedReport.name,
        filteredLogs,
        settings,
        deptName,
        facName,
        selectedReport.landscape
      );
    } catch (err: any) {
      alert('PDF generation error: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!settings) return;
    setIsExporting(true);
    try {
      await exportExcelReport(selectedReport.name, filteredLogs, settings);
    } catch (err: any) {
      alert('Excel generation error: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Academic Reports & Certified Documentation Generator</span>
          </h2>
          <p className="text-xs text-slate-500">
            Generate, preview, and download all 13 official GIITS activity registers in PDF and Excel formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Official PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* Filter and Selection Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Report Selection & Filtering Criteria</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-semibold text-slate-700 mb-1">Select Official Report Type</label>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-slate-50"
            >
              {REPORT_TYPES.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Submission Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved Only</option>
              <option value="submitted">Submitted Only</option>
              <option value="draft">Draft Only</option>
            </select>
          </div>

          {isPrincipal && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedFaculty('all');
                }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isPrincipal && isHod && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                disabled
                value={departments.find((d) => d.id === userDeptId)?.name || 'Department'}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600"
              />
            </div>
          )}

          {role !== 'faculty' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Faculty Member</label>
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
              >
                <option value="all">All Faculty Members</option>
                {users
                  .filter((u) => u.role === 'faculty' && (selectedDept === 'all' || u.departmentId === selectedDept))
                  .map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.fullName} ({u.employeeId})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* On-Screen Document Preview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        {/* Institutional Paper Header in Preview */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {settings?.collegeName.toUpperCase()}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">{settings?.tagline}</p>
          <div className="inline-block mt-2 px-3 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-xs uppercase border border-blue-200">
            {selectedReport.name}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Academic Year: {settings?.academicYear} • Range: {startDate} to {endDate}
          </div>
        </div>

        {/* Preview Records Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>{filteredLogs.length} activity register records compiled</span>
          <span className="font-mono text-[11px]">Orientation: {selectedReport.landscape ? 'Landscape' : 'Portrait'}</span>
        </div>

        {/* Data Table Preview */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-semibold">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Faculty Name</th>
                <th className="py-2.5 px-3">Dept</th>
                <th className="py-2.5 px-2 text-center">P1</th>
                <th className="py-2.5 px-2 text-center">P2</th>
                <th className="py-2.5 px-2 text-center">P3</th>
                <th className="py-2.5 px-2 text-center">P4</th>
                <th className="py-2.5 px-2 text-center">P5</th>
                <th className="py-2.5 px-2 text-center">P6</th>
                <th className="py-2.5 px-2 text-center">P7</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    No registers found for the selected criteria and date range.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">{log.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{log.facultyName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.departmentName.split(' ')[0]}</td>
                    {log.periods.map((p) => (
                      <td key={p.periodNumber} className="py-2 px-1 text-center font-mono text-[10px]">
                        <span className="truncate max-w-[80px] inline-block" title={p.topicCovered || p.actualActivity}>
                          {p.actualActivity.split(' ')[0]}
                        </span>
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-right font-bold uppercase text-[10px] text-emerald-700">
                      {log.submissionStatus}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Physical Countersignature block in preview */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-slate-500 text-[11px]">
          <div className="pt-4 border-t border-slate-300">
            <span>Signature of Faculty Member</span>
          </div>
          <div className="pt-4 border-t border-slate-300">
            <span>Head of the Department (HOD)</span>
          </div>
          <div className="pt-4 border-t border-slate-300">
            <span>Principal / Academic Director</span>
          </div>
        </div>
      </div>
    </div>
  );
};
