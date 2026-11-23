import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { RoleSwitcherModal } from '@/components/RoleSwitcherModal';
import { NotificationModal } from '@/components/NotificationModal';
import { MoreMenuModal } from '@/components/MoreMenuModal';
import { PeriodCountdownTimer } from '@/components/PeriodCountdownTimer';

interface AppLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentTab, onSelectTab, children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Sticky Header */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={onSelectTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-6">
          <div className="max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 space-y-5">
            {/* Live Period Countdown & Chime Bar */}
            <PeriodCountdownTimer />
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        onOpenMoreMenu={() => setIsMoreMenuOpen(true)}
      />

      {/* Modals */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <MoreMenuModal
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        onSelectTab={onSelectTab}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
      />
    </div>
  );
};
