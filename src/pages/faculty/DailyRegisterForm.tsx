import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { DailyLog, PeriodEntry, ActivityType } from '@/types';
import { generateDefaultDailyLog } from '@/utils/collegeData';
import {
  ACADEMIC_ACTIVITIES,
  NON_TEACHING_ACTIVITIES,
  OTHER_STATUSES,
  getActivityCategory,
} from '@/utils/activities';
import {
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Lock,
  ChevronDown,
  ChevronUp,
  FileCheck,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface DailyRegisterFormProps {
  onSuccessSubmit?: () => void;
}

export const DailyRegisterForm: React.FC<DailyRegisterFormProps> = ({ onSuccessSubmit }) => {
  const { currentUser } = useAuth();
  const { timingState, settings, refreshAll } = useCollege();

  const [activeDate, setActiveDate] = useState<string>(timingState.dateKey);
  const [log, setLog] = useState<DailyLog | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lateReasonModalOpen, setLateReasonModalOpen] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(timingState.currentPeriod?.periodNumber || 1);

  // Load or initialize daily log for the selected date
  useEffect(() => {
    async function loadLog() {
      if (!currentUser) return;
      setIsSaving(true);
      setErrorMessage(null);
      try {
        const docId = `${currentUser.uid}_${activeDate}`;
        let existing = await StorageService.getDailyLog(docId);
        if (!existing) {
          const timetables = await StorageService.getTimetables(currentUser.departmentId, currentUser.uid);
          existing = generateDefaultDailyLog(currentUser, activeDate, settings?.timings, timetables);
        }
        setLog(existing);
      } catch (err: any) {
        setErrorMessage('Failed to load activity log: ' + err.message);
      } finally {
        setIsSaving(false);
      }
    }
    loadLog();
  }, [currentUser, activeDate, settings?.timings]);

  // Handle period field changes
  const handlePeriodChange = (periodNum: number, field: keyof PeriodEntry, value: any) => {
    if (!log || isLocked) return;

    setLog((prev) => {
      if (!prev) return prev;
      const updatedPeriods = prev.periods.map((p) => {
        if (p.periodNumber === periodNum) {
          const updated = { ...p, [field]: value, updatedAt: new Date().toISOString() };
          // If actualActivity is selected and topic is present, mark completed
          if (field === 'actualActivity' && value === 'Free Period') {
            updated.status = 'completed';
          }
          return updated;
        }
        return p;
      });
      return { ...prev, periods: updatedPeriods };
    });
  };

  // Continuous Lab Support: replicate details to consecutive periods
  const handleApplyContinuousLab = (periodNum: number, span: number) => {
    if (!log || isLocked) return;
    const currentPeriod = log.periods.find((p) => p.periodNumber === periodNum);
    if (!currentPeriod) return;

    setLog((prev) => {
      if (!prev) return prev;
      const updated = prev.periods.map((p) => {
        if (p.periodNumber > periodNum && p.periodNumber < periodNum + span) {
          return {
            ...p,
            actualActivity: 'Laboratory Class',
            labName: currentPeriod.labName,
            experimentNumber: currentPeriod.experimentNumber,
            experimentTitle: currentPeriod.experimentTitle,
            batch: currentPeriod.batch,
            subjectName: currentPeriod.subjectName,
            subjectCode: currentPeriod.subjectCode,
            year: currentPeriod.year,
            semester: currentPeriod.semester,
            section: currentPeriod.section,
            topicCovered: currentPeriod.topicCovered,
            studentsPresent: currentPeriod.studentsPresent,
            status: currentPeriod.status,
            isContinuousLab: true,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      return { ...prev, periods: updated };
    });
  };

  // Auto-save draft
  const handleSaveDraft = async () => {
    if (!log || !currentUser) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await StorageService.saveDailyLog(log, currentUser.uid);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2500);
      await refreshAll();
    } catch (err: any) {
      setErrorMessage('Error saving draft: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit register
  const handleFinalSubmit = async (reason?: string) => {
    if (!log || !currentUser) return;

    // Validation: check if all periods have an actual activity assigned
    const missing = log.periods.find((p) => !p.actualActivity || p.status === 'pending');
    if (missing) {
      setErrorMessage(`Please complete activity details for Period ${missing.periodNumber} before final submission.`);
      setExpandedPeriod(missing.periodNumber);
      return;
    }

    // Check timing requirement: if submitting before 03:55 PM on today's date
    const isToday = activeDate === timingState.dateKey;
    if (isToday && !timingState.canFinalSubmit && !reason) {
      // Need justification if submitting early or outside standard hours
      setLateReasonModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await StorageService.updateLogStatus(log.id, 'submit', currentUser, undefined, reason);
      await refreshAll();
      setLateReasonModalOpen(false);
      onSuccessSubmit?.();
    } catch (err: any) {
      setErrorMessage('Submission failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!log) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading daily register details...</p>
      </div>
    );
  }

  const isLocked = log.submissionStatus === 'approved';
  const isReturned = log.submissionStatus === 'returned_for_correction';
  const isSubmitted = log.submissionStatus === 'submitted';

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header & Date Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-900">GIITS FDAR Daily Entry</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                log.submissionStatus === 'approved'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : log.submissionStatus === 'submitted'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : log.submissionStatus === 'returned_for_correction'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              {log.submissionStatus.replace(/_/g, ' ')}
            </span>
            {log.revisionNumber > 1 && (
              <span className="text-[10px] text-slate-500 font-semibold">
                (Rev #{log.revisionNumber})
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {log.facultyName} • {log.departmentName}
          </h2>
          <p className="text-xs text-slate-500">
            Designation: {log.designation} • Employee ID: {log.employeeId}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Register Date:</label>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => setActiveDate(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Return Remarks Alert if Returned for Correction */}
      {isReturned && (
        <div className="bg-rose-50 border border-rose-300 p-4 rounded-2xl text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-rose-800 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>HOD Remarks for Correction:</span>
          </div>
          <p className="text-rose-700 pl-6 leading-relaxed font-medium">
            "{log.returnRemarks}"
          </p>
          <p className="text-rose-600 pl-6 text-[11px]">
            Please review the requested changes in the periods below, update the content, and click "Resubmit Register".
          </p>
        </div>
      )}

      {/* Locked status banner */}
      {isLocked && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800">
            <Lock className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="font-bold">Register Approved & Locked.</span>
              <p className="text-[11px] text-emerald-700">
                Approved by {log.reviewedByName || 'HOD'} on {log.reviewedAt ? new Date(log.reviewedAt).toLocaleString() : ''}. Remarks: "{log.approvalRemarks || 'Approved'}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error or Success banners */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveSuccessNotice && (
        <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Activity draft saved successfully!</span>
        </div>
      )}

      {/* Vertical Period Cards (7 Periods) */}
      <div className="space-y-3.5">
        {log.periods.map((period) => {
          const isExpanded = expandedPeriod === period.periodNumber;
          const category = getActivityCategory(period.actualActivity as ActivityType);
          const isPeriodCompleted = period.status === 'completed';

          return (
            <div
              key={period.periodNumber}
              className={`bg-white rounded-2xl border transition-all ${
                isPeriodCompleted
                  ? 'border-emerald-200 shadow-xs'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              {/* Period Card Header */}
              <div
                onClick={() => setExpandedPeriod(isExpanded ? null : period.periodNumber)}
                className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 rounded-2xl transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isPeriodCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    P{period.periodNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        Period {period.periodNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        ({period.startTime} - {period.endTime})
                      </span>
                      {period.isContinuousLab && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                          Continuous Lab
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                      <span className="text-slate-400">Scheduled:</span>
                      <span className="font-medium text-slate-700">{period.scheduledActivity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isPeriodCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {period.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Collapsible Period Form Fields */}
              {isExpanded && (
                <div className="p-4 pt-1 border-t border-slate-100 space-y-4 text-xs">
                  {/* Actual Activity Dropdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Actual Activity Conducted <span className="text-rose-500">*</span>
                      </label>
                      <select
                        disabled={isLocked}
                        value={period.actualActivity}
                        onChange={(e) =>
                          handlePeriodChange(period.periodNumber, 'actualActivity', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <optgroup label="Academic Activities">
                          {ACADEMIC_ACTIVITIES.map((act) => (
                            <option key={act.type} value={act.type}>
                              {act.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Non-Teaching Activities">
                          {NON_TEACHING_ACTIVITIES.map((act) => (
                            <option key={act.type} value={act.type}>
                              {act.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Other Statuses">
                          {OTHER_STATUSES.map((act) => (
                            <option key={act.type} value={act.type}>
                              {act.label}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Completion Status Toggle */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Period Status
                      </label>
                      <select
                        disabled={isLocked}
                        value={period.status}
                        onChange={(e) =>
                          handlePeriodChange(period.periodNumber, 'status', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="exempt">Exempt (Leave / Non-Working)</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Fields for Theory Class */}
                  {category === 'academic' && period.actualActivity !== 'Laboratory Class' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Subject Name & Code
                        </label>
                        <input
                          disabled={isLocked}
                          type="text"
                          placeholder="e.g. Database Management Systems (CS301PC)"
                          value={period.subjectName || ''}
                          onChange={(e) =>
                            handlePeriodChange(period.periodNumber, 'subjectName', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Year, Semester & Section
                        </label>
                        <div className="flex gap-2">
                          <input
                            disabled={isLocked}
                            type="text"
                            placeholder="Year (e.g. III)"
                            value={period.year || ''}
                            onChange={(e) =>
                              handlePeriodChange(period.periodNumber, 'year', e.target.value)
                            }
                            className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                          />
                          <input
                            disabled={isLocked}
                            type="text"
                            placeholder="Sec (e.g. A)"
                            value={period.section || ''}
                            onChange={(e) =>
                              handlePeriodChange(period.periodNumber, 'section', e.target.value)
                            }
                            className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Students Present / Total
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            disabled={isLocked}
                            type="number"
                            placeholder="Present"
                            value={period.studentsPresent ?? ''}
                            onChange={(e) =>
                              handlePeriodChange(
                                period.periodNumber,
                                'studentsPresent',
                                e.target.value ? parseInt(e.target.value, 10) : undefined
                              )
                            }
                            className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                          />
                          <span className="text-slate-400">/</span>
                          <input
                            disabled={isLocked}
                            type="number"
                            placeholder="Total"
                            value={period.totalStudents ?? 64}
                            onChange={(e) =>
                              handlePeriodChange(
                                period.periodNumber,
                                'totalStudents',
                                e.target.value ? parseInt(e.target.value, 10) : undefined
                              )
                            }
                            className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Topic Covered in Class <span className="text-rose-500">*</span>
                        </label>
                        <input
                          disabled={isLocked}
                          type="text"
                          placeholder="Specific academic topic taught during this period (e.g. BCNF Decomposition, Query Optimizer Plans)"
                          value={period.topicCovered || ''}
                          onChange={(e) =>
                            handlePeriodChange(period.periodNumber, 'topicCovered', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dynamic Fields for Laboratory Class */}
                  {period.actualActivity === 'Laboratory Class' && (
                    <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 text-[11px]">
                          Laboratory Details & Continuous Session
                        </span>
                        {!isLocked && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500">Continuous Lab:</span>
                            <button
                              type="button"
                              onClick={() => handleApplyContinuousLab(period.periodNumber, 2)}
                              className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-semibold transition"
                            >
                              Span 2 Periods
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyContinuousLab(period.periodNumber, 3)}
                              className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-semibold transition"
                            >
                              Span 3 Periods
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Laboratory Name
                          </label>
                          <input
                            disabled={isLocked}
                            type="text"
                            placeholder="e.g. Advanced Computing Lab 2"
                            value={period.labName || ''}
                            onChange={(e) =>
                              handlePeriodChange(period.periodNumber, 'labName', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Experiment Number
                          </label>
                          <input
                            disabled={isLocked}
                            type="text"
                            placeholder="e.g. Exp 4 / Lab Task 3"
                            value={period.experimentNumber || ''}
                            onChange={(e) =>
                              handlePeriodChange(period.periodNumber, 'experimentNumber', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Batch & Section
                          </label>
                          <input
                            disabled={isLocked}
                            type="text"
                            placeholder="e.g. Batch B1, Section A"
                            value={period.batch || ''}
                            onChange={(e) =>
                              handlePeriodChange(period.periodNumber, 'batch', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Students Attended
                          </label>
                          <input
                            disabled={isLocked}
                            type="number"
                            placeholder="Present count"
                            value={period.studentsPresent ?? ''}
                            onChange={(e) =>
                              handlePeriodChange(
                                period.periodNumber,
                                'studentsPresent',
                                e.target.value ? parseInt(e.target.value, 10) : undefined
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                          />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-4">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Experiment Title & Practical Output
                          </label>
                          <input
                            disabled={isLocked}
                            type="text"
                            placeholder="Detailed title of lab experiment executed"
                            value={period.experimentTitle || ''}
                            onChange={(e) =>
                              handlePeriodChange(period.periodNumber, 'experimentTitle', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Fields for Non-Teaching / Administrative Activities */}
                  {category === 'non_teaching' && (
                    <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Work / Task Title
                          </label>
                          <input
                            disabled={isLocked}
                            type="text"
                            placeholder="e.g. NAAC Criterion 2 Data Compilation"
                            value={period.workTitle || ''}
                            onChange={(e) =>
                              handlePeriodChange(period.periodNumber, 'workTitle', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Task Outcome / Progress Achieved
                          </label>
                          <input
                            disabled={isLocked}
                            type="text"
                            placeholder="Key deliverable or outcome produced during this period"
                            value={period.outcome || ''}
                            onChange={(e) =>
                              handlePeriodChange(period.periodNumber, 'outcome', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Fields for Leave / On-Duty */}
                  {period.actualActivity.includes('Leave') && (
                    <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Leave Reference / Sanction Approval ID
                        </label>
                        <input
                          disabled={isLocked}
                          type="text"
                          placeholder="e.g. HR-LV-2026-089"
                          value={period.approvalReference || ''}
                          onChange={(e) =>
                            handlePeriodChange(period.periodNumber, 'approvalReference', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Leave Reason & HOD Intimation
                        </label>
                        <input
                          disabled={isLocked}
                          type="text"
                          placeholder="Approved casual/medical leave reasons"
                          value={period.remarks || ''}
                          onChange={(e) =>
                            handlePeriodChange(period.periodNumber, 'remarks', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* General Period Remarks */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Additional Remarks / Notes (Optional)
                    </label>
                    <input
                      disabled={isLocked}
                      type="text"
                      placeholder="Any observations, assignments given, student participation, etc."
                      value={period.remarks || ''}
                      onChange={(e) =>
                        handlePeriodChange(period.periodNumber, 'remarks', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Daily Summary & Additional Activities Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          Daily Summary & Additional Academic Activities
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Overall Day Summary
          </label>
          <textarea
            disabled={isLocked}
            rows={2}
            placeholder="Brief executive summary of today's academic achievements, meetings attended, student mentoring, etc."
            value={log.dailySummary || ''}
            onChange={(e) => setLog({ ...log, dailySummary: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Official submission window: 03:55 PM onwards</span>
          </div>

          <div className="flex items-center gap-2">
            {!isLocked && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFinalSubmit()}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition"
                >
                  <Send className="w-4 h-4" />
                  <span>{isReturned ? 'Resubmit Register' : 'Final Submit Register'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Late Submission Justification Modal */}
      {lateReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Submission Timing Notice</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official register submissions occur after 03:55 PM. Submitting prior to 03:55 PM or after midnight requires a valid institutional reason for the audit trail.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Authorized early institutional duty / On-duty exam supervision completed."
                value={lateReason}
                onChange={(e) => setLateReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setLateReasonModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFinalSubmit(lateReason)}
                disabled={!lateReason.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
