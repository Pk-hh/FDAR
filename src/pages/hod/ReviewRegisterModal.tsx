import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { DailyLog } from '@/types';
import {
  X,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  FileText,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';

interface ReviewRegisterModalProps {
  log: DailyLog | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewRegisterModal: React.FC<ReviewRegisterModalProps> = ({
  log,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { refreshAll } = useCollege();

  const [approvalRemarks, setApprovalRemarks] = useState('Approved as submitted.');
  const [returnRemarks, setReturnRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'return'>('view');

  if (!log) return null;

  // Prevent self-approval (Section 9 & 18)
  const isSelf = currentUser?.uid === log.facultyId;

  const handleApprove = async () => {
    if (!currentUser) return;
    if (isSelf) {
      setErrorMessage('Security Violation: Users cannot approve their own activity registers.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await StorageService.updateLogStatus(log.id, 'approve', currentUser, approvalRemarks);
      await refreshAll();
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage('Approval failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturn = async () => {
    if (!currentUser) return;
    if (!returnRemarks.trim()) {
      setErrorMessage('Mandatory: Please provide specific remarks explaining why this register is being returned for correction.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await StorageService.updateLogStatus(log.id, 'return', currentUser, undefined, returnRemarks);
      await refreshAll();
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage('Action failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm">Review Daily Activity Register</h3>
              <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {log.submissionStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {log.facultyName} ({log.employeeId}) • Date: {log.date} ({log.day})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSelf && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Note: This is your own activity register. Institutional policy routes HOD registers to the Principal for formal review and approval.
              </span>
            </div>
          )}

          {/* Submission Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Department:</span>
              <span className="font-bold text-slate-800">{log.departmentName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Designation:</span>
              <span className="font-bold text-slate-800">{log.designation}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Submitted At:</span>
              <span className="font-bold text-slate-800">
                {log.submittedAt ? new Date(log.submittedAt).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Late submission reason notice */}
          {log.isLateSubmission && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="font-bold text-amber-800 block text-[11px]">Submission Notice / Justification:</span>
              <p className="text-amber-900 mt-0.5">{log.lateSubmissionReason}</p>
            </div>
          )}

          {/* 7 Periods Inspection Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Period</th>
                  <th className="p-2.5">Scheduled</th>
                  <th className="p-2.5">Actual Activity</th>
                  <th className="p-2.5">Topic Covered / Progress</th>
                  <th className="p-2.5 text-right">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {log.periods.map((p) => (
                  <tr key={p.periodNumber} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-800">P{p.periodNumber}</td>
                    <td className="p-2.5 text-slate-500">{p.scheduledActivity}</td>
                    <td className="p-2.5 font-semibold text-blue-700">{p.actualActivity}</td>
                    <td className="p-2.5 text-slate-800">
                      {p.topicCovered || p.experimentTitle || p.workTitle || p.remarks || '-'}
                    </td>
                    <td className="p-2.5 text-right font-medium text-slate-700">
                      {p.studentsPresent !== undefined ? `${p.studentsPresent}/${p.totalStudents || 64}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Daily Summary */}
          {log.dailySummary && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block mb-0.5">Faculty Daily Summary:</span>
              <p className="text-slate-700 leading-relaxed">{log.dailySummary}</p>
            </div>
          )}

          {/* Remarks Inputs */}
          {mode === 'view' ? (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Approval Remarks / Commendations (Optional)
              </label>
              <input
                type="text"
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                placeholder="e.g. Verified topics and attendance records. Approved."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          ) : (
            <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 space-y-2">
              <label className="block font-bold text-rose-900 text-xs">
                Mandatory Return Remarks / Correction Instructions <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                value={returnRemarks}
                onChange={(e) => setReturnRemarks(e.target.value)}
                placeholder="State exactly what needs correction (e.g. Period 4 topic description is blank; please specify experiment title and student count)."
                className="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            {mode === 'view' ? (
              <button
                type="button"
                onClick={() => setMode('return')}
                className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition"
              >
                Return for Correction
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('view')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
              >
                Back to Approval
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
            >
              Cancel
            </button>

            {mode === 'view' ? (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing || isSelf}
                className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
              >
                {isProcessing ? 'Approving...' : 'Approve & Lock Register'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReturn}
                disabled={isProcessing || !returnRemarks.trim() || isSelf}
                className="px-5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
              >
                {isProcessing ? 'Returning...' : 'Send Back for Correction'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
