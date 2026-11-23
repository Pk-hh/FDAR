import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Phone, Mail, Building, Award, Calendar, Shield, Save, CheckCircle } from 'lucide-react';

export const FacultyProfile: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [mobileNumber, setMobileNumber] = useState(currentUser?.mobileNumber || '');
  const [qualification, setQualification] = useState(currentUser?.qualification || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ mobileNumber, qualification });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-blue-500">
            {currentUser?.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentUser?.fullName}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser?.designation} • {currentUser?.departmentName}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Employee ID: {currentUser?.employeeId}
            </p>
          </div>
        </div>

        {isSaved && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Email Address (Read-only)</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{currentUser?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mobile Contact Number</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus-within:ring-2 focus-within:ring-blue-500">
                <Phone className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Academic Qualification</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus-within:ring-2 focus-within:ring-blue-500">
                <Award className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. M.Tech, Ph.D."
                  className="w-full bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Date of Joining (Read-only)</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{currentUser?.dateOfJoining || '2021-07-15'}</span>
              </div>
            </div>
          </div>

          {/* Assigned Subjects & Classes Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs">Official Departmental Allocations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Assigned Subjects:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(currentUser?.assignedSubjects || ['Database Management Systems', 'Web Tech Lab']).map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-medium text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Assigned Classes & Sections:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(currentUser?.assignedClasses || ['III-CSE-A', 'II-CSE-B']).map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 font-medium text-[11px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Note: Institutional role, department assignments, and class allocations can only be modified by your Head of Department or Principal.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
