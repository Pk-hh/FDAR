import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Settings,
  Bell,
  Building,
  History,
  ShieldAlert,
  ClipboardList,
  Sparkles,
  UserCheck,
  Award,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { role } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case 'principal':
        return [
          { id: 'home', label: 'Executive Dashboard', icon: LayoutDashboard },
          { id: 'departments', label: 'Departments & HODs', icon: Building },
          { id: 'monitoring', label: 'Live Monitoring Matrix', icon: CheckCircle2 },
          { id: 'faculty_all', label: 'All Faculty Directory', icon: Users },
          { id: 'timetables', label: 'Timetable & Allocations', icon: Clock },
          { id: 'leaves', label: 'Leave & OD Sanctions', icon: UserCheck },
          { id: 'syllabus', label: 'Syllabus & NAAC Tracker', icon: BookOpen },
          { id: 'substitutions', label: 'Substitution Oversight', icon: UserCheck },
          { id: 'timings', label: 'College Timings & Calendar', icon: Clock },
          { id: 'reports', label: 'Consolidated Reports', icon: FileSpreadsheet },
          { id: 'announcements', label: 'Announcements', icon: Bell },
          { id: 'audit', label: 'Audit Trail Logs', icon: ShieldAlert },
          { id: 'settings', label: 'College Settings', icon: Settings },
        ];
      case 'hod':
        return [
          { id: 'home', label: 'Department Dashboard', icon: LayoutDashboard },
          { id: 'faculty', label: 'Faculty Management', icon: Users },
          { id: 'matrix', label: 'Daily Activity Matrix', icon: ClipboardList },
          { id: 'review', label: 'Review & Approvals', icon: CheckCircle2 },
          { id: 'my_register', label: 'My Daily Register', icon: BookOpen },
          { id: 'timetables', label: 'Timetable & Allocations', icon: Clock },
          { id: 'substitutions', label: 'Substitution Exchange', icon: UserCheck },
          { id: 'syllabus', label: 'Syllabus & CO Coverage', icon: Award },
          { id: 'leaves', label: 'Leave & On-Duty Records', icon: UserCheck },
          { id: 'reports', label: 'Department Reports', icon: FileSpreadsheet },
          { id: 'announcements', label: 'Announcements', icon: Bell },
        ];
      case 'faculty':
      default:
        return [
          { id: 'home', label: 'Personal Dashboard', icon: LayoutDashboard },
          { id: 'daily_log', label: 'Daily 7-Period Register', icon: BookOpen },
          { id: 'timetable', label: 'My Timetable', icon: Calendar },
          { id: 'substitutions', label: 'Substitution Requests', icon: UserCheck },
          { id: 'syllabus', label: 'Syllabus & CO Tracker', icon: Award },
          { id: 'history', label: 'Register History & Remarks', icon: History },
          { id: 'reports', label: 'My Activity Reports', icon: FileSpreadsheet },
          { id: 'announcements', label: 'Announcements', icon: Bell },
          { id: 'profile', label: 'My Profile', icon: Users },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } shrink-0 select-none`}
    >
      {/* Navigation menu */}
      <div className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        <div className={`px-2 mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-500 ${isCollapsed ? 'hidden' : 'block'}`}>
          Navigation ({role?.toUpperCase()})
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'hover:bg-slate-800 hover:text-slate-100 text-slate-300'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Collapse footer button */}
      <div className="p-2 border-t border-slate-800 text-xs">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 px-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition text-[11px]"
        >
          <span>{isCollapsed ? '→' : '← Collapse Menu'}</span>
        </button>
      </div>
    </aside>
  );
};
