'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, ShieldCheck, User, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleAuth = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      if (!auth || !googleProvider) {
        throw new Error('Firebase authentication is not ready.');
      }
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const res = await api.googleLogin({
        email: fbUser.email,
        name: fbUser.displayName || fbUser.email.split('@')[0],
        photoUrl: fbUser.photoURL || '',
        uid: fbUser.uid
      });

      if (res.token) {
        localStorage.setItem('wcc_token', res.token);
        localStorage.setItem('wcc_user', JSON.stringify(res.user));
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completing.');
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
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
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to WCC</h2>
        <p className="text-xs text-slate-500">
          Sign in to access your WCC Digital ID and member dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-3xl shadow-sm space-y-5">
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
              <div className="flex justify-end mt-1.5">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#B62A35] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Google Sign-in Option Under Sign In Button */}
          <div className="space-y-3">
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                Or continue with
              </span>
              <div className="grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-2xs transition-colors flex items-center justify-center gap-3 text-xs disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* Quick Admin Credential Preset */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => handleRolePreset('admin@wecanchange.org', 'wccadmin2026')}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-[#B62A35] border border-slate-200 text-slate-700 text-xs font-bold text-center transition-colors cursor-pointer"
            >
              Auto-fill Admin (admin@wecanchange.org)
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-2">
            <div>
              Don&apos;t have an ID?{' '}
              <Link href="/register" className="font-bold text-[#B62A35] hover:underline">
                Register for WCC Membership
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
