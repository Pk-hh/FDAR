import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { TimetableEntry, User, Substitution } from '@/types';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  UserCheck,
  Building,
  MapPin,
} from 'lucide-react';
import { getActivityColor } from '@/utils/activities';

export const TimetableManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, settings, refreshAll } = useCollege();

  const deptId = currentUser?.departmentId || 'dept_cse';
  const deptFaculty = users.filter((u) => u.departmentId === deptId && u.role === 'faculty' && u.isActive);

  const [activeDay, setActiveDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Add Entry Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);

  const [formFacultyId, setFormFacultyId] = useState(deptFaculty[0]?.uid || '');
  const [formPeriod, setFormPeriod] = useState(1);
  const [formSubjectName, setFormSubjectName] = useState('Operating Systems');
  const [formSubjectCode, setFormSubjectCode] = useState('CS302PC');
  const [formYear, setFormYear] = useState('III');
  const [formSemester] = useState('I');
  const [formSection, setFormSection] = useState('A');
  const [formRoom, setFormRoom] = useState('LH-201');
  const [formActivityType, setFormActivityType] = useState('Theory Class');

  // Substitution form state
  const [subOrigFacultyId, setSubOrigFacultyId] = useState(deptFaculty[0]?.uid || '');
  const [subTargetFacultyId, setSubTargetFacultyId] = useState(deptFaculty[1]?.uid || '');
  const [subPeriod, setSubPeriod] = useState(1);
  const [subReason, setSubReason] = useState('Casual Leave - class coverage assigned');

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  useEffect(() => {
    async function loadData() {
      const all = await StorageService.getTimetables(deptId);
      setEntries(all);
    }
    loadData();
  }, [deptId]);

  // Conflict detection
  const checkConflicts = (facultyId: string, day: string, periodNumber: number, section: string, room: string) => {
    // 1. Faculty conflict: Same faculty already assigned to another class in this period and day
    const facultyConflict = entries.find(
      (e) => e.facultyId === facultyId && e.day === day && e.periodNumber === periodNumber
    );
    if (facultyConflict) {
      return `Faculty Scheduling Conflict: Selected faculty is already assigned to ${facultyConflict.subjectName} in Period ${periodNumber}.`;
    }

    // 2. Class conflict: Same Year and Section already having another lecture in this period and day
    const classConflict = entries.find(
      (e) => e.day === day && e.periodNumber === periodNumber && e.section === section && e.year === formYear
    );
    if (classConflict) {
      return `Class Section Conflict: Class ${classConflict.year}-${classConflict.section} already has ${classConflict.subjectName} scheduled in Period ${periodNumber}.`;
    }

    // 3. Room conflict: Same room allocated in this period and day
    if (room) {
      const roomConflict = entries.find(
        (e) => e.day === day && e.periodNumber === periodNumber && e.roomOrLab?.toLowerCase() === room.toLowerCase()
      );
      if (roomConflict) {
        return `Venue Conflict: Room/Lab "${room}" is already occupied in Period ${periodNumber}.`;
      }
    }

    return null;
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const conflict = checkConflicts(formFacultyId, activeDay, formPeriod, formSection, formRoom);
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    const newEntry: TimetableEntry = {
      id: `tt_${Date.now()}`,
      departmentId: deptId,
      facultyId: formFacultyId,
      day: activeDay,
      periodNumber: formPeriod,
      subjectName: formSubjectName,
      subjectCode: formSubjectCode,
      year: formYear,
      semester: formSemester,
      section: formSection,
      roomOrLab: formRoom,
      activityType: formActivityType as any,
    };

    await StorageService.saveTimetableEntry(newEntry, currentUser.uid);
    setEntries((prev) => [...prev, newEntry]);
    setModalOpen(false);
    setConflictWarning(null);
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Delete this allocated timetable entry?')) {
      await StorageService.deleteTimetableEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Assign substitution
  const handleAssignSubstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const origFaculty = users.find((u) => u.uid === subOrigFacultyId);
    const subFaculty = users.find((u) => u.uid === subTargetFacultyId);

    const sub: Substitution = {
      id: 'sub_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      periodNumber: subPeriod,
      originalFacultyId: subOrigFacultyId,
      originalFacultyName: origFaculty?.fullName || 'Faculty',
      substituteFacultyId: subTargetFacultyId,
      substituteFacultyName: subFaculty?.fullName || 'Faculty',
      departmentId: deptId,
      subjectName: formSubjectName,
      section: formSection,
      status: 'assigned',
      reason: subReason,
      createdAt: new Date().toISOString(),
    };

    setSubstitutions((prev) => [sub, ...prev]);
    setSubModalOpen(false);
    // Notification for substitute faculty
    await StorageService.addNotification({
      userId: subTargetFacultyId,
      title: `Substitution Assigned (Period ${subPeriod})`,
      message: `You have been allocated a substitution class for ${origFaculty?.fullName} in Period ${subPeriod}. Reason: ${subReason}`,
      type: 'substitution',
    });
    alert('Substitution class assigned successfully! Notification sent to substitute faculty.');
  };

  const dayEntries = entries.filter((e) => e.day.toLowerCase() === activeDay.toLowerCase());
  const academicTimings = (settings?.timings || []).filter((t) => !t.isBreak);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Department Timetable & Substitution Console</span>
          </h2>
          <p className="text-xs text-slate-500">
            Configure Monday-Saturday schedules, prevent period conflicts, and allocate substitutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Substitution</span>
          </button>

          <button
            onClick={() => {
              setConflictWarning(null);
              setModalOpen(true);
            }}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Allocation</span>
          </button>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-wrap gap-1">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeDay === d
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Timetable Matrix for Selected Day */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          Allocated Schedule for {activeDay} ({dayEntries.length} Classes Configured)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Period & Time</th>
                <th className="py-2.5 px-3">Faculty Member</th>
                <th className="py-2.5 px-3">Subject Name & Code</th>
                <th className="py-2.5 px-3">Class & Sec</th>
                <th className="py-2.5 px-3">Room / Lab</th>
                <th className="py-2.5 px-3">Activity Type</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dayEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No classes allocated for {activeDay}. Click "Add Class Allocation" above to schedule periods.
                  </td>
                </tr>
              ) : (
                dayEntries.map((e) => {
                  const fac = users.find((u) => u.uid === e.facultyId);
                  const timing = academicTimings.find((t) => t.periodNumber === e.periodNumber);
                  const color = getActivityColor(e.activityType);

                  return (
                    <tr key={e.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900">Period {e.periodNumber}</span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {timing?.startTime} - {timing?.endTime}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{fac?.fullName || 'Faculty'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{fac?.employeeId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-900">{e.subjectName}</span>
                        {e.subjectCode && (
                          <span className="block text-[10px] text-blue-600 font-mono">
                            {e.subjectCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {e.year}-{e.section}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {e.roomOrLab || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${color.bg} ${color.text} ${color.border}`}>
                          {e.activityType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteEntry(e.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Remove allocation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Substitutions Record Log */}
      {substitutions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Assigned Class Substitutions Today</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2 px-3">Period</th>
                  <th className="py-2 px-3">Absent Faculty</th>
                  <th className="py-2 px-3">Substitute Faculty</th>
                  <th className="py-2 px-3">Reason</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {substitutions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-800">Period {sub.periodNumber}</td>
                    <td className="py-2.5 px-3 text-slate-700">{sub.originalFacultyName}</td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700">{sub.substituteFacultyName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{sub.reason}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Class Allocation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Allocate Class for {activeDay}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictWarning && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{conflictWarning}</span>
              </div>
            )}

            <form onSubmit={handleSaveEntry} className="space-y-3 text-xs">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Period</label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        Period {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Activity Type</label>
                  <select
                    value={formActivityType}
                    onChange={(e) => setFormActivityType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="Theory Class">Theory Class</option>
                    <option value="Laboratory Class">Laboratory Class</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Remedial Class">Remedial Class</option>
                    <option value="Student Mentoring">Student Mentoring</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={formSubjectName}
                    onChange={(e) => setFormSubjectName(e.target.value)}
                    placeholder="e.g. Computer Networks"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={formSubjectCode}
                    onChange={(e) => setFormSubjectCode(e.target.value)}
                    placeholder="e.g. CS401PC"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year & Section</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Year (III)"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Sec (A)"
                      value={formSection}
                      onChange={(e) => setFormSection(e.target.value)}
                      className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room / Lab Venue</label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="LH-302 / CSE Lab 1"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
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
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Substitution Modal */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Assign Class Substitution</h3>
              <button
                onClick={() => setSubModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubstitution} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Absent Faculty Member</label>
                <select
                  value={subOrigFacultyId}
                  onChange={(e) => setSubOrigFacultyId(e.target.value)}
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Substitute Faculty Member
                </label>
                <select
                  value={subTargetFacultyId}
                  onChange={(e) => setSubTargetFacultyId(e.target.value)}
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
                <label className="block font-semibold text-slate-700 mb-1">Period Number</label>
                <select
                  value={subPeriod}
                  onChange={(e) => setSubPeriod(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>
                      Period {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Instructions</label>
                <input
                  type="text"
                  required
                  value={subReason}
                  onChange={(e) => setSubReason(e.target.value)}
                  placeholder="e.g. Approved leave class engagement"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Confirm Substitution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
