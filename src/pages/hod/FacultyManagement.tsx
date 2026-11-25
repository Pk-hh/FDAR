import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { User, Designation, UserRole } from '@/types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Upload,
  KeyRound,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  X,
  Mail,
  Phone,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Lock,
  ExternalLink,
} from 'lucide-react';

const generateInitialPassword = () => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `Giits@${digits}`;
};

export const FacultyManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, departments, refreshAll } = useCollege();

  const deptId = currentUser?.departmentId || 'dept_cse';
  const isPrincipal = currentUser?.role === 'principal';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(isPrincipal ? 'all' : deptId);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [inviteModalUser, setInviteModalUser] = useState<User | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const initialFormState = {
    employeeId: '',
    fullName: '',
    email: '',
    departmentId: isPrincipal ? 'dept_cse' : deptId,
    role: 'faculty' as UserRole,
    designation: 'Assistant Professor' as Designation,
    qualification: 'M.Tech',
    mobileNumber: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    employmentStatus: 'Regular' as User['employmentStatus'],
    assignedSubjects: 'Database Management Systems, Web Technologies',
    assignedClasses: 'III-CSE-A, II-CSE-B',
    initialPassword: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [modalPassword, setModalPassword] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    if (u.role === 'principal') return false;
    if (selectedDept !== 'all' && u.departmentId !== selectedDept) return false;
    if (selectedStatus === 'active' && !u.isActive) return false;
    if (selectedStatus === 'inactive' && u.isActive) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!u.fullName.toLowerCase().includes(q) && !u.employeeId.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      ...initialFormState,
      initialPassword: generateInitialPassword(),
    });
    setShowFormPassword(true);
    setAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      employeeId: user.employeeId,
      fullName: user.fullName,
      email: user.email,
      departmentId: user.departmentId,
      role: user.role,
      designation: user.designation,
      qualification: user.qualification,
      mobileNumber: user.mobileNumber,
      dateOfJoining: user.dateOfJoining,
      employmentStatus: user.employmentStatus,
      assignedSubjects: user.assignedSubjects?.join(', ') || '',
      assignedClasses: user.assignedClasses?.join(', ') || '',
      initialPassword: user.password || user.initialPassword || generateInitialPassword(),
    });
    setShowFormPassword(false);
    setAddModalOpen(true);
  };

  // Open Credentials / Initial Password Modal
  const handleOpenCredentialsModal = (user: User) => {
    setInviteModalUser(user);
    const pass = user.password || user.initialPassword || generateInitialPassword();
    setModalPassword(pass);
    setShowModalPassword(true);
    setCopiedKey(null);
  };

  // Update password directly from credentials modal
  const handleUpdatePasswordFromModal = async () => {
    if (!currentUser || !inviteModalUser || !modalPassword.trim()) return;
    setIsUpdatingPassword(true);
    try {
      const passToSave = modalPassword.trim();
      const updatedUser: User = {
        ...inviteModalUser,
        password: passToSave,
        initialPassword: passToSave,
        updatedAt: new Date().toISOString(),
      };
      await StorageService.saveUser(updatedUser, currentUser.uid);
      await refreshAll();
      setInviteModalUser(updatedUser);
      setStatusMessage({
        type: 'success',
        text: `Login password for ${updatedUser.fullName} updated to "${passToSave}" successfully!`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      alert('Error updating password: ' + err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Save or update faculty
  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formData.employeeId || !formData.fullName || !formData.email) {
      setStatusMessage({ type: 'error', text: 'Employee ID, Full Name, and Email are required.' });
      return;
    }

    try {
      const dept = departments.find((d) => d.id === formData.departmentId);
      const chosenRole = isPrincipal ? formData.role : (editingUser ? editingUser.role : 'faculty');
      const pass = formData.initialPassword.trim() || (editingUser?.password || generateInitialPassword());

      const userToSave: User = {
        uid: editingUser ? editingUser.uid : 'user_' + Date.now(),
        employeeId: formData.employeeId.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        role: chosenRole,
        departmentId: formData.departmentId,
        departmentName: dept?.name || 'Academic Department',
        designation: formData.designation,
        qualification: formData.qualification.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        dateOfJoining: formData.dateOfJoining,
        employmentStatus: formData.employmentStatus,
        assignedSubjects: formData.assignedSubjects.split(',').map((s) => s.trim()).filter(Boolean),
        assignedClasses: formData.assignedClasses.split(',').map((c) => c.trim()).filter(Boolean),
        isActive: editingUser ? editingUser.isActive : true,
        createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        password: pass,
        initialPassword: editingUser?.initialPassword || pass,
      };

      await StorageService.saveUser(userToSave, currentUser.uid);

      // If assigned as HOD by Principal, link to department
      if (chosenRole === 'hod' && dept) {
        await StorageService.saveDepartment(
          { ...dept, hodId: userToSave.uid, hodName: userToSave.fullName },
          currentUser.uid
        );
      }
      await refreshAll();
      setAddModalOpen(false);
      setEditingUser(null);
      setFormData(initialFormState);
      setStatusMessage({
        type: 'success',
        text: `Faculty member ${userToSave.fullName} ${editingUser ? 'updated' : 'registered'} successfully with initial password: "${pass}"`,
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Error saving faculty: ' + err.message });
    }
  };

  // Toggle active/inactive
  const handleToggleActive = async (user: User) => {
    if (!currentUser) return;
    const action = user.isActive ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${action} ${user.fullName}? Historical activity registers will be preserved.`)) {
      return;
    }
    await StorageService.toggleUserStatus(user.uid, !user.isActive, currentUser.uid);
    await refreshAll();
  };

  // Bulk CSV Import
  const handleCsvImport = async () => {
    if (!currentUser || !csvInput.trim()) return;
    try {
      const lines = csvInput.trim().split('\n');
      let count = 0;
      for (const line of lines) {
        // Expected format: employeeId,fullName,email,designation,qualification,[initialPassword]
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 3) {
          const empId = parts[0];
          const name = parts[1];
          const email = parts[2];
          const designation = (parts[3] as Designation) || 'Assistant Professor';
          const qualification = parts[4] || 'M.Tech';
          const initialPass = parts[5] || generateInitialPassword();
          const dept = departments.find((d) => d.id === (isPrincipal ? 'dept_cse' : deptId));

          const newUser: User = {
            uid: 'user_csv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            employeeId: empId,
            fullName: name,
            email: email.toLowerCase(),
            role: 'faculty',
            departmentId: dept?.id || deptId,
            departmentName: dept?.name || 'Department',
            designation,
            qualification,
            mobileNumber: '',
            dateOfJoining: new Date().toISOString().split('T')[0],
            employmentStatus: 'Regular',
            assignedSubjects: [],
            assignedClasses: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            password: initialPass,
            initialPassword: initialPass,
          };
          await StorageService.saveUser(newUser, currentUser.uid);
          count++;
        }
      }
      await refreshAll();
      setCsvModalOpen(false);
      setCsvInput('');
      setStatusMessage({ type: 'success', text: `Successfully imported ${count} faculty members via CSV!` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert('CSV import error: ' + err.message);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Faculty Account Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Add faculty members, allocate subjects and classes, manage account activation and credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCsvModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Faculty</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
              : 'bg-rose-100 border border-rose-300 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Faculty</label>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {isPrincipal && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Account Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Accounts Only</option>
            <option value="inactive">Deactivated Accounts Only</option>
          </select>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Designation & Qualification</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Assigned Subjects</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{user.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">ID: {user.employeeId}</div>
                    <div className="text-[10px] text-slate-400">{user.departmentName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{user.designation}</div>
                    <div className="text-[11px] text-slate-500">{user.qualification}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                    {user.mobileNumber && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{user.mobileNumber}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {(user.assignedSubjects || []).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        user.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenCredentialsModal(user)}
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                      title="User Login Credentials & Initial Password"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title="Edit Faculty Member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`p-1.5 rounded-lg ${
                        user.isActive
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                      title={user.isActive ? 'Deactivate Account' : 'Reactivate Account'}
                    >
                      {user.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Faculty Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm">
                {editingUser ? 'Edit Faculty Details' : 'Register New Faculty Member'}
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaculty} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GIITS-CSE-020"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name with Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. K. Rajesh / Dr. M. Sunita"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official College Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh.cse@giits.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value as Designation })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Lab Instructor">Lab Instructor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Tech (CSE), Ph.D."
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    disabled={!isPrincipal}
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                {isPrincipal && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Account Role <span className="text-amber-600 font-bold">(Admin Assignable)</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs bg-amber-50/60 font-bold text-slate-800"
                    >
                      <option value="faculty">Faculty Member</option>
                      <option value="hod">Head of Department (HOD)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Joining</label>
                  <input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Subjects (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Operating Systems, Python Programming Lab"
                    value={formData.assignedSubjects}
                    onChange={(e) => setFormData({ ...formData, assignedSubjects: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Classes (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. II-CSE-A, III-CSE-B"
                    value={formData.assignedClasses}
                    onChange={(e) => setFormData({ ...formData, assignedClasses: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                {/* Initial Login Password Field */}
                <div className="sm:col-span-2 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-blue-600" />
                      <span>{editingUser ? 'Account Login Password' : 'Initial Login Password'}</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, initialPassword: generateInitialPassword() }))}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                      title="Generate random password"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Generate Random</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        required
                        value={formData.initialPassword}
                        onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                        placeholder="e.g. Giits@2026"
                        className="w-full px-3 py-2 pr-9 rounded-lg border border-blue-300 bg-white text-xs font-mono font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showFormPassword ? 'Hide password' : 'Show password'}
                      >
                        {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.initialPassword) {
                          copyToClipboard(formData.initialPassword, 'formPass');
                        }
                      }}
                      className="px-3 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                      title="Copy Password"
                    >
                      {copiedKey === 'formPass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'formPass' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {editingUser
                      ? 'The faculty member logs in with this password. You can update or reassign it anytime.'
                      : 'Provide this initial password to the user. They will use this password and their official email to log in.'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  {editingUser ? 'Save Updates' : 'Create Faculty Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Credentials / Initial Password Modal */}
      {inviteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  {inviteModalUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{inviteModalUser.fullName}</h3>
                  <p className="text-[11px] text-slate-500">
                    {inviteModalUser.designation} • {inviteModalUser.departmentName || 'Academic Dept'} ({inviteModalUser.employeeId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInviteModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanatory banner */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                As an Administrator, you can view, provide, or reassign the initial login password for this faculty member.
              </span>
            </div>

            {/* Email field */}
            <div className="space-y-1 text-xs">
              <label className="block font-semibold text-slate-700">Official Login Email</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono text-xs flex-1 truncate">{inviteModalUser.email}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(inviteModalUser.email, 'email')}
                  className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'email' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Initial Password field & Quick Update */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-700">Login Password</label>
                <button
                  type="button"
                  onClick={() => setModalPassword(generateInitialPassword())}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Generate New</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-300 bg-white font-mono text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showModalPassword ? 'Hide password' : 'Show password'}
                  >
                    {showModalPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(modalPassword, 'pass')}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  title="Copy Password"
                >
                  {copiedKey === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'pass' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleUpdatePasswordFromModal}
                  disabled={isUpdatingPassword || !modalPassword.trim()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 transition cursor-pointer shrink-0"
                >
                  {isUpdatingPassword ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                You can change this password at any time and share the new password with the user.
              </p>
            </div>

            {/* Formatted Message to Share */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <label className="block font-semibold text-slate-700">Ready-to-Share Credentials Message</label>
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-line select-all">
{`🏛️ GIITS - Faculty Daily Activity Register (FDAR)
Hello ${inviteModalUser.fullName},
Your faculty account is ready. Use these credentials to sign in:

🌐 Portal: ${typeof window !== 'undefined' ? window.location.origin : 'https://giits-fdar.web.app'}
📧 Email: ${inviteModalUser.email}
🔑 Initial Password: ${modalPassword}`}
              </div>
              <button
                type="button"
                onClick={() => {
                  const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://giits-fdar.web.app';
                  const msg = `🏛️ GIITS - Faculty Daily Activity Register (FDAR)\nHello ${inviteModalUser.fullName},\nYour faculty account is ready. Use these credentials to sign in:\n\n🌐 Portal: ${portalUrl}\n📧 Email: ${inviteModalUser.email}\n🔑 Initial Password: ${modalPassword}`;
                  copyToClipboard(msg, 'fullMsg');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                {copiedKey === 'fullMsg' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Credentials Message Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Credentials Message (WhatsApp / Email)</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setInviteModalUser(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-blue-600">
              <Upload className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Bulk Faculty Import via CSV</h3>
            </div>
            <p className="text-xs text-slate-600">
              Paste CSV records in the format: <br />
              <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded font-mono">
                EmployeeID, FullName, Email, Designation, Qualification, [InitialPassword]
              </code>
            </p>

            <textarea
              rows={6}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="GIITS-CSE-021, Dr. M. Prasad, prasad.cse@giits.edu.in, Associate Professor, Ph.D., Giits@2026&#10;GIITS-CSE-022, Ms. K. Sravani, sravani.cse@giits.edu.in, Assistant Professor, M.Tech"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Note: If InitialPassword is omitted, a secure random initial password will be automatically assigned.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCsvModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCsvImport}
                disabled={!csvInput.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                Import Faculty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
