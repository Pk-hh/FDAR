import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DailyLog } from '@/types';

// Faculty Pages
import { FacultyDashboard } from '@/pages/faculty/FacultyDashboard';
import { DailyRegisterForm } from '@/pages/faculty/DailyRegisterForm';
import { FacultyTimetable } from '@/pages/faculty/FacultyTimetable';
import { FacultyHistory } from '@/pages/faculty/FacultyHistory';
import { FacultyProfile } from '@/pages/faculty/FacultyProfile';

// HOD Pages
import { HodDashboard } from '@/pages/hod/HodDashboard';
import { FacultyManagement } from '@/pages/hod/FacultyManagement';
import { DailyActivityMatrix } from '@/pages/hod/DailyActivityMatrix';
import { TimetableManagement } from '@/pages/hod/TimetableManagement';
import { LeaveManagement } from '@/pages/hod/LeaveManagement';
import { ReviewRegisterModal } from '@/pages/hod/ReviewRegisterModal';

// Principal Pages
import { PrincipalDashboard } from '@/pages/principal/PrincipalDashboard';
import { DepartmentManagement } from '@/pages/principal/DepartmentManagement';
import { InstitutionalMonitoring } from '@/pages/principal/InstitutionalMonitoring';
import { CollegeTimingsSettings } from '@/pages/principal/CollegeTimingsSettings';
import { AuditLogViewer } from '@/pages/principal/AuditLogViewer';
import { CollegeSettingsPage } from '@/pages/principal/CollegeSettingsPage';

// Shared Pages
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { AnnouncementsPage } from '@/pages/announcements/AnnouncementsPage';
import { SyllabusCoveragePage } from '@/pages/analytics/SyllabusCoveragePage';
import { SubstitutionMarketplace } from '@/pages/faculty/SubstitutionMarketplace';

export const App: React.FC = () => {
  const { currentUser, role, isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedReviewLog, setSelectedReviewLog] = useState<DailyLog | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl animate-bounce">
          GIITS
        </div>
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Loading GIITS Academic System...</p>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  // Render content based on user role and active tab
  const renderContent = () => {
    // 1. Principal Role
    if (role === 'principal') {
      switch (currentTab) {
        case 'home':
          return (
            <PrincipalDashboard
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenReviewModal={(log) => setSelectedReviewLog(log)}
            />
          );
        case 'departments':
          return <DepartmentManagement />;
        case 'monitoring':
          return (
            <InstitutionalMonitoring
              onOpenReviewModal={(log) => setSelectedReviewLog(log)}
            />
          );
        case 'faculty_all':
          return <FacultyManagement />;
        case 'timetables':
          return <TimetableManagement />;
        case 'leaves':
          return <LeaveManagement />;
        case 'syllabus':
          return <SyllabusCoveragePage />;
        case 'substitutions':
          return <SubstitutionMarketplace />;
        case 'timings':
          return <CollegeTimingsSettings />;
        case 'reports':
          return <ReportsPage />;
        case 'announcements':
          return <AnnouncementsPage />;
        case 'audit':
          return <AuditLogViewer />;
        case 'settings':
          return <CollegeSettingsPage />;
        default:
          return (
            <PrincipalDashboard
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenReviewModal={(log) => setSelectedReviewLog(log)}
            />
          );
      }
    }

    // 2. Head of Department (HOD) Role
    if (role === 'hod') {
      switch (currentTab) {
        case 'home':
          return (
            <HodDashboard
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenReviewModal={(log) => setSelectedReviewLog(log)}
            />
          );
        case 'faculty':
          return <FacultyManagement />;
        case 'matrix':
        case 'review':
          return (
            <DailyActivityMatrix
              onOpenReviewModal={(log) => setSelectedReviewLog(log)}
            />
          );
        case 'my_register':
          return <DailyRegisterForm />;
        case 'timetables':
          return <TimetableManagement />;
        case 'substitutions':
          return <SubstitutionMarketplace />;
        case 'syllabus':
          return <SyllabusCoveragePage />;
        case 'leaves':
          return <LeaveManagement />;
        case 'reports':
          return <ReportsPage />;
        case 'announcements':
          return <AnnouncementsPage />;
        default:
          return (
            <HodDashboard
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenReviewModal={(log) => setSelectedReviewLog(log)}
            />
          );
      }
    }

    // 3. Faculty Member Role
    switch (currentTab) {
      case 'home':
        return <FacultyDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'daily_log':
        return <DailyRegisterForm onSuccessSubmit={() => setCurrentTab('home')} />;
      case 'timetable':
        return <FacultyTimetable />;
      case 'substitutions':
        return <SubstitutionMarketplace />;
      case 'syllabus':
        return <SyllabusCoveragePage />;
      case 'history':
        return <FacultyHistory />;
      case 'reports':
        return <ReportsPage />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'profile':
        return <FacultyProfile />;
      default:
        return <FacultyDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <AppLayout currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)}>
      {renderContent()}

      {/* Review & Approval Modal for HODs and Principal */}
      {selectedReviewLog && (
        <ReviewRegisterModal
          log={selectedReviewLog}
          onClose={() => setSelectedReviewLog(null)}
          onSuccess={() => setSelectedReviewLog(null)}
        />
      )}
    </AppLayout>
  );
};
export default App;
