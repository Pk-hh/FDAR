import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { LeaveRecord } from '@/types';
import {
  CalendarOff,
  UserCheck,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, refreshAll } = useCollege();

  const deptId = currentUser?.departmentId || 'dept_cse';
  const deptFaculty = users.filter((u) => u.departmentId === deptId && u.role === 'faculty');

  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [formFacultyId, setFormFacultyId] = useState(deptFaculty[0]?.uid || '');
  const [formType, setFormType] = useState<'Casual Leave' | 'Medical Leave' | 'On Duty' | 'Special Leave'>('Casual Leave');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [formIsHalfDay, setFormIsHalfDay] = useState(false);
  const [formReason, setFormReason] = useState('');

  useEffect(() => {
    async function loadLeaves() {
      const all = await StorageService.getLeaveRecords(deptId);
      setLeaves(all);
    }
    loadLeaves();
  }, [deptId]);

  const handleSaveLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !formFacultyId) return;

    const fac = users.find((u) => u.uid === formFacultyId);

    const record: LeaveRecord = {
      id: 'leave_' + Date.now(),
      facultyId: formFacultyId,
      facultyName: fac?.fullName || 'Faculty',
      departmentId: deptId,
      startDate: formStartDate,
      endDate: formEndDate,
      leaveType: formType,
      isHalfDay: formIsHalfDay,
      reason: formReason,
      approvalStatus: 'approved',
      approvedBy: currentUser.fullName,
      createdAt: new Date().toISOString(),
    };

    await StorageService.saveLeaveRecord(record, currentUser.uid);
    setLeaves((prev) => [record, ...prev]);
    setModalOpen(false);
    setFormReason('');
    await refreshAll();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span>Departmental Leave & On-Duty Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Record casual leave, medical leave, and institutional On-Duty (OD) allocations.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Leave / On-Duty</span>
        </button>
      </div>

      {/* Leave Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Leave / Duty Type</th>
                <th className="py-3 px-4">Date Range</th>
                <th className="py-3 px-4">Reason / Sanction Details</th>
                <th className="py-3 px-4 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No active leave or on-duty records for this department.
                  </td>
                </tr>
              ) : (
                leaves.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{rec.facultyName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] ${
                          rec.leaveType === 'On Duty'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.leaveType}
                      </span>
                      {rec.isHalfDay && (
                        <span className="block text-[10px] text-slate-500 mt-0.5">Half Day</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                      {rec.startDate} {rec.startDate !== rec.endDate ? `to ${rec.endDate}` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm truncate">
                      {rec.reason || 'Institutional permission'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                        {rec.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Leave Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Record Department Leave / On-Duty</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Faculty Member</label>
                <select
                  value={formFacultyId}
                  onChange={(e) => setFormFacultyId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                >
                  {deptFaculty.map((f) => (
                    <option key={f.uid} value={f.uid}>
                      {f.fullName} ({f.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Medical Leave">Medical Leave (ML)</option>
                  <option value="On Duty">On Duty (OD)</option>
                  <option value="Special Leave">Special Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="halfday"
                  checked={formIsHalfDay}
                  onChange={(e) => setFormIsHalfDay(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="halfday" className="font-semibold text-slate-700 cursor-pointer">
                  Half-day leave session
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason / Approval Reference
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Attending JNTU evaluation duty / Personal leave"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
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
                  Sanction Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
