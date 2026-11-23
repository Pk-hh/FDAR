import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { TimetableEntry } from '@/types';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle } from 'lucide-react';
import { getActivityColor } from '@/utils/activities';

export const FacultyTimetable: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings } = useCollege();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [activeDay, setActiveDay] = useState<string>('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    async function loadTimetable() {
      if (!currentUser) return;
      const all = await StorageService.getTimetables(currentUser.departmentId, currentUser.uid);
      setEntries(all);
    }
    loadTimetable();
  }, [currentUser]);

  const academicTimings = (settings?.timings || []).filter((t) => !t.isBreak);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Timetable Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Weekly Allocated Timetable</span>
          </h2>
          <p className="text-xs text-slate-500">
            {currentUser?.fullName} ({currentUser?.designation}) • {currentUser?.departmentName}
          </p>
        </div>

        {/* Day Pills */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeDay === d
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {d.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Allocated Periods Table for Active Day */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Schedule for {activeDay} (7 Academic Periods)
          </h3>
          <span className="text-xs text-slate-500">
            Timetable Version: AY {settings?.academicYear}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-3">Period</th>
                <th className="py-3 px-3">Timings</th>
                <th className="py-3 px-3">Subject Name & Code</th>
                <th className="py-3 px-3">Class & Section</th>
                <th className="py-3 px-3">Venue / Lab</th>
                <th className="py-3 px-3">Activity Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {academicTimings.map((timing) => {
                const match = entries.find(
                  (e) => e.day.toLowerCase() === activeDay.toLowerCase() && e.periodNumber === timing.periodNumber
                );
                const color = getActivityColor(match ? match.activityType : 'Free Period');

                return (
                  <tr key={timing.periodNumber} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-bold text-slate-800">
                      Period {timing.periodNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {timing.startTime} - {timing.endTime}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {match?.subjectName || 'Free Period / Academic Preparation'}
                      {match?.subjectCode && (
                        <span className="block text-[10px] text-blue-600 font-mono">
                          {match.subjectCode}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {match?.section ? `${match.year}-${match.section}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 flex items-center gap-1">
                      {match?.roomOrLab ? (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{match.roomOrLab}</span>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-medium border ${color.bg} ${color.text} ${color.border}`}>
                        {match?.activityType || 'Free Period'}
                      </span>
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
