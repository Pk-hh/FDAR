import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { DailyLog, PeriodEntry } from '@/types';
import {
  X,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  Clock,
  ShieldCheck,
  Edit3,
  Unlock,
  Save,
} from 'lucide-react';
import { ACADEMIC_ACTIVITIES, NON_TEACHING_ACTIVITIES, OTHER_STATUSES } from '@/utils/activities';

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

  const isAdmin = currentUser?.role === 'principal';
  const isSelf = currentUser?.uid === log?.facultyId;

  const [approvalRemarks, setApprovalRemarks] = useState('Approved as submitted.');
  const [returnRemarks, setReturnRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'return' | 'admin_edit'>('view');

  // Editable periods state for Admin
  const [editablePeriods, setEditablePeriods] = useState<PeriodEntry[]>(log ? [...log.periods] : []);

  if (!log) return null;

  const handlePeriodFieldChange = (periodNum: number, field: keyof PeriodEntry, val: any) => {
    setEditablePeriods((prev) =>
      prev.map((p) => (p.periodNumber === periodNum ? { ...p, [field]: val } : p))
    );
  };

  const handleSaveAdminEdits = async () => {
    if (!currentUser || !isAdmin) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const updatedLog: DailyLog = {
        ...log,
        periods: editablePeriods,
        updatedAt: new Date().toISOString(),
      };
      await StorageService.saveDailyLog(updatedLog, currentUser.uid);
      await refreshAll();
      setMode('view');
      onSuccess();
    } catch (err: any) {
      setErrorMessage('Failed to save admin edits: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlock = async () => {
    if (!currentUser) return;
    if (confirm('Unlock this register so that the faculty member can edit and resubmit?')) {
      setIsProcessing(true);
      try {
        const unlockedLog: DailyLog = {
          ...log,
          submissionStatus: 'draft',
          updatedAt: new Date().toISOString(),
        };
        await StorageService.saveDailyLog(unlockedLog, currentUser.uid);
        await refreshAll();
        onSuccess();
        onClose();
      } catch (err: any) {
        setErrorMessage('Failed to unlock register: ' + err.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleApprove = async () => {
    if (!currentUser) return;
    if (isSelf && !isAdmin) {
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

  const allActivityOptions = [
    ...ACADEMIC_ACTIVITIES,
    ...NON_TEACHING_ACTIVITIES,
    ...OTHER_STATUSES,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm">
                {mode === 'admin_edit' ? 'Admin Direct Period Edit Console' : 'Review Daily Activity Register'}
              </h3>
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

          {/* Submission Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
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
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Status:</span>
              <span className="font-bold text-blue-600 uppercase">{log.submissionStatus}</span>
            </div>
          </div>

          {/* Admin Edit Controls Bar */}
          {isAdmin && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-900">
                <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold text-xs">
                  {mode === 'admin_edit' ? 'Editing period entries directly as Admin' : 'Admin Authority: Edit periods directly or unlock this register'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {mode === 'admin_edit' ? (
                  <button
                    type="button"
                    onClick={() => setMode('view')}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                  >
                    Cancel Editing
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMode('admin_edit')}
                    className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Periods</span>
                  </button>
                )}

                {log.submissionStatus === 'approved' && (
                  <button
                    type="button"
                    onClick={handleUnlock}
                    className="px-2.5 py-1 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1"
                    title="Allow faculty to re-edit register"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlock Register</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 7 Periods Inspection / Edit Table */}
          {mode === 'admin_edit' ? (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800">Admin Period Editor</h4>
              <div className="space-y-2">
                {editablePeriods.map((p) => (
                  <div key={p.periodNumber} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Period {p.periodNumber} ({p.startTime} - {p.endTime})</span>
                      <span className="text-[11px] text-slate-500 font-normal">Scheduled: {p.scheduledActivity}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Actual Activity</label>
                        <select
                          value={p.actualActivity}
                          onChange={(e) => handlePeriodFieldChange(p.periodNumber, 'actualActivity', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white"
                        >
                          {allActivityOptions.map((opt) => (
                            <option key={opt.type} value={opt.type}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Topic Covered / Description</label>
                        <input
                          type="text"
                          value={p.topicCovered || ''}
                          onChange={(e) => handlePeriodFieldChange(p.periodNumber, 'topicCovered', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Students Present / Remarks</label>
                        <input
                          type="number"
                          placeholder="Present count"
                          value={p.studentsPresent !== undefined ? p.studentsPresent : ''}
                          onChange={(e) => handlePeriodFieldChange(p.periodNumber, 'studentsPresent', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
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
                        {p.studentsPresent !== undefined ? `${p.studentsPresent}/${p.totalStudents || 60}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Remarks Box */}
          {mode === 'view' ? (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <label className="block font-semibold text-slate-700 text-xs">
                Review Remarks / Instructions:
              </label>
              <input
                type="text"
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                placeholder="Enter formal approval remarks or instructions..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
            </div>
          ) : mode === 'return' ? (
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
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            {mode === 'admin_edit' ? (
              <button
                type="button"
                onClick={handleSaveAdminEdits}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Saving...' : 'Save Admin Edits'}</span>
              </button>
            ) : mode === 'view' ? (
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
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>

            {mode === 'view' && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing || (isSelf && !isAdmin)}
                className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? 'Approving...' : 'Approve & Confirm Register'}
              </button>
            )}

            {mode === 'return' && (
              <button
                type="button"
                onClick={handleReturn}
                disabled={isProcessing || !returnRemarks.trim()}
                className="px-5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
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
