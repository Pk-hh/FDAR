import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  History,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  Menu,
} from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMoreMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab, onOpenMoreMenu }) => {
  const { role } = useAuth();

  const getMobileTabs = () => {
    switch (role) {
      case 'principal':
        return [
          { id: 'home', label: 'Home', icon: LayoutDashboard },
          { id: 'departments', label: 'Depts', icon: Building },
          { id: 'monitoring', label: 'Monitoring', icon: CheckCircle2 },
          { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
          { id: 'more', label: 'More', icon: Menu, isMore: true },
        ];
      case 'hod':
        return [
          { id: 'home', label: 'Home', icon: LayoutDashboard },
          { id: 'faculty', label: 'Faculty', icon: Users },
          { id: 'review', label: 'Review', icon: CheckCircle2 },
          { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
          { id: 'more', label: 'More', icon: Menu, isMore: true },
        ];
      case 'faculty':
      default:
        return [
          { id: 'home', label: 'Home', icon: LayoutDashboard },
          { id: 'daily_log', label: 'Daily Log', icon: BookOpen },
          { id: 'timetable', label: 'Timetable', icon: Calendar },
          { id: 'history', label: 'History', icon: History },
          { id: 'profile', label: 'Profile', icon: Users },
        ];
    }
  };

  const tabs = getMobileTabs();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-slate-400 pb-safe">
      <div className="grid grid-cols-5 h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.isMore) {
                  onOpenMoreMenu();
                } else {
                  onSelectTab(tab.id);
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-blue-400 font-semibold' : 'hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
