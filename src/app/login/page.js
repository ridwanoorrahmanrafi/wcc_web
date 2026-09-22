'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, ShieldCheck, User, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.token) {
        localStorage.setItem('wcc_token', res.token);
        localStorage.setItem('wcc_user', JSON.stringify(res.user));
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRolePreset = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-block">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F1AD1A] bg-white p-1 mx-auto shadow-md">
            <img src="/landing/wcc.png" alt="WCC" className="w-full h-full object-contain" />
          </div>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">WCC Portal Login</h2>
        <p className="text-xs text-slate-500">
          Sign in to access your role-specific portal (Admin, Member, Volunteer).
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-3xl shadow-sm space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@wecanchange.org"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Admin Credential Preset */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => handleRolePreset('admin@wecanchange.org', 'wccadmin2026')}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-[#B62A35] border border-slate-200 text-slate-700 text-xs font-bold text-center transition-colors"
            >
              Auto-fill Admin (admin@wecanchange.org)
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-2">
            <div>
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-[#B62A35] hover:underline">
                Register as Member or Volunteer
              </Link>
            </div>
            <div>
              <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-[#B62A35]">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Guest Site</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
