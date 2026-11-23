import React, { useState, useEffect } from 'react';
import { StorageService } from '@/services/storageService';
import { AuditLog } from '@/types';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const loadLogs = async () => {
    const all = await StorageService.getAuditLogs();
    setLogs(all);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (selectedRole !== 'all' && l.userRole !== selectedRole) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !l.action.toLowerCase().includes(q) &&
        !l.userName.toLowerCase().includes(q) &&
        !l.affectedRecordId.toLowerCase().includes(q) &&
        !(l.reason || '').toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <span>Administrative Audit Trail & Security Logs</span>
          </h2>
          <p className="text-xs text-slate-500">
            Immutable, append-only audit trail tracking submissions, approvals, role adjustments, and system modifications.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Audit Logs</label>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, user name, record ID, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Actor Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800"
          >
            <option value="all">All Roles</option>
            <option value="principal">Principal</option>
            <option value="hod">Head of Department</option>
            <option value="faculty">Faculty Member</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Operation / Action</th>
                <th className="py-3 px-4">Affected Record</th>
                <th className="py-3 px-4">Audit Details & Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{log.userName}</div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 px-1 py-0.2 rounded bg-slate-100">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                    {log.affectedRecordId}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm">
                    {log.reason || log.updatedValue || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
