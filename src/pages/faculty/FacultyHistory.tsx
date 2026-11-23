import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { DailyLog } from '@/types';
import { exportPDFReport } from '@/utils/reportGenerators';
import {
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  X,
  Search,
  Filter,
} from 'lucide-react';

export const FacultyHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings } = useCollege();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [searchDate, setSearchDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [previewLog, setPreviewLog] = useState<DailyLog | null>(null);

  useEffect(() => {
    async function loadLogs() {
      if (!currentUser) return;
      const all = await StorageService.getDailyLogs({ facultyId: currentUser.uid });
      setLogs(all);
    }
    loadLogs();
  }, [currentUser]);

  const filteredLogs = logs.filter((log) => {
    if (searchDate && !log.date.includes(searchDate)) return false;
    if (selectedStatus !== 'all' && log.submissionStatus !== selectedStatus) return false;
    return true;
  });

  const handleDownloadPDF = async (log: DailyLog) => {
    if (!settings) return;
    await exportPDFReport(
      `Faculty Daily Activity Register - ${log.date}`,
      [log],
      settings,
      log.departmentName,
      log.facultyName,
      false
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'returned_for_correction':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'draft':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header and Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Daily Register Records & History</span>
          </h2>
          <p className="text-xs text-slate-500">
            View historical registers, HOD approval remarks, and export official PDF documents.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="submitted">Submitted</option>
            <option value="returned_for_correction">Returned</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Registers List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Calendar className="w-8 h-8 mx-auto opacity-50" />
            <p className="text-xs">No activity registers found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Date & Day</th>
                  <th className="py-3 px-4">Periods Completed</th>
                  <th className="py-3 px-4">Submission Status</th>
                  <th className="py-3 px-4">HOD Approval / Remarks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const completed = log.periods.filter((p) => p.status === 'completed').length;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{log.date}</div>
                        <div className="text-[10px] text-slate-500">{log.day}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{completed}</span>
                        <span className="text-slate-400"> of 7 periods</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getStatusBadge(
                            log.submissionStatus
                          )}`}
                        >
                          {log.submissionStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {log.approvalRemarks || log.returnRemarks || (
                          <span className="text-slate-400 italic">No remarks</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setPreviewLog(log)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(log)}
                          className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Preview for a Selected Daily Log */}
      {previewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-sm">
                  Activity Register: {previewLog.date} ({previewLog.day})
                </h3>
                <p className="text-[11px] text-slate-400">
                  {previewLog.facultyName} • {previewLog.departmentName}
                </p>
              </div>
              <button
                onClick={() => setPreviewLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Status and remarks banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Status:</span>
                  <div className="font-bold text-slate-800 uppercase text-xs">
                    {previewLog.submissionStatus.replace(/_/g, ' ')}
                  </div>
                </div>
                {previewLog.approvalRemarks && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Remarks:</span>
                    <div className="font-medium text-emerald-700">{previewLog.approvalRemarks}</div>
                  </div>
                )}
              </div>

              {/* 7 Periods Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Period</th>
                      <th className="p-2.5">Activity</th>
                      <th className="p-2.5">Topic Covered / Description</th>
                      <th className="p-2.5">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewLog.periods.map((p) => (
                      <tr key={p.periodNumber}>
                        <td className="p-2.5 font-bold text-slate-800">P{p.periodNumber}</td>
                        <td className="p-2.5 font-medium text-blue-700">{p.actualActivity}</td>
                        <td className="p-2.5 text-slate-700">
                          {p.topicCovered || p.experimentTitle || p.workTitle || p.remarks || '-'}
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {p.studentsPresent !== undefined ? `${p.studentsPresent} students` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {previewLog.dailySummary && (
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Daily Summary:</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                    {previewLog.dailySummary}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => handleDownloadPDF(previewLog)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
