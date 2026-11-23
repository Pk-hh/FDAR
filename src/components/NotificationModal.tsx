import React from 'react';
import { useCollege } from '@/contexts/CollegeContext';
import { X, Bell, CheckCheck, Megaphone, AlertCircle } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, announcements, markNotificationRead } = useCollege();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-sm">Notifications & Announcements</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
          {/* Announcements section */}
          <div>
            <h3 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wider text-slate-500">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <span>College & Department Announcements</span>
            </h3>

            {announcements.length === 0 ? (
              <p className="text-slate-400 italic py-2">No active announcements</p>
            ) : (
              <div className="space-y-2">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-3 rounded-xl border ${
                      ann.priority === 'urgent'
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-blue-50/50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900">{ann.title}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          ann.priority === 'urgent'
                            ? 'bg-rose-200 text-rose-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">{ann.content}</p>
                    <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>By: {ann.authorName}</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Notifications section */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wider text-slate-500">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <span>Activity & Submission Alerts</span>
            </h3>

            {notifications.length === 0 ? (
              <p className="text-slate-400 italic py-2">No pending notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      notif.isRead
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-blue-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{notif.title}</span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] mt-1">{notif.message}</p>
                    <div className="mt-1 text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
