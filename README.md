# Faculty Daily Activity Register (FDAR)
### Gonna Institute of Information Technology and Sciences (GIITS)

Centralized digital academic activity monitoring system replacing traditional handwritten faculty log registers. Designed mobile-first for smartphones, tablets, laptops, and desktop computers.

---

## 1. Institutional Overview & Architecture

- **Institution**: Gonna Institute of Information Technology and Sciences (GIITS), Visakhapatnam, Andhra Pradesh
- **System**: Faculty Daily Activity Register (FDAR)
- **Timezone**: `Asia/Kolkata` (IST)
- **College Hours**: 09:30 AM to 03:55 PM (6h 25m total duration)
  - 7 Academic Periods (5h 40m)
  - Short Break (11:10 AM - 11:20 AM)
  - Lunch Break (01:00 PM - 01:35 PM)
- **Document Identification**: Deterministic Document ID `${facultyId}_${date}` (prevents duplicate daily registers).

---

## 2. Technology Stack

- **Frontend**: React 19 with TypeScript, Vite
- **Styling**: Tailwind CSS v4 (Mobile-First, Responsive, Institutional Navy/Royal Blue Theme)
- **Icons**: Lucide React
- **Backend & Database**: Firebase Authentication, Cloud Firestore, Firebase Cloud Functions, Firebase App Check, Firebase Hosting
- **Data Visualization**: Recharts (Compliance bar charts, workload breakdown pie charts, trend lines)
- **Reporting**: `jsPDF` + `jspdf-autotable` (A4 landscape/portrait with official GIITS header, signature blocks, page numbers), `ExcelJS` (Formatted spreadsheets with auto-width columns)
- **PWA**: Installable Progressive Web App with service worker, offline draft saving, and background sync.

---

## 3. User Roles & Capabilities

### 👑 Principal (Institution-Wide Executive Access)
- **Executive Dashboard**: Institution-wide real-time metrics, department compliance comparison, teaching vs non-teaching workload ratio, and weekly submission trends.
- **Department Management**: Add, edit, and activate/deactivate departments (CSE, ECE, EEE, MECH, CIVIL, AIML, H&S) and allocate HODs.
- **Monitoring Console**: College-wide 7-period matrix for any historical date with drill-down navigation (Institution → Department → Faculty → Daily Register → Period Details).
- **HOD Activity Approvals**: Review and formally approve daily activity registers submitted by Heads of Department.
- **College Timings & Academic Calendar**: Configure college timings, validation to prevent session overlaps, term semesters, and holidays.
- **Announcements**: Publish institution-wide notifications.
- **Consolidated Reports**: Generate college-wide daily, weekly, and monthly PDF & Excel reports.
- **Audit Trail**: Searchable, append-only security logs of all administrative actions.

### 👔 Head of Department (HOD - Departmental Scope)
- **Department Dashboard**: Active faculty count, faculty on leave/duty, submitted registers, approval queue, and compliance percentage.
- **Faculty Management**: Add faculty, edit details, activate/deactivate accounts, bulk import via CSV, and generate secure invitation setup links.
- **Real-Time Faculty Activity Matrix**: Color-coded 7-period matrix displaying topics, attendance, and status for each department faculty member. Clicking any cell displays a detailed breakdown modal.
- **Review & Approval**: Approve submitted registers (locks record) or return for correction with mandatory instructions and revision tracking.
- **Timetable & Substitutions**: Create weekly Monday–Saturday schedules, detect scheduling conflicts, and assign class substitutions with automated notifications.
- **Leave & On-Duty Management**: Sanction casual leave, medical leave, and institutional On-Duty (OD) allocations.
- **HOD Daily Register**: Record own teaching, administrative, and NAAC activities, routed directly to the Principal.

### 👨‍🏫 Faculty Member (Personal Academic Records)
- **Personal Dashboard**: Live Asia/Kolkata digital clock, ongoing period indicator, remaining period duration, today's allocated timetable, and 7-period progress tracker with color codes.
- **Daily 7-Period Activity Register**:
  - Auto-populated scheduled activities from the assigned timetable.
  - Actual activity selector with dynamic category fields:
    - **Academic**: Theory Class, Laboratory Class (with 2–3 continuous period spanning), Tutorials, Mentoring, Invigilation, Project Guidance, Valuation, etc.
    - **Non-Teaching**: R&D, Departmental Work, NAAC/NBA Documentation, FDP, Meetings, etc.
    - **Other**: Free Period, On Duty, Casual/Medical Leave.
  - Automatic draft auto-saving.
  - Prevention of marking future periods as completed.
  - Final submission after 03:55 PM (or authorized late submission with mandatory justification).
- **History & Reports**: Calendar history of past registers, HOD remarks, and certified PDF downloads.
- **Profile**: View allocated subjects/classes and update permitted contact information.

---

## 4. 7-Period Progress Tracker Status Colors

| Color | Status Meaning |
|---|---|
| **Green** | Completed Period / Approved Register |
| **Blue** | Ongoing Period / Submitted (Under Review) |
| **Amber** | Pending Period Entry / Draft in Progress |
| **Purple** | Institutional On Duty (OD) |
| **Red** | Missing Submission / Returned for Correction |
| **Grey** | Upcoming Period / Exempt (Approved Leave) |

---

## 5. Certified Academic Reports (PDF & Excel)

All 13 official reports are generated on-demand with filters by single date, custom date range, department, faculty, and submission status:

1. Individual Faculty Daily Activity Register
2. Department Daily Activity Register
3. Consolidated College Daily Activity Report
4. Weekly Faculty Activity Report
5. Monthly Faculty Activity Report
6. Faculty Workload Report
7. Subject-wise Teaching Report
8. Period-wise Activity Report
9. Pending Submission Report
10. Faculty Leave and On-Duty Report
11. HOD Activity Report
12. Department Submission Compliance Report
13. Academic and Non-Academic Activity Report

*PDF reports include official GIITS headers, academic year, selected date range, table data, certified disclaimer, and physical countersignature spaces for Faculty, HOD, and Principal.*

---

## 6. Pre-Configured Seed Demo Accounts

For immediate testing, switch between authenticated accounts in the UI using the **"Switch Role"** button:

| Role | Account Name | Email | Employee ID |
|---|---|---|---|
| **Principal** | Dr. K. Satyanarayana | `principal@giits.edu.in` | `GIITS-DIR-001` |
| **HOD (CSE)** | Dr. V. Ramesh | `hod.cse@giits.edu.in` | `GIITS-CSE-001` |
| **Faculty (CSE)** | Mr. B. Praveen Kumar | `praveen.cse@giits.edu.in` | `GIITS-CSE-012` |
| **Faculty (CSE)** | Mrs. T. Lakshmi | `lakshmi.cse@giits.edu.in` | `GIITS-CSE-015` |
| **HOD (ECE)** | Dr. S. Anitha | `hod.ece@giits.edu.in` | `GIITS-ECE-001` |
| **Faculty (ECE)** | Mr. K. Ravi Teja | `ravi.ece@giits.edu.in` | `GIITS-ECE-010` |
| **HOD (EEE)** | Dr. P. Suresh | `hod.eee@giits.edu.in` | `GIITS-EEE-001` |

---

## 7. Installation & Running

### Prerequisites
- Node.js (v18+ or v20+)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional for Live Firebase)
Copy `.env.example` to `.env` and fill in your Firebase project credentials:
```bash
cp .env.example .env
```
*(If `.env` is omitted, the application runs seamlessly in local persistent mode with realistic GIITS seed data for instant evaluation).*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates optimized, code-split bundles in `dist/`.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 8. Firebase Backend Configuration & Deployment

### Firestore Rules & Indexes
- Rules: `firestore.rules` enforces role-based access, departmental isolation, active status check, and prevents self-approval.
- Indexes: `firestore.indexes.json` contains composite indexes for department, faculty, date, and status queries.

### Deploy to Firebase Hosting & Firestore
```bash
# Login to Firebase
firebase login

# Initialize project
firebase use your-project-id

# Deploy rules and hosting
firebase deploy --only hosting,firestore
```

### Firebase Cloud Functions
Located in `functions/`:
- `setCustomClaims`: Sets role and department custom claims.
- `createFacultyAccount`: Creates Firebase Auth user via Admin SDK and sends setup invitation link.
- `deactivateFacultyAccount`: Disables user and revokes refresh tokens.
- `onDailyLogSubmitted`: Notifies HOD upon register submission.
- `onDailyLogApproved`: Notifies faculty upon approval.
- `sendDailySubmissionReminder`: Scheduled Cloud Function at 04:00 PM IST (10:30 AM UTC) to remind faculty members with pending submissions.

Deploy Cloud Functions:
```bash
cd functions
npm install
firebase deploy --only functions
```

---

## 9. Security & Access Control Summary

1. **Role Separation**: Principal, HOD, and Faculty access levels are strictly enforced both client-side and in `firestore.rules`.
2. **Departmental Boundary**: HODs cannot view or modify data belonging to other departments.
3. **No Self-Approval**: Faculty cannot approve their own registers; HOD registers are routed to the Principal.
4. **Append-Only Audit Trail**: Administrative changes (account creation, deactivation, setting edits, approvals) are permanently logged.
5. **Session Isolation**: User-specific data is sanitized and isolated upon logout.

---

© 2026 Gonna Institute of Information Technology and Sciences (GIITS). All Rights Reserved.
