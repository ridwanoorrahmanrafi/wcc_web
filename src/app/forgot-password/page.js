'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
  Send,
  RefreshCw,
  LogIn
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.forgotPassword(email.trim());
      setSubmitted(true);
      if (res.devResetToken) {
        setDevToken(res.devResetToken);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit password reset request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-block">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F1AD1A] bg-white p-1 mx-auto shadow-md">
            <img src="/landing/wcc.png" alt="WCC" className="w-full h-full object-contain" />
          </div>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          <KeyRound className="w-3.5 h-3.5 text-[#B62A35]" />
          <span>ACCOUNT RECOVERY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Forgot Your Password?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Enter your registered email address and we will dispatch a secure password reset link to your inbox.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-3xl shadow-sm space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-emerald-950">Instructions Dispatched!</h2>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    If an account exists with <strong className="font-semibold">{email}</strong>, a password reset link has been sent. Please check your inbox and spam folder.
                  </p>
                </div>
              </div>

              {devToken && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-[#F1AD1A]" />
                    <span>Development Mode Direct Link</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    SMTP server is in test mode. You can proceed directly using the link below:
                  </p>
                  <Link
                    href={`/reset-password?token=${encodeURIComponent(devToken)}`}
                    className="inline-flex items-center justify-center w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Open Password Reset Page
                  </Link>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <Link
                  href="/login"
                  className="w-full py-2.5 px-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setDevToken(null);
                  }}
                  className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl border border-slate-200 transition-colors text-xs flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try another email</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. member@wecanchange.org"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Security Link...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 space-y-2">
            <div>
              Remember your password?{' '}
              <Link href="/login" className="font-bold text-[#B62A35] hover:underline">
                Sign in here
              </Link>
            </div>
            <div>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-[#B62A35] hover:underline">
                Register for WCC
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
