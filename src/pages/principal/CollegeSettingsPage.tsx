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
  MapPin,
  ShieldAlert,
  Download,
  AlertTriangle,
} from 'lucide-react';

export const CollegeSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings, users, departments, dailyLogs, updateSettings, refreshAll } = useCollege();

  const [collegeName, setCollegeName] = useState(settings?.collegeName || '');
  const [collegeCode, setCollegeCode] = useState(settings?.collegeCode || '');
  const [tagline, setTagline] = useState(settings?.tagline || '');
  const [address, setAddress] = useState(settings?.address || '');
  const [academicYear, setAcademicYear] = useState(settings?.academicYear || '2026-2027');
  const [currentSemester, setCurrentSemester] = useState<'ODD' | 'EVEN'>(settings?.currentSemester || 'EVEN');
  const [reminderTime, setReminderTime] = useState(settings?.reminderTime || '16:00');
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || '/logo.png');

  // Customization fields
  const [attendanceWarningThreshold, setAttendanceWarningThreshold] = useState<number>(
    settings?.attendanceWarningThreshold || 75
  );
  const [campusLatitude, setCampusLatitude] = useState<number>(settings?.campusLatitude || 17.6868);
  const [campusLongitude, setCampusLongitude] = useState<number>(settings?.campusLongitude || 83.2185);
  const [campusRadiusMeters, setCampusRadiusMeters] = useState<number>(settings?.campusRadiusMeters || 1500);

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
      attendanceWarningThreshold: Number(attendanceWarningThreshold),
      campusLatitude: Number(campusLatitude),
      campusLongitude: Number(campusLongitude),
      campusRadiusMeters: Number(campusRadiusMeters),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    await refreshAll();
  };

  // Export full institutional state as JSON backup
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.email,
      settings: {
        collegeName,
        collegeCode,
        tagline,
        address,
        academicYear,
        currentSemester,
        reminderTime,
        attendanceWarningThreshold,
        campusLatitude,
        campusLongitude,
        campusRadiusMeters,
      },
      departments,
      users,
      dailyLogs,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GIITS_FDAR_Backup_${academicYear}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Institutional Settings & System Customization</span>
          </h2>
          <p className="text-xs text-slate-500">
            Full administrative control over institutional branding, compliance thresholds, geofencing, and academic cycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Download full database snapshot"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Backup Data (JSON)</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Customizations</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Institutional configurations & customizations updated and synchronized successfully!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Official College Logo Upload */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Image className="w-4 h-4 text-blue-600" />
            <span>Official College Logo & Crest</span>
          </h3>
          <p className="text-xs text-slate-500">
            Upload the official high-resolution logo for institutional headers and PDF/Excel academic reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
            <div className="w-24 h-24 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl border-2 border-slate-700 overflow-hidden shrink-0 p-1">
              {logoUrl ? (
                <img src={logoUrl} alt="College Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-blue-400">GIITS</span>
              )}
            </div>

            <div className="space-y-2 flex-1 w-full">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer transition">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload New Logo (PNG / JPG / SVG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Direct Logo URL:</span>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/logo.png"
                  className="px-2.5 py-1 rounded-lg border border-slate-300 flex-1 text-xs"
                />
              </div>
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
            <span>College Identification & Credentials</span>
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs uppercase font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Accreditation & Affiliation Tagline</label>
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

        {/* Regulatory Thresholds & Geofence Calibration */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Campus Geofencing & Statutory Attendance Threshold</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Attendance Alert Threshold (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={attendanceWarningThreshold}
                  onChange={(e) => setAttendanceWarningThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
                <span className="text-slate-500 font-bold">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Triggers warning badge when attendance is below this.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Latitude (°N)</label>
              <input
                type="number"
                step="0.0001"
                value={campusLatitude}
                onChange={(e) => setCampusLatitude(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">GIITS Campus Latitude (default: 17.6868)</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Longitude (°E)</label>
              <input
                type="number"
                step="0.0001"
                value={campusLongitude}
                onChange={(e) => setCampusLongitude(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">GIITS Campus Longitude (default: 83.2185)</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Geofence Radius (Meters)</label>
              <input
                type="number"
                min="100"
                max="10000"
                step="100"
                value={campusRadiusMeters}
                onChange={(e) => setCampusRadiusMeters(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">Radius for campus verification badge (default: 1500m)</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
