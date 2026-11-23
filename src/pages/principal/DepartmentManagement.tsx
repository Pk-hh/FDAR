import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { StorageService } from '@/services/storageService';
import { Department } from '@/types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  X,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { departments, users, refreshAll } = useCollege();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hodId, setHodId] = useState('');

  // Eligible HOD users
  const hodUsers = users.filter((u) => u.role === 'hod' || u.role === 'faculty');

  const handleOpenAdd = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setHodId('');
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setHodId(dept.hodId || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const selectedHod = users.find((u) => u.uid === hodId);

    const deptToSave: Department = {
      id: editingDept ? editingDept.id : 'dept_' + code.toLowerCase().trim(),
      name: name.trim(),
      code: code.toUpperCase().trim(),
      hodId: hodId || undefined,
      hodName: selectedHod?.fullName || undefined,
      activeFacultyCount: editingDept ? editingDept.activeFacultyCount : 0,
      status: editingDept ? editingDept.status : 'active',
      createdAt: editingDept ? editingDept.createdAt : new Date().toISOString(),
    };

    await StorageService.saveDepartment(deptToSave, currentUser.uid);

    // If HOD was assigned, ensure user role is updated to HOD and departmentId set
    if (selectedHod && selectedHod.role !== 'principal') {
      const updatedUser = {
        ...selectedHod,
        role: 'hod' as const,
        departmentId: deptToSave.id,
        departmentName: deptToSave.name,
      };
      await StorageService.saveUser(updatedUser, currentUser.uid);
    }

    await refreshAll();
    setModalOpen(false);
  };

  const handleToggleStatus = async (dept: Department) => {
    if (!currentUser) return;
    const newStatus = dept.status === 'active' ? 'inactive' : 'active';
    if (confirm(`Change status of ${dept.name} to ${newStatus}? Historical records remain preserved.`)) {
      const updated = { ...dept, status: newStatus as 'active' | 'inactive' };
      await StorageService.saveDepartment(updated, currentUser.uid);
      await refreshAll();
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Academic Departments & HOD Allocations</span>
          </h2>
          <p className="text-xs text-slate-500">
            Create departments dynamically, allocate Heads of Department, and manage branch statuses.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const facCount = users.filter((u) => u.departmentId === dept.id && u.role === 'faculty' && u.isActive).length;
          return (
            <div key={dept.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                  {dept.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    dept.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {dept.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned HOD: <strong className="text-slate-800">{dept.hodName || 'Not Assigned'}</strong>
                </p>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{facCount} Active Faculty Members</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleToggleStatus(dept)}
                  className={`text-[11px] font-semibold ${
                    dept.status === 'active' ? 'text-rose-600 hover:underline' : 'text-emerald-600 hover:underline'
                  }`}
                >
                  {dept.status === 'active' ? 'Deactivate' : 'Reactivate'}
                </button>

                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit / Assign HOD</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingDept ? 'Edit Department & HOD' : 'Create New Academic Department'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence and Data Science"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIDS / CSE"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Head of Department</label>
                <select
                  value={hodId}
                  onChange={(e) => setHodId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="">-- Select HOD / Professor --</option>
                  {hodUsers.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.fullName} ({u.employeeId}) • {u.departmentName || 'Faculty'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
