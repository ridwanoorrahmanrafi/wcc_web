'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Sparkles,
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { api } from '@/lib/api';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState('member');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [wing, setWing] = useState('শিক্ষা উইং');
  const [upazila, setUpazila] = useState('ঝালকাঠি সদর');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'volunteer' || roleParam === 'member') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const toggleInterest = (item) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.register({
        name,
        email,
        password,
        role,
        phone,
        volunteerWing: wing,
        volunteerInterests: interests
      });

      if (res.token) {
        localStorage.setItem('wcc_token', res.token);
        localStorage.setItem('wcc_user', JSON.stringify(res.user));
        alert(`Congratulations! You have successfully registered as ${role === 'volunteer' ? 'a Volunteer' : 'a Member'} with WCC!`);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const wings = [
    'শিক্ষা উইং',
    'স্বাস্থ্য উইg (Health)',
    'আইসিটি উইং (ICT & IT)',
    'পরিবেশ উইং (Environment)',
    'সমাজকল্যাণ উইং',
    'সংস্কৃতি ও ক্রীড়া উইং'
  ];

  const upazilas = ['ঝালকাঠি সদর', 'নলছিটি', 'রাজাপুর', 'কাঠালিয়া'];

  const volunteerInterestOptions = [
    'ফ্রি মেডিকেল ও হেলথ ক্যাম্প',
    'বৃক্ষরোপণ ও পরিবেশ সুরক্ষা',
    'দরিদ্র শিক্ষার্থীদের পাঠদান ও বই বিতরণ',
    'আইটি, ওয়েব ও মিডিয়া সাপোর্ট',
    'জরুরি ত্রাণ ও দুর্যোগ সহায়তা'
  ];

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
            Choose your participation track and become a driving force for society.
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="grid grid-cols-2 gap-2 bg-slate-200 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('member')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
              role === 'member'
                ? 'bg-white text-[#B62A35] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>General Member</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('volunteer')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
              role === 'volunteer'
                ? 'bg-[#F1AD1A] text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Youth Volunteer</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              {role === 'volunteer' ? 'Volunteer Registration Track' : 'Official Membership Application'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {role === 'volunteer'
                ? 'Volunteers participate in on-ground camps, relief drives, and earn verified service hours.'
                : 'Members receive official WCC Digital ID cards, voting rights, and directory recognition.'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
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

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Wing (উইং নির্বাচন)</label>
              <select
                value={wing}
                onChange={(e) => setWing(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
              >
                {wings.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Volunteer-specific interest selection */}
            {role === 'volunteer' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700">
                  Areas of Interest for Volunteering (স্বেচ্ছাসেবায় আগ্রহের ক্ষেত্র)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {volunteerInterestOptions.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={interests.includes(opt)}
                        onChange={() => toggleInterest(opt)}
                        className="rounded text-[#F1AD1A] focus:ring-[#F1AD1A]"
                      />
                      <span className="text-[11px] text-slate-700 font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4 ${
                role === 'volunteer'
                  ? 'bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950'
                  : 'bg-[#B62A35] hover:bg-[#9E1F2A] text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {loading
                  ? 'Registering Account...'
                  : role === 'volunteer'
                  ? 'Confirm Volunteer Registration'
                  : 'Submit Membership Application'}
              </span>
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#B62A35] hover:underline">
              Portal Login
            </Link>
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
