import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import {
  Settings,
  Upload,
  Save,
  CheckCircle,
  Building,
  Image,
  Clock,
  RotateCcw,
} from 'lucide-react';

export const CollegeSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings, updateSettings, refreshAll } = useCollege();

  const [collegeName, setCollegeName] = useState(settings?.collegeName || '');
  const [collegeCode, setCollegeCode] = useState(settings?.collegeCode || '');
  const [tagline, setTagline] = useState(settings?.tagline || '');
  const [address, setAddress] = useState(settings?.address || '');
  const [academicYear, setAcademicYear] = useState(settings?.academicYear || '2026-2027');
  const [currentSemester, setCurrentSemester] = useState<'ODD' | 'EVEN'>(settings?.currentSemester || 'EVEN');
  const [reminderTime, setReminderTime] = useState(settings?.reminderTime || '16:00');
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File upload reader for logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      collegeName,
      collegeCode,
      tagline,
      address,
      academicYear,
      currentSemester,
      reminderTime,
      logoUrl,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    await refreshAll();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Institutional Settings & College Branding</span>
          </h2>
          <p className="text-xs text-slate-500">
            Configure official college credentials, upload official crest logo, and set notification thresholds.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
        >
          <Save className="w-4 h-4" />
          <span>Save System Settings</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>College institutional branding & settings updated successfully!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Official College Logo Upload */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Image className="w-4 h-4 text-blue-600" />
            <span>Official College Logo</span>
          </h3>
          <p className="text-xs text-slate-500">
            Upload the official high-resolution logo for institutional headers and PDF/Excel academic reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
            <div className="w-24 h-24 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl border-2 border-slate-700 overflow-hidden shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="College Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-blue-400">GIITS</span>
              )}
            </div>

            <div className="space-y-2 flex-1 w-full">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload Official Logo File (PNG / JPG / SVG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400">
                Recommended dimension: 400x400 transparent PNG. Logo will automatically appear on generated PDF reports.
              </p>
            </div>
          </div>
        </div>

        {/* Institution Details */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>College Identification</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Full College Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">College Code</label>
              <input
                type="text"
                value={collegeCode}
                onChange={(e) => setCollegeCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Accreditation Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Campus Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Academic Year & Notification Configurations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Academic Term & Daily Reminders</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026-2027"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester Cycle</label>
              <select
                value={currentSemester}
                onChange={(e) => setCurrentSemester(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              >
                <option value="ODD">ODD Semester (I / III / V / VII)</option>
                <option value="EVEN">EVEN Semester (II / IV / VI / VIII)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Daily Register Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
