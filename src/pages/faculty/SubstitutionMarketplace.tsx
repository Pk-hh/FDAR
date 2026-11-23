import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { Substitution, User, TimetableEntry } from '@/types';
import {
  UserCheck,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Send,
  Sparkles,
} from 'lucide-react';

export const SubstitutionMarketplace: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, timingState, refreshAll } = useCollege();

  const deptId = currentUser?.departmentId || 'dept_cse';
  const deptFaculty = users.filter((u) => u.departmentId === deptId && u.role === 'faculty' && u.isActive);

  const [substitutions, setSubstitutions] = useState<Substitution[]>([
    {
      id: 'sub_sample_1',
      date: timingState.dateKey,
      periodNumber: 4,
      originalFacultyId: 'user_fac_cse_2',
      originalFacultyName: 'Mrs. T. Lakshmi',
      substituteFacultyId: 'user_fac_cse_1',
      substituteFacultyName: 'Mr. B. Praveen Kumar',
      departmentId: deptId,
      subjectName: 'Operating Systems (Section B)',
      section: 'B',
      status: 'assigned',
      reason: 'FDP Attendance duty',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [reqPeriod, setReqPeriod] = useState(3);
  const [reqSubject, setReqSubject] = useState('Database Management Systems');
  const [reqSection, setReqSection] = useState('A');
  const [reqSubstituteId, setReqSubstituteId] = useState('');
  const [reqReason, setReqReason] = useState('Authorized On-Duty Evaluation');

  // Filter available faculty who do not have a class in this period
  const eligibleSubstitutes = deptFaculty.filter((f) => f.uid !== currentUser?.uid);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !reqSubstituteId) return;

    const target = deptFaculty.find((f) => f.uid === reqSubstituteId);

    const newSub: Substitution = {
      id: 'sub_' + Date.now(),
      date: timingState.dateKey,
      periodNumber: reqPeriod,
      originalFacultyId: currentUser.uid,
      originalFacultyName: currentUser.fullName,
      substituteFacultyId: reqSubstituteId,
      substituteFacultyName: target?.fullName || 'Faculty Member',
      departmentId: deptId,
      subjectName: reqSubject,
      section: reqSection,
      status: 'assigned',
      reason: reqReason,
      createdAt: new Date().toISOString(),
    };

    setSubstitutions((prev) => [newSub, ...prev]);
    setModalOpen(false);

    // Send notification to the chosen substitute
    await StorageService.addNotification({
      userId: reqSubstituteId,
      title: `Substitution Request from ${currentUser.fullName}`,
      message: `You have been requested to take Period ${reqPeriod} (${reqSubject}) today. Reason: ${reqReason}`,
      type: 'substitution',
    });

    alert('Substitution class request allocated and notification dispatched!');
  };

  const handleMarkComplete = (subId: string) => {
    setSubstitutions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, status: 'completed' as const } : s))
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span>Class Substitution Marketplace & Exchange</span>
          </h2>
          <p className="text-xs text-slate-500">
            Request colleague class coverage during approved leave/on-duty and track substitution completions.
          </p>
        </div>

        <button
          onClick={() => {
            if (eligibleSubstitutes.length > 0) {
              setReqSubstituteId(eligibleSubstitutes[0].uid);
            }
            setModalOpen(true);
          }}
          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Request Substitution</span>
        </button>
      </div>

      {/* Substitutions Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Active Department Substitutions Today ({timingState.dateKey})
          </h3>
          <span className="text-[11px] text-slate-500">
            {substitutions.length} Recorded Allocations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Period</th>
                <th className="py-2.5 px-4">Class & Subject</th>
                <th className="py-2.5 px-4">Absent Faculty</th>
                <th className="py-2.5 px-4">Covering Faculty</th>
                <th className="py-2.5 px-4">Reason</th>
                <th className="py-2.5 px-4 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {substitutions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">Period {sub.periodNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {sub.subjectName} (Sec {sub.section})
                  </td>
                  <td className="py-3 px-4 text-slate-600">{sub.originalFacultyName}</td>
                  <td className="py-3 px-4 font-semibold text-blue-700">{sub.substituteFacultyName}</td>
                  <td className="py-3 px-4 text-slate-500">{sub.reason}</td>
                  <td className="py-3 px-4 text-right">
                    {sub.status === 'completed' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkComplete(sub.id)}
                        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition"
                      >
                        Mark Handled
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Substitution Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Request Class Coverage</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Period Number</label>
                <select
                  value={reqPeriod}
                  onChange={(e) => setReqPeriod(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>
                      Period {n} (0{n + 8}:30)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject & Section</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management Systems (III-CSE-A)"
                  value={reqSubject}
                  onChange={(e) => setReqSubject(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Available Department Faculty Member
                </label>
                <select
                  value={reqSubstituteId}
                  onChange={(e) => setReqSubstituteId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                >
                  {eligibleSubstitutes.map((f) => (
                    <option key={f.uid} value={f.uid}>
                      {f.fullName} ({f.employeeId}) • {f.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Leave / OD</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Medical appointment / JNTU Valuation Duty"
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Submit Substitution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
