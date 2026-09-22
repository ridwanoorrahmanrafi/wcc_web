'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Calendar,
  Award,
  ArrowRight,
  Lock
} from 'lucide-react';
import { api } from '@/lib/api';

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [searchId, setSearchId] = useState(initialId);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const verifyMemberId = async (idToVerify) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const data = await api.verifyMember(idToVerify.trim());
      setMember(data);
    } catch (err) {
      setMember(null);
      setError(err.message || 'Member verification failed. Record not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      verifyMemberId(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    verifyMemberId(searchId);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Official Public Registry Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Verify WCC Membership
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Scan the QR code on any official We Can Change (WCC) member ID card or enter the Member ID below to confirm authenticity.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Member ID (e.g. WCC-2026-0001)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-50"
          >
            {loading ? 'Checking Registry...' : 'Verify Now'}
          </button>
        </form>
      </div>

      {/* Verification Result */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-slate-500">Verifying member identity against central records...</p>
        </div>
      ) : searched && member ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-xl overflow-hidden animate-in fade-in-50">
          {/* Top verified banner */}
          <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-200" />
              <div>
                <h3 className="font-bold text-sm sm:text-base leading-tight">Official Active Member</h3>
                <p className="text-[11px] text-emerald-100">Authenticated by We Can Change (WCC) Central Registry</p>
              </div>
            </div>
            <span className="text-[11px] font-black px-2.5 py-1 bg-white text-emerald-800 rounded-full uppercase tracking-wider">
              {member.status || 'Active'}
            </span>
          </div>

          {/* Member Card Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Photo */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#F1AD1A] shadow-md bg-slate-100 shrink-0">
                <img
                  src={member.photoUrl || '/default-avatar.svg'}
                  alt={member.nameEn}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.svg';
                  }}
                />
              </div>

              {/* Names & ID */}
              <div className="space-y-1.5 flex-1">
                <div className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                  {member.memberId}
                </div>
                <h2 className="text-2xl font-black text-slate-900">{member.nameEn}</h2>
                <p className="text-sm font-semibold text-[#B62A35]">{member.nameBn}</p>
                <div className="text-xs text-slate-500 pt-1">
                  Assigned Wing: <span className="font-bold text-slate-800">{member.wing}</span>
                </div>
              </div>
            </div>

            {/* Credential Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Membership Tier</span>
                <span className="font-bold text-slate-800">{member.membership || 'General Member'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Affiliation Wing</span>
                <span className="font-bold text-slate-800">{member.wing || 'General Wing'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Joined Date</span>
                <span className="font-bold text-slate-800 font-mono">
                  {member.joinedDate ? new Date(member.joinedDate).toLocaleDateString() : 'Active Member'}
                </span>
              </div>
            </div>

            {/* Privacy Protection Notice */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
              <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Protected:</strong> In compliance with security standards, sensitive personal data (national ID, home address, and private phone numbers) are masked from public QR scan views.
              </span>
            </div>

            <div className="text-center pt-2">
              <Link
                href={`/members/${member.memberId}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B62A35] hover:underline"
              >
                <span>View Full Member Profile (Authorized Portal)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : searched ? (
        <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-md p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800">Verification Unsuccessful</h3>
          <p className="text-xs text-rose-600 font-semibold max-w-md mx-auto">
            {error || 'No active member was found in the official registry matching this ID.'}
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please check the Member ID and try again, or contact the We Can Change central office at info@wecanchange.org.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-semibold text-slate-500">
          Loading verification portal...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
