import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CollegeSettings,
  Department,
  User,
  DailyLog,
  Holiday,
  Announcement,
  NotificationItem,
} from '@/types';
import { StorageService } from '@/services/storageService';
import { getCurrentTimingState, CurrentTimingState } from '@/utils/timings';

interface CollegeContextType {
  settings: CollegeSettings | null;
  departments: Department[];
  users: User[];
  dailyLogs: DailyLog[];
  holidays: Holiday[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  timingState: CurrentTimingState;
  isOnline: boolean;
  pendingSyncCount: number;
  refreshAll: () => Promise<void>;
  updateSettings: (partial: Partial<CollegeSettings>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export const CollegeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [timingState, setTimingState] = useState<CurrentTimingState>(() => getCurrentTimingState());
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  const loadData = useCallback(async () => {
    try {
      const [s, d, u, l, h, a, n] = await Promise.all([
        StorageService.getCollegeSettings(),
        StorageService.getDepartments(),
        StorageService.getUsers(),
        StorageService.getDailyLogs(),
        StorageService.getHolidays(),
        StorageService.getAnnouncements(),
        StorageService.getNotifications(),
      ]);
      setSettings(s);
      setDepartments(d);
      setUsers(u);
      setDailyLogs(l);
      setHolidays(h);
      setAnnouncements(a);
      setNotifications(n);
    } catch (err) {
      console.error('Error loading college data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadData]);

  // Live digital clock: update every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimingState(getCurrentTimingState(settings?.timings));
    }, 1000);
    return () => clearInterval(timer);
  }, [settings?.timings]);

  const updateSettings = async (partial: Partial<CollegeSettings>) => {
    if (!settings) return;
    const updated = await StorageService.updateCollegeSettings(partial, 'admin');
    setSettings(updated);
  };

  const markNotificationRead = async (id: string) => {
    await StorageService.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <CollegeContext.Provider
      value={{
        settings,
        departments,
        users,
        dailyLogs,
        holidays,
        announcements,
        notifications,
        timingState,
        isOnline,
        pendingSyncCount,
        refreshAll: loadData,
        updateSettings,
        markNotificationRead,
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error('useCollege must be used within a CollegeProvider');
  }
  return context;
};
