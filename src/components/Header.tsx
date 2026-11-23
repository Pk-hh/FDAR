import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import {
  Bell,
  Clock,
  Wifi,
  WifiOff,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Building,
  GraduationCap,
  Shield,
  Layers,
} from 'lucide-react';

import { CampusPresenceBadge } from './CampusPresenceBadge';

interface HeaderProps {
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const { currentUser, role, logout } = useAuth();
  const { settings, timingState, isOnline, notifications } = useCollege();
  const [profileDropdown, setProfileDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roleBadgeColor = {
    principal: 'bg-amber-100 text-amber-800 border-amber-300',
    hod: 'bg-blue-100 text-blue-800 border-blue-300',
    faculty: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  }[role || 'faculty'];

  const roleLabel = {
    principal: 'Principal / Admin',
    hod: `HOD (${currentUser?.departmentName?.split(' ')[0] || 'Dept'})`,
    faculty: 'Faculty Member',
  }[role || 'faculty'];

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b border-slate-800 shadow-md">
      {/* Top institutional strip */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 truncate">
          <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-semibold tracking-wide truncate">
            {settings?.collegeName || 'GONNA INSTITUTE OF INFORMATION TECHNOLOGY AND SCIENCES (GIITS)'}
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
            AY: {settings?.academicYear} ({settings?.currentSemester})
          </span>
        </div>

        {/* Live digital clock */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-blue-300 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>{timingState.currentTimeFormatted} IST</span>
          </div>

          {/* Connection status */}
          <div
            className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${
              isOnline ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
            }`}
            title={isOnline ? 'Network Connected' : 'Offline - Drafts saved locally'}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden xs:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Main app bar */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.collegeName || 'GIITS'}
              className="w-10 h-10 rounded-lg object-contain bg-white/95 p-0.5 border border-slate-700 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner font-black text-white text-base tracking-tighter shrink-0 border border-blue-400/30">
              GIITS
            </div>
          )}
          <div>
            <h1 className="text-sm sm:text-base font-bold leading-tight flex items-center gap-2">
              <span>Faculty Daily Activity Register</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 font-medium">
                FDAR
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden xs:block truncate">
              {currentUser?.departmentName || 'Centralized Academic Monitoring System'}
            </p>
          </div>
        </div>

        {/* Action icons & profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Institutional Campus Presence Verification */}
          <CampusPresenceBadge />

          {/* Notifications button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdown(!profileDropdown)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-left"
            >
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-blue-400 border border-slate-600">
                {currentUser?.fullName.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold leading-tight">{currentUser?.fullName}</p>
                <span className={`inline-block text-[10px] font-medium px-1.5 py-0 rounded border mt-0.5 ${roleBadgeColor}`}>
                  {roleLabel}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {profileDropdown && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-slate-800 dark:text-slate-200 text-xs"
                onClick={() => setProfileDropdown(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white">{currentUser?.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">ID: {currentUser?.employeeId}</p>
                </div>

                <div className="py-1">
                  <div className="px-3 py-2 text-[11px] text-slate-500 flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{currentUser?.departmentName || 'Administration'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
