import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  X,
  Clock,
  FileSpreadsheet,
  Settings,
  Bell,
  Building,
  History,
  ShieldAlert,
  ClipboardList,
  UserCheck,
  Users,
  Calendar,
  LogOut,
  Layers,
} from 'lucide-react';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const { role, logout } = useAuth();

  if (!isOpen) return null;

  const handleSelect = (tab: string) => {
    onSelectTab(tab);
    onClose();
  };

  const getMoreItems = () => {
    switch (role) {
      case 'principal':
        return [
          { id: 'faculty_all', label: 'All Faculty Directory', icon: Users },
          { id: 'syllabus', label: 'Syllabus & NAAC CO Tracker', icon: Building },
          { id: 'substitutions', label: 'Substitution Oversight', icon: UserCheck },
          { id: 'timings', label: 'College Timings & Calendar', icon: Clock },
          { id: 'announcements', label: 'College Announcements', icon: Bell },
          { id: 'audit', label: 'Audit Trail Logs', icon: ShieldAlert },
          { id: 'settings', label: 'Institution Settings & Branding', icon: Settings },
        ];
      case 'hod':
        return [
          { id: 'matrix', label: 'Daily Activity Matrix', icon: ClipboardList },
          { id: 'my_register', label: 'My Daily Activity Register', icon: ClipboardList },
          { id: 'substitutions', label: 'Substitution Exchange', icon: UserCheck },
          { id: 'syllabus', label: 'Syllabus & CO Coverage', icon: Building },
          { id: 'timetables', label: 'Faculty Timetable & Allocations', icon: Clock },
          { id: 'leaves', label: 'Department Leave & OD Records', icon: UserCheck },
          { id: 'announcements', label: 'Department Announcements', icon: Bell },
        ];
      case 'faculty':
      default:
        return [
          { id: 'substitutions', label: 'Substitution Requests', icon: UserCheck },
          { id: 'syllabus', label: 'Syllabus & Course Outcomes', icon: Building },
          { id: 'reports', label: 'Download My Activity Reports', icon: FileSpreadsheet },
          { id: 'announcements', label: 'Announcements', icon: Bell },
        ];
    }
  };

  const items = getMoreItems();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom duration-200">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <h2 className="font-bold text-sm">More Options</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 divide-y divide-slate-100 text-xs">
          <div className="py-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-medium transition"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="py-2 space-y-1">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-rose-50 text-rose-600 font-medium transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
