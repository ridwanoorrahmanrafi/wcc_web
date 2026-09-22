'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PieChart,
  Users,
  Heart,
  Briefcase,
  GraduationCap,
  MapPin,
  ArrowLeft,
  Activity,
  Sparkles,
  Calendar,
  HeartHandshake,
  CheckCircle2,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Impact Statistics
  const [impactStats, setImpactStats] = useState(null);
  const [impactLoading, setImpactLoading] = useState(true);
  const [impactError, setImpactError] = useState(null);

  const fetchImpactData = async () => {
    setImpactLoading(true);
    setImpactError(null);
    try {
      const data = await api.getImpactStats();
      setImpactStats(data);
    } catch (err) {
      console.error('Error fetching impact stats:', err);
      setImpactError(err.message || 'Failed to load impact metrics');
    } finally {
      setImpactLoading(false);
    }
  };

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getMemberStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching member stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
    fetchImpactData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-500">Compiling demographic analytics...</p>
      </div>
    );
  }

  const total = stats?.total || 1;
  const bloodGroups = stats?.bloodGroups || {};
  const wings = stats?.wings || {};
  const upazilas = stats?.upazilas || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Demographic Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B62A35]/10 text-[#B62A35]">
              Real-time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Statistical breakdown of blood donor distribution, wing participation, and geographical representation.
          </p>
        </div>

        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Member Directory</span>
        </Link>
      </div>

      {/* MVP Impact Statistics Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F1AD1A]" />
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Grassroots Impact Metrics
            </h2>
          </div>
          {impactError && (
            <button
              onClick={fetchImpactData}
              className="text-xs font-bold text-[#B62A35] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>

        {impactLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs animate-pulse space-y-2">
                <div className="h-3 bg-slate-200 rounded w-24"></div>
                <div className="h-8 bg-slate-200 rounded w-16"></div>
                <div className="h-3 bg-slate-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : impactError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-center justify-between">
            <span>Failed to load impact metrics: {impactError}</span>
            <button
              onClick={fetchImpactData}
              className="px-3 py-1 bg-white border border-rose-300 rounded-lg font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Programs */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-extrabold block uppercase tracking-wider">Total Programs</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1D3557] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900">{impactStats?.totalPrograms ?? 0}</h3>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Operational Wings</span>
                <Link href="/programs" className="text-[#B62A35] font-bold hover:underline flex items-center gap-0.5">
                  View Programs <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Total Volunteers */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-extrabold block uppercase tracking-wider">Total Volunteers</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#A6772A] flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-[#A6772A]">{impactStats?.totalVolunteers ?? 0}</h3>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Youth Volunteer Corps</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Active
                </span>
              </div>
            </div>

            {/* Resolved Issues */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-extrabold block uppercase tracking-wider">Resolved Issues</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-emerald-600">{impactStats?.resolvedIssues ?? 0}</h3>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Community Solutions</span>
                <Link href="/admin/issues" className="text-[#B62A35] font-bold hover:underline flex items-center gap-0.5">
                  Track Issues <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Total Members</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.total || 0}</h3>
          <span className="text-[11px] text-emerald-600 font-semibold">Registered Registry</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Active Members</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats?.active || 0}</h3>
          <span className="text-[11px] text-slate-500 font-medium">Approved & Verified</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Pending Review</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{stats?.pending || 0}</h3>
          <span className="text-[11px] text-slate-500 font-medium">Applications</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Students</span>
          <h3 className="text-2xl font-black text-[#1D3557] mt-1">{stats?.students || 0}</h3>
          <span className="text-[11px] text-slate-500 font-medium">Schools & Colleges</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Professionals</span>
          <h3 className="text-2xl font-black text-[#B62A35] mt-1">{stats?.professionals || 0}</h3>
          <span className="text-[11px] text-slate-500 font-medium">Job Holders / Business</span>
        </div>
      </div>

      {/* Analytics Visual Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Group Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900">Blood Donor Bank Distribution</h3>
            </div>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              Emergency Ready
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(bloodGroups).map(([bg, count]) => {
              const percent = Math.round((count / total) * 100);
              return (
                <div key={bg} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{bg} Group</span>
                    <span className="text-slate-500">
                      {count} donors ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-[#B62A35] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wing-wise Representation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1D3557]" />
              <h3 className="font-bold text-sm text-slate-900">Affiliation by Wing</h3>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Operation Focus
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(wings).map(([wing, count]) => {
              const percent = Math.round((count / total) * 100);
              return (
                <div key={wing} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{wing}</span>
                    <span className="text-slate-500">
                      {count} members ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#1D3557] to-[#457B9D] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographical Representation across Upazilas */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#A6772A]" />
              <h3 className="font-bold text-sm text-slate-900">Geographic Coverage (Jhalokathi District)</h3>
            </div>
            <span className="text-xs font-semibold text-[#A6772A] bg-amber-50 px-2 py-0.5 rounded-full">
              Local Branches
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(upazilas).map(([upazila, count]) => {
              const percent = Math.round((count / total) * 100);
              return (
                <div key={upazila} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{upazila}</span>
                    <span className="text-slate-500">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#F1AD1A] to-[#A6772A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Education vs Professional Ratio */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Demographic Profile Composition</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Youth & Mentors
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1D3557]"></div>
                <span>Students: {stats?.students || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#B62A35]"></div>
                <span>Professionals: {stats?.professionals || 0}</span>
              </div>
            </div>

            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex">
              <div
                className="bg-[#1D3557] h-full"
                style={{ width: `${Math.round(((stats?.students || 0) / total) * 100)}%` }}
              ></div>
              <div
                className="bg-[#B62A35] h-full"
                style={{ width: `${Math.round(((stats?.professionals || 0) / total) * 100)}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              A balanced mix of dynamic student volunteers driven by passion and experienced professionals providing leadership, legal, medical, and financial guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
