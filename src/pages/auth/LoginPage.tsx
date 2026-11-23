import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle,
  Building,
  UserCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, firstTimeSetup } = useAuth();
  const { settings, users } = useCollege();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);

  // Setup form state
  const [setupName, setSetupName] = useState('Dr. K. Satyanarayana');
  const [setupEmail, setSetupEmail] = useState('principal@giits.edu.in');
  const [setupEmpId, setSetupEmpId] = useState('GIITS-DIR-001');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    const res = await login(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed');
    }
    setIsLoading(false);
  };

  const handleQuickLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setIsLoading(true);
    setErrorMessage(null);
    const res = await login(userEmail);
    if (!res.success) {
      setErrorMessage(res.error || 'Quick login failed');
    }
    setIsLoading(false);
  };

  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await firstTimeSetup({ fullName: setupName, email: setupEmail, employeeId: setupEmpId });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background geometric accents */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Institutional Crest Branding */}
        <div className="text-center space-y-2">
          {settings?.logoUrl ? (
            <div className="inline-block p-1.5 rounded-2xl bg-white shadow-xl shadow-blue-500/10 border border-slate-700">
              <img
                src={settings.logoUrl}
                alt={settings.collegeName || 'GIITS'}
                className="w-16 h-16 object-contain"
              />
            </div>
          ) : (
            <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-600 text-white items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/20 border-2 border-blue-400/40">
              GIITS
            </div>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {settings?.collegeName || 'GONNA INSTITUTE OF INFORMATION TECHNOLOGY AND SCIENCES'}
            </h1>
            <p className="text-xs text-blue-400 font-semibold tracking-wide uppercase mt-1">
              Faculty Daily Activity Register (FDAR)
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5">
          {!setupMode ? (
            <>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Sign in to your account</h2>
                <p className="text-xs text-slate-500">
                  Enter your registered institutional credentials to access your dashboard.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Institutional Email Address
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus-within:ring-2 focus-within:ring-blue-500">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. praveen.cse@giits.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Account Password</label>
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          'Password Recovery: Password reset links are sent via secure Firebase Authentication email. For testing, choose any of the quick login accounts below!'
                        )
                      }
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus-within:ring-2 focus-within:ring-blue-500">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Instant One-Click Role Switcher for Test Evaluation */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-[11px] text-slate-500 font-semibold text-center uppercase tracking-wider">
                  Quick Demo Accounts
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('principal@giits.edu.in')}
                    className="p-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-left transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Principal (Admin)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('hod.cse@giits.edu.in')}
                    className="p-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold text-left transition flex items-center gap-1.5"
                  >
                    <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">HOD (CSE Dept)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('praveen.cse@giits.edu.in')}
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-left transition flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Faculty (Praveen)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('hod.ece@giits.edu.in')}
                    className="p-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold text-left transition flex items-center gap-1.5"
                  >
                    <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">HOD (ECE Dept)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setSetupMode(true)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition"
                >
                  Principal One-Time Setup Wizard
                </button>
              </div>
            </>
          ) : (
            /* First Time Principal Setup Wizard */
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Principal Account Initialization</h2>
                <p className="text-xs text-slate-500">
                  Initialize master administrative credentials for institutional governance.
                </p>
              </div>

              <form onSubmit={handleFirstTimeSetup} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Principal Full Name</label>
                  <input
                    type="text"
                    required
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={setupEmpId}
                    onChange={(e) => setSetupEmpId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSetupMode(false)}
                    className="w-1/2 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Initialize Account
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500">
          Gonna Institute of Information Technology and Sciences © 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
};
