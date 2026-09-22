'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  Phone,
  MapPin,
  AlertCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [accountType, setAccountType] = useState('member'); // 'member' | 'volunteer'
  const [wing, setWing] = useState('সাধারণ উইং');
  const [upazila, setUpazila] = useState('ঝালকাঠি সদর');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.register({
        name,
        email,
        password,
        role: accountType === 'volunteer' ? 'volunteer' : 'member',
        phone,
        volunteerWing: wing,
        volunteerInterests: []
      });

      if (res.token) {
        localStorage.setItem('wcc_token', res.token);
        localStorage.setItem('wcc_user', JSON.stringify(res.user));
        alert(`Congratulations! You have successfully registered as a ${accountType === 'volunteer' ? 'Volunteer' : 'Member'} with WCC! Your digital ID has been generated.`);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
      console.error('Google Sign Up Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google registration popup was closed before completing.');
      } else {
        setError(err.message || 'Google registration failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const upazilas = ['ঝালকাঠি সদর', 'নলছিটি', 'রাজাপুর', 'কাঠালিয়া'];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#F1AD1A] bg-white p-1 mx-auto shadow-md">
              <img src="/landing/wcc.png" alt="WCC" className="w-full h-full object-contain" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Join We Can Change (WCC)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign up below to receive your official WCC membership ID and access services.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Official Membership Registration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Receive your official WCC Digital ID card and member portal access.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Sign up with Google */}
          <div className="space-y-3">
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
              <span>{googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                Or register with email
              </span>
              <div className="grow border-t border-slate-200"></div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* Account Type Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">I want to register as</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('member')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    accountType === 'member'
                      ? 'bg-rose-50 border-[#B62A35] text-[#B62A35] shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>General Member</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('volunteer')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    accountType === 'volunteer'
                      ? 'bg-amber-50 border-[#F1AD1A] text-amber-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F1AD1A]" />
                  <span>Volunteer Applicant</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name (সম্পূর্ণ নাম)</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed or সুমাইয়া আক্তার"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (মোবাইল নম্বর)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Upazila (উপজেলা)</label>
                <select
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                >
                  {upazilas.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#F1AD1A] shrink-0 mt-0.5" />
              <span>
                <strong>Wing & Volunteer Selection:</strong> You are registered as a General Member. You can request your preferred wing (Education, Health, ICT, Environment, etc.) or apply to become a volunteer from your dashboard after signing in.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Generating Membership ID...' : 'Complete Registration & Get ID'}</span>
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 space-y-2">
            <div>
              Already have an account or ID?{' '}
              <Link href="/login" className="font-bold text-[#B62A35] hover:underline">
                Sign in to WCC
              </Link>
            </div>
            <div>
              Forgot your password?{' '}
              <Link href="/forgot-password" className="font-bold text-[#B62A35] hover:underline">
                Reset it here
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
