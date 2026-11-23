import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { Announcement } from '@/types';
import {
  Bell,
  Megaphone,
  Plus,
  AlertCircle,
  Calendar,
  User,
  X,
  Send,
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { announcements, departments, refreshAll } = useCollege();

  const isPrincipal = role === 'principal';
  const isHod = role === 'hod';
  const canPublish = isPrincipal || isHod;

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [targetDeptId, setTargetDeptId] = useState(isHod ? currentUser?.departmentId || '' : 'college');

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim() || !content.trim()) return;

    const newAnn: Announcement = {
      id: 'ann_' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      type: targetDeptId === 'college' ? 'college' : 'department',
      departmentId: targetDeptId === 'college' ? undefined : targetDeptId,
      priority,
      createdBy: currentUser.uid,
      authorName: `${currentUser.fullName} (${currentUser.role === 'principal' ? 'Principal' : 'HOD'})`,
      authorRole: currentUser.role,
      createdAt: new Date().toISOString(),
    };

    await StorageService.saveAnnouncement(newAnn, currentUser.uid);
    await refreshAll();
    setModalOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <span>College & Department Announcements</span>
          </h2>
          <p className="text-xs text-slate-500">
            Institutional notices, circulars, exam duty instructions, and academic circulars.
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white rounded-2xl p-5 border shadow-xs space-y-2.5 transition ${
              ann.priority === 'urgent'
                ? 'border-rose-300 ring-1 ring-rose-300/40'
                : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    ann.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {ann.priority}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                  {ann.type === 'college' ? 'Institutional' : 'Departmental'}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{ann.title}</h3>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                {new Date(ann.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">
              {ann.content}
            </p>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Published by: <strong className="text-slate-700">{ann.authorName}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Announcement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Publish New Announcement</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Announcement Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Mid-Term Examination Script Evaluation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Audience Scope</label>
                  <select
                    disabled={isHod}
                    value={targetDeptId}
                    onChange={(e) => setTargetDeptId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50"
                  >
                    {isPrincipal && <option value="college">College-Wide (All Faculty & HODs)</option>}
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} Only
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent / Action Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Announcement Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed instructions or circular contents..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
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
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
