import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { DailyLog, PeriodEntry, User } from '@/types';
import { getActivityColor } from '@/utils/activities';
import {
  Calendar,
  Filter,
  Eye,
  CheckCircle,
  X,
  Clock,
  Layers,
  CheckSquare,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface DailyActivityMatrixProps {
  onOpenReviewModal?: (log: DailyLog) => void;
}

export const DailyActivityMatrix: React.FC<DailyActivityMatrixProps> = ({ onOpenReviewModal }) => {
  const { currentUser } = useAuth();
  const { timingState, users, dailyLogs, refreshAll } = useCollege();

  const [selectedDate, setSelectedDate] = useState<string>(timingState.dateKey);
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  // Selected cell detail modal state
  const [selectedCell, setSelectedCell] = useState<{
    faculty: User;
    period: PeriodEntry;
    log: DailyLog | null;
  } | null>(null);

  // Bulk approval state
  const [selectedLogsForBulk, setSelectedLogsForBulk] = useState<string[]>([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const deptId = currentUser?.departmentId || 'dept_cse';
  const deptFaculty = users.filter(
    (u) => (deptId === 'ALL' || u.departmentId === deptId) && u.role === 'faculty' && u.isActive
  );

  // Filter faculty members
  const filteredFaculty = deptFaculty.filter((f) => {
    if (selectedDesignation !== 'all' && f.designation !== selectedDesignation) return false;
    if (selectedFaculty !== 'all' && f.uid !== selectedFaculty) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!f.fullName.toLowerCase().includes(q) && !f.employeeId.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Get log for faculty for the selected date
  const getLogForFaculty = (facultyId: string): DailyLog | null => {
    return dailyLogs.find((l) => l.facultyId === facultyId && l.date === selectedDate) || null;
  };

  // Bulk approval action
  const handleBulkApprove = async () => {
    if (!currentUser || selectedLogsForBulk.length === 0) return;
    setIsBulkProcessing(true);
    try {
      for (const logId of selectedLogsForBulk) {
        await StorageService.updateLogStatus(
          logId,
          'approve',
          currentUser,
          'Bulk approved by HOD after matrix verification'
        );
      }
      setSelectedLogsForBulk([]);
      setBulkConfirmOpen(false);
      await refreshAll();
    } catch (err: any) {
      alert('Bulk approval error: ' + err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const toggleSelectLog = (logId: string) => {
    setSelectedLogsForBulk((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Real-Time Faculty Activity Matrix</span>
            </h2>
            <p className="text-xs text-slate-500">
              Department of {currentUser?.departmentName || 'Computer Science & Engineering'} • Live Period Monitoring
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher (Matrix vs Cards) */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Matrix View
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mobile Cards
              </button>
            </div>

            {/* Bulk Approve Action Button */}
            {selectedLogsForBulk.length > 0 && (
              <button
                onClick={() => setBulkConfirmOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Bulk Approve ({selectedLogsForBulk.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter Designation</label>
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Designations</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Lecturer">Lecturer</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Submission Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Submissions</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft in Progress</option>
              <option value="returned_for_correction">Returned for Correction</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Faculty</label>
            <input
              type="text"
              placeholder="Name or Employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Real-time Faculty Matrix View */}
      {viewMode === 'matrix' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold border-b border-slate-800">
                  <th className="py-3 px-3 w-8">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="py-3 px-3 min-w-[180px]">Faculty Member</th>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <th key={num} className="py-3 px-2 text-center min-w-[110px]">
                      <div>Period {num}</div>
                      <div className="text-[10px] text-slate-400 font-mono font-normal">
                        {num === 1 ? '09:30-10:20' : num === 2 ? '10:20-11:10' : num === 3 ? '11:20-12:10' : num === 4 ? '12:10-01:00' : num === 5 ? '01:35-02:25' : num === 6 ? '02:25-03:10' : '03:10-03:55'}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right min-w-[120px]">Submission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFaculty.map((faculty) => {
                  const log = getLogForFaculty(faculty.uid);
                  const isSubmitted = log?.submissionStatus === 'submitted';
                  const isApproved = log?.submissionStatus === 'approved';

                  return (
                    <tr key={faculty.uid} className="hover:bg-slate-50/70 transition">
                      {/* Checkbox for bulk approval */}
                      <td className="py-3 px-3">
                        {isSubmitted && log ? (
                          <input
                            type="checkbox"
                            checked={selectedLogsForBulk.includes(log.id)}
                            onChange={() => toggleSelectLog(log.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        ) : null}
                      </td>

                      {/* Faculty Name & Info */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{faculty.fullName}</div>
                        <div className="text-[11px] text-slate-500">
                          {faculty.designation} • <span className="font-mono">{faculty.employeeId}</span>
                        </div>
                      </td>

                      {/* Periods 1 to 7 Color-Coded Cells */}
                      {[1, 2, 3, 4, 5, 6, 7].map((periodNum) => {
                        const period = log?.periods.find((p) => p.periodNumber === periodNum);
                        const activity = period?.actualActivity || 'Pending';
                        const color = getActivityColor(activity);

                        return (
                          <td
                            key={periodNum}
                            onClick={() => {
                              if (period) {
                                setSelectedCell({ faculty, period, log });
                              }
                            }}
                            className="py-2.5 px-1.5 text-center cursor-pointer transition hover:scale-102"
                            title="Click to view detailed period log"
                          >
                            <div
                              className={`p-2 rounded-xl border text-[11px] leading-tight font-medium shadow-2xs transition ${color.bg} ${color.text} ${color.border}`}
                            >
                              <div className="truncate font-bold">{activity}</div>
                              {period?.topicCovered ? (
                                <div className="text-[10px] opacity-80 truncate mt-0.5" title={period.topicCovered}>
                                  {period.topicCovered}
                                </div>
                              ) : (
                                <div className="text-[9px] opacity-60">Click details</div>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Submission Status Badge & Quick Action */}
                      <td className="py-3 px-3 text-right">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isSubmitted
                                ? 'bg-blue-100 text-blue-800'
                                : log?.submissionStatus === 'returned_for_correction'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {log?.submissionStatus?.replace(/_/g, ' ') || 'No Entry'}
                          </span>

                          {isSubmitted && log && onOpenReviewModal && (
                            <div>
                              <button
                                onClick={() => onOpenReviewModal(log)}
                                className="text-[10px] text-blue-600 hover:underline font-bold"
                              >
                                Review
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Alternative Mobile-Friendly Faculty Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFaculty.map((faculty) => {
            const log = getLogForFaculty(faculty.uid);
            return (
              <div key={faculty.uid} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{faculty.fullName}</h3>
                    <p className="text-[11px] text-slate-500">
                      {faculty.designation} • {faculty.employeeId}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      log?.submissionStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log?.submissionStatus === 'submitted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {log?.submissionStatus || 'No Entry'}
                  </span>
                </div>

                {/* 7 Period badges */}
                <div className="grid grid-cols-7 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                    const period = log?.periods.find((p) => p.periodNumber === num);
                    const color = getActivityColor(period?.actualActivity || '');
                    return (
                      <div
                        key={num}
                        onClick={() => {
                          if (period) setSelectedCell({ faculty, period, log });
                        }}
                        className={`p-1.5 rounded-lg border text-center cursor-pointer ${color.bg} ${color.text} ${color.border}`}
                      >
                        <div className="font-bold text-[10px]">P{num}</div>
                        <div className="text-[8px] truncate">{period?.actualActivity || '-'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Cell Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Period {selectedCell.period.periodNumber} Activity Details
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedCell.faculty.fullName} • {selectedCell.period.startTime} - {selectedCell.period.endTime}
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scheduled:</span>
                  <span className="font-bold text-slate-800">{selectedCell.period.scheduledActivity || 'Free Period'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Actual Activity:</span>
                  <span className="font-bold text-blue-600">{selectedCell.period.actualActivity}</span>
                </div>
              </div>

              {selectedCell.period.subjectName && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Subject & Class:</span>
                  <p className="text-slate-800 font-medium">
                    {selectedCell.period.subjectName} ({selectedCell.period.subjectCode || 'N/A'}) • Year {selectedCell.period.year || '-'} Sec {selectedCell.period.section || '-'}
                  </p>
                </div>
              )}

              {selectedCell.period.topicCovered && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Topic Covered:</span>
                  <p className="text-slate-800 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 leading-relaxed">
                    {selectedCell.period.topicCovered}
                  </p>
                </div>
              )}

              {selectedCell.period.experimentTitle && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Laboratory Experiment:</span>
                  <p className="text-slate-800 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 leading-relaxed">
                    {selectedCell.period.experimentNumber ? `${selectedCell.period.experimentNumber}: ` : ''}
                    {selectedCell.period.experimentTitle}
                  </p>
                </div>
              )}

              {selectedCell.period.studentsPresent !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Student Attendance:</span>
                  <span className="font-bold text-slate-900">
                    {selectedCell.period.studentsPresent} / {selectedCell.period.totalStudents || 64} Present
                  </span>
                </div>
              )}

              {selectedCell.period.remarks && (
                <div>
                  <span className="text-slate-500 font-semibold block mb-0.5">Faculty Remarks:</span>
                  <p className="text-slate-700 italic">{selectedCell.period.remarks}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Status: <strong className="uppercase text-slate-700">{selectedCell.period.status}</strong></span>
                <span>Last Updated: {new Date(selectedCell.period.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approval Confirmation Dialog */}
      {bulkConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Confirm Bulk Approval</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to approve <strong>{selectedLogsForBulk.length}</strong> submitted faculty daily registers for <strong>{selectedDate}</strong>?
            </p>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              Approved activity registers will be locked and an administrative audit record will be logged.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBulkConfirmOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={isBulkProcessing}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
              >
                {isBulkProcessing ? 'Approving...' : 'Confirm Bulk Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
