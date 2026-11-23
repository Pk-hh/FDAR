import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { CollegeTiming, Holiday } from '@/types';
import { validateTimings, minutesToFormattedTime, formattedTimeToMinutes } from '@/utils/timings';
import {
  Clock,
  Calendar,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const CollegeTimingsSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings, holidays, updateSettings, refreshAll } = useCollege();

  const [timings, setTimings] = useState<CollegeTiming[]>(settings?.timings || []);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  // Holiday management state
  const [holidayList, setHolidayList] = useState<Holiday[]>(holidays);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayType, setHolidayType] = useState<'holiday' | 'special_working_day' | 'exam_day' | 'event'>('holiday');

  // Handle timing field change
  const handleTimingChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...timings];
    updated[index] = {
      ...updated[index],
      [field]: value,
      startMinutes: field === 'startTime' ? formattedTimeToMinutes(value) : updated[index].startMinutes,
      endMinutes: field === 'endTime' ? formattedTimeToMinutes(value) : updated[index].endMinutes,
    };
    setTimings(updated);
    setValidationError(null);
  };

  const handleSaveTimings = async () => {
    const validation = validateTimings(timings);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid timing configuration');
      return;
    }

    try {
      await updateSettings({ timings });
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 2500);
      await refreshAll();
    } catch (err: any) {
      setValidationError('Failed to update timings: ' + err.message);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !holidayDate || !holidayTitle) return;

    const newHol: Holiday = {
      id: 'hol_' + Date.now(),
      date: holidayDate,
      title: holidayTitle,
      type: holidayType,
    };

    await StorageService.saveHoliday(newHol, currentUser.uid);
    setHolidayList((prev) => [...prev, newHol]);
    setHolidayDate('');
    setHolidayTitle('');
    await refreshAll();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>College Timings & Academic Calendar Configuration</span>
          </h2>
          <p className="text-xs text-slate-500">
            Define institutional period schedules, break durations, academic terms, and official holidays.
          </p>
        </div>

        <button
          onClick={handleSaveTimings}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Timing Configurations</span>
        </button>
      </div>

      {validationError && (
        <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Timings updated and synchronized across all dashboards!</span>
        </div>
      )}

      {/* College Timings Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Daily Master Schedule (09:30 AM to 03:55 PM)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total College Duration: 6h 25m • Academic Periods: 5h 40m • Breaks: 45m
            </p>
          </div>
          <span className="text-xs text-blue-600 font-mono font-semibold bg-blue-50 px-2 py-1 rounded">
            Asia/Kolkata (IST)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Session</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Start Time</th>
                <th className="py-2.5 px-3">End Time</th>
                <th className="py-2.5 px-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timings.map((t, idx) => {
                const duration = t.endMinutes - t.startMinutes;
                return (
                  <tr
                    key={idx}
                    className={t.isBreak ? 'bg-amber-50/40 font-medium' : 'hover:bg-slate-50/70'}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {t.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.isBreak ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.isBreak ? 'Break Interval' : 'Academic Period'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={t.startTime}
                        onChange={(e) => handleTimingChange(idx, 'startTime', e.target.value)}
                        className="px-2.5 py-1 rounded border border-slate-300 font-mono text-xs w-28 text-slate-800 bg-white"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={t.endTime}
                        onChange={(e) => handleTimingChange(idx, 'endTime', e.target.value)}
                        className="px-2.5 py-1 rounded border border-slate-300 font-mono text-xs w-28 text-slate-800 bg-white"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {duration > 0 ? `${duration} mins` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Calendar & Holidays Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Academic Calendar Holidays & Working Days</span>
        </h3>

        {/* Add Holiday Form */}
        <form onSubmit={handleAddHoliday} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Title / Occasion</label>
            <input
              type="text"
              required
              placeholder="e.g. Ugadi / Internal Exam Day"
              value={holidayTitle}
              onChange={(e) => setHolidayTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Type</label>
            <select
              value={holidayType}
              onChange={(e) => setHolidayType(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
            >
              <option value="holiday">Public / Institutional Holiday</option>
              <option value="special_working_day">Special Working Day</option>
              <option value="exam_day">Examination Day</option>
              <option value="event">Institutional Event</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Calendar Entry</span>
            </button>
          </div>
        </form>

        {/* Holidays Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Title / Occasion</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holidayList.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-mono text-slate-800 font-semibold">{h.date}</td>
                  <td className="py-2.5 px-3 text-slate-900 font-medium">{h.title}</td>
                  <td className="py-2.5 px-3 capitalize text-slate-600">{h.type.replace(/_/g, ' ')}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      Effective
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
