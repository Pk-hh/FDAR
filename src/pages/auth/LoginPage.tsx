import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCollege } from '@/contexts/CollegeContext';
import { Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { settings } = useCollege();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    const res = await login(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background geometric accents */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Institutional Crest Branding */}
        <div className="text-center space-y-3">
          <div className="inline-block p-2 rounded-2xl bg-white shadow-2xl shadow-blue-500/20 border border-slate-700">
            <img
              src={settings?.logoUrl || '/logo.png'}
              alt={settings?.collegeName || 'GIITS'}
              className="w-20 h-20 object-contain mx-auto"
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight uppercase leading-tight">
              {settings?.collegeName || 'GONNA INSTITUTE OF INFORMATION TECHNOLOGY AND SCIENCES'}
            </h1>
            <p className="text-xs text-blue-400 font-bold tracking-wider uppercase mt-1">
              Faculty Daily Activity Register (FDAR)
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500">
              Enter your official credentials to access the academic monitoring system.
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
                Institutional / Registered Email
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus-within:ring-2 focus-within:ring-blue-500">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="e.g. pradeep4045t7@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Account Password
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus-within:ring-2 focus-within:ring-blue-500">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Authorized institutional portal for GIITS faculty & administration</span>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500">
          Faculty accounts are managed and provisioned directly by Department HODs & Principal.
        </p>
      </div>
    </div>
  );
};
