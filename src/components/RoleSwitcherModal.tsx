import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { X, ShieldCheck, Check, Building, UserCheck } from 'lucide-react';
import { UserRole } from '@/types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchUser } = useAuth();
  const { users } = useCollege();

  if (!isOpen) return null;

  const handleSelect = async (uid: string) => {
    await switchUser(uid);
    onClose();
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'principal':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'hod':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'faculty':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-sm">Role & Account Switcher</h2>
              <p className="text-[11px] text-slate-400">GIITS Faculty Daily Activity Register Demo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-2 text-xs">
          <p className="text-slate-500 text-[11px] mb-3">
            Switch between authenticated accounts to evaluate Principal, HOD, and Faculty workflows, permissions, and dashboards:
          </p>

          {users.map((u) => {
            const isCurrent = currentUser?.uid === u.uid;
            return (
              <div
                key={u.uid}
                onClick={() => handleSelect(u.uid)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {u.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{u.fullName}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold border ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {u.designation} {u.departmentName ? `• ${u.departmentName}` : ''}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {u.email} ({u.employeeId})
                    </p>
                  </div>
                </div>

                {isCurrent && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
