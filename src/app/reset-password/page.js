'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/Components/LanguageToggle';
import { checkPasswordRequirements, PasswordRequirementsList } from '@/lib/passwordValidation';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  LogIn
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;
  const { lang } = useLanguage();
  const isBn = lang === 'bn';

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Pre-validate token on mount
  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setVerifying(false);
        setTokenValid(false);
        setVerifyError(
          isBn
            ? 'লিংকে কোনো সিকিউরিটি টোকেন পাওয়া যায়নি। অনুগ্রহ করে নতুন লিংকের জন্য অনুরোধ করুন।'
            : 'No security reset token was found in the link. Please request a new one.'
        );
        return;
      }

      try {
        setVerifying(true);
        const res = await api.verifyResetToken(token);
        if (res.valid) {
          setTokenValid(true);
          setUserEmail(res.email || '');
        } else {
          setTokenValid(false);
          setVerifyError(
            res.error ||
              (isBn
                ? 'পাসওয়ার্ড রিসেট লিংকটি ভুল অথবা মেয়াদোত্তীর্ণ হয়ে গেছে।'
                : 'Password reset link is invalid or has expired.')
          );
        }
      } catch (err) {
        setTokenValid(false);
        setVerifyError(
          err.message ||
            (isBn
              ? 'পাসওয়ার্ড রিসেট লিংকটি ভুল অথবা মেয়াদোত্তীর্ণ হয়ে গেছে।'
              : 'Password reset link is invalid or has expired.')
        );
      } finally {
        setVerifying(false);
      }
    }

    checkToken();
  }, [token, isBn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const reqs = checkPasswordRequirements(newPassword);
    if (!reqs.isValid) {
      setSubmitError(
        isBn
          ? 'নতুন পাসওয়ার্ড অবশ্যই কমপক্ষে ৮ অক্ষরের হতে হবে এবং অন্তত একটি বড় হাতের অক্ষর (A-Z), একটি ছোট হাতের অক্ষর (a-z), একটি সংখ্যা (0-9) এবং একটি বিশেষ চিহ্ন (!@#$...) থাকতে হবে।'
          : 'New password must be at least 8 characters long and contain at least one uppercase letter (A-Z), one lowercase letter (a-z), one numeric digit (0-9), and one special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError(
        isBn
          ? 'উভয় পাসওয়ার্ড মিলছে না। অনুগ্রহ করে যাচাই করুন।'
          : 'Passwords do not match. Please verify both fields.'
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.resetPassword(token, newPassword);
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(
        err.message ||
          (isBn
            ? 'পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
            : 'Failed to reset password. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative">
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-block">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F1AD1A] bg-white p-1 mx-auto shadow-md">
            <img src="/landing/wcc.png" alt="WCC" className="w-full h-full object-contain" />
          </div>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isBn ? 'নিরাপদ পাসওয়ার্ড পরিবর্তন' : 'SECURE CREDENTIAL RESET'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {isBn ? 'নতুন পাসওয়ার্ড নির্ধারণ' : 'Set New Password'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {isBn
            ? 'আপনার উই ক্যান চেইঞ্জ অ্যাকাউন্টের জন্য একটি শক্তিশালী নতুন পাসওয়ার্ড প্রদান করুন।'
            : 'Please enter a strong new password for your We Can Change account.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-3xl shadow-sm space-y-5">
          {verifying ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#B62A35] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                {isBn ? 'টোকেন যাচাই করা হচ্ছে...' : 'Verifying security token...'}
              </p>
            </div>
          ) : !tokenValid ? (
            <div className="space-y-5 text-center">
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-sm font-bold text-rose-950">
                  {isBn ? 'অবৈধ অথবা মেয়াদোত্তীর্ণ লিংক' : 'Invalid or Expired Link'}
                </h2>
                <p className="text-xs text-rose-800">{verifyError}</p>
              </div>

              <Link
                href="/forgot-password"
                className="w-full py-2.5 px-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isBn ? 'নতুন রিসেট লিংকের অনুরোধ করুন' : 'Request New Reset Link'}</span>
              </Link>
            </div>
          ) : submitSuccess ? (
            <div className="space-y-5 text-center animate-in fade-in duration-300">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-emerald-950">
                  {isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Password Reset Complete!'}
                </h2>
                <p className="text-xs text-emerald-800">
                  {isBn
                    ? 'আপনার পাসওয়ার্ড সফলভাবে আপডেট হয়েছে। এখন আপনি নতুন পাসওয়ার্ড দিয়ে অ্যাকাউন্টে প্রবেশ করতে পারেন।'
                    : 'Your password has been successfully updated. You can now log in to your account with your new credentials.'}
                </p>
              </div>

              <Link
                href="/login"
                className="w-full py-2.5 px-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>{isBn ? 'এখনই সাইন ইন করুন' : 'Sign In Now'}</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{submitError}</span>
                </div>
              )}

              {userEmail && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs">
                  {isBn ? 'পাসওয়ার্ড পরিবর্তন হচ্ছে: ' : 'Resetting password for: '}
                  <strong className="font-semibold text-slate-800">{userEmail}</strong>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isBn ? 'কমপক্ষে ৮ অক্ষরের (Aa1@)' : 'Min 8 characters (Aa1@)'}
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordRequirementsList password={newPassword} isBn={isBn} />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isBn ? 'পাসওয়ার্ডটি পুনরায় লিখুন' : 'Re-enter your new password'}
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isBn ? 'পাসওয়ার্ড আপডেট হচ্ছে...' : 'Updating Password...'}</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>{isBn ? 'নতুন পাসওয়ার্ড সংরক্ষণ করুন' : 'Save New Password'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            <Link href="/login" className="font-bold text-[#B62A35] hover:underline">
              {isBn ? 'সাইন ইনে ফিরে যান' : 'Return to Sign In'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
