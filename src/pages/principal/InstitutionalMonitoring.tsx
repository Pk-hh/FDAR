import React, { useState } from 'react';
import { useCollege } from '@/contexts/CollegeContext';
import { DailyLog, PeriodEntry, User } from '@/types';
import { getActivityColor } from '@/utils/activities';
import {
  Layers,
  Search,
  Filter,
  Eye,
  Building,
  CheckCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface InstitutionalMonitoringProps {
  onOpenReviewModal: (log: DailyLog) => void;
}

export const InstitutionalMonitoring: React.FC<InstitutionalMonitoringProps> = ({
  onOpenReviewModal,
}) => {
  const { timingState, departments, users, dailyLogs } = useCollege();

  const [selectedDate, setSelectedDate] = useState<string>(timingState.dateKey);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active faculty
  const facultyList = users.filter((u) => u.role === 'faculty' && u.isActive);

  const filteredFaculty = facultyList.filter((f) => {
    if (selectedDept !== 'all' && f.departmentId !== selectedDept) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!f.fullName.toLowerCase().includes(q) && !f.employeeId.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const getLogForFaculty = (facultyId: string): DailyLog | null => {
    return dailyLogs.find((l) => l.facultyId === facultyId && l.date === selectedDate) || null;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header and Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>College-Wide Academic Monitoring Matrix</span>
            </h2>
            <p className="text-xs text-slate-500">
              Institution-wide real-time tracking across all 7 periods and all academic departments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
            >
              <option value="all">All Academic Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Submission Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="submitted">Submitted (Under Review)</option>
              <option value="draft">Draft in Progress</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Faculty</label>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* College-Wide Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold border-b border-slate-800">
                <th className="py-3 px-3 min-w-[180px]">Faculty Member</th>
                <th className="py-3 px-3">Dept</th>
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <th key={num} className="py-3 px-2 text-center min-w-[100px]">
                    Period {num}
                  </th>
                ))}
                <th className="py-3 px-3 text-right">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaculty.map((f) => {
                const log = getLogForFaculty(f.uid);
                return (
                  <tr key={f.uid} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{f.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{f.employeeId}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700">
                        {departments.find((d) => d.id === f.departmentId)?.code || 'DEPT'}
                      </span>
                    </td>

                    {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                      const period = log?.periods.find((p) => p.periodNumber === pNum);
                      const act = period?.actualActivity || 'Pending';
                      const color = getActivityColor(act);
                      return (
                        <td key={pNum} className="py-2 px-1 text-center">
                          <span
                            className={`inline-block w-full py-1 px-1 rounded-md text-[10px] font-medium truncate ${color.bg} ${color.text} border ${color.border}`}
                            title={period?.topicCovered || act}
                          >
                            {act}
                          </span>
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          log?.submissionStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log?.submissionStatus === 'submitted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log?.submissionStatus || 'No Entry'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {log ? (
                        <button
                          onClick={() => onOpenReviewModal(log)}
                          className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px]"
                        >
                          View Log
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Unlogged</span>
                      )}
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
