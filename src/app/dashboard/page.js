'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Wallet,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Calendar,
  Award,
  PlusCircle,
  FileText,
  Printer,
  ExternalLink,
  ChevronRight,
  User,
  MapPin,
  Check,
  Building,
  DollarSign
} from 'lucide-react';
import { api } from '@/lib/api';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams ? searchParams.get('tab') : null;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hub');

  // Live Database Stats for Admin
  const [adminStats, setAdminStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    totalLiquidity: 0
  });
  const [pendingList, setPendingList] = useState([]);
  const [activities, setActivities] = useState([]);

  // Member / Volunteer Data
  const [memberRecord, setMemberRecord] = useState(null);
  const [myReimbursements, setMyReimbursements] = useState([]);
  const [volunteerHours, setVolunteerHours] = useState(0);
  const [volunteerLogs, setVolunteerLogs] = useState([]);
  const [volunteerLogSuccess, setVolunteerLogSuccess] = useState('');

  // Service Log Form State for Volunteers
  const [logDriveName, setLogDriveName] = useState('');
  const [logHours, setLogHours] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [submittingLog, setSubmittingLog] = useState(false);

  // Sync tab from URL if present
  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  useEffect(() => {
    async function initDashboard() {
      try {
        const stored = localStorage.getItem('wcc_user');
        if (!stored) {
          router.push('/login');
          return;
        }
        const currentUser = JSON.parse(stored);
        setUser(currentUser);
        setVolunteerHours(currentUser.totalHours || 0);

        // Fetch data according to role strictly from MongoDB
        if (currentUser.role === 'admin' || currentUser.role === 'finance_officer') {
          if (!requestedTab) setActiveTab('overview');
          const [memStats, finDash, pendingMembers, acts] = await Promise.all([
            api.getMemberStats().catch(() => ({ total: 0, active: 0, pending: 0 })),
            api.getFinanceDashboard().catch(() => ({ totalLiquidity: 0 })),
            api.getMembers({ status: 'Pending', limit: 10 }).catch(() => ({ members: [] })),
            api.getActivities().catch(() => [])
          ]);

          setAdminStats({
            totalMembers: memStats.total || 0,
            activeMembers: memStats.active || 0,
            pendingMembers: memStats.pending || 0,
            totalLiquidity: finDash.totalLiquidity || 0
          });
          setPendingList(pendingMembers.members || []);
          setActivities(acts || []);
        } else if (currentUser.role === 'volunteer') {
          if (!requestedTab) setActiveTab('hub');
          const [logs, acts] = await Promise.all([
            api.getVolunteerLogs().catch(() => []),
            api.getActivities().catch(() => [])
          ]);
          setVolunteerLogs(logs || []);
          setActivities(acts || []);
        } else {
          // Member role
          if (!requestedTab) setActiveTab('hub');
          if (currentUser.memberId) {
            const mem = await api.getMember(currentUser.memberId).catch(() => null);
            setMemberRecord(mem);
          }
          const [reims, acts] = await Promise.all([
            api.getReimbursements().catch(() => []),
            api.getActivities().catch(() => [])
          ]);
          setMyReimbursements(reims || []);
          setActivities(acts || []);
        }
      } catch (err) {
        console.error('Dashboard init error:', err);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [router, requestedTab]);

  const handleApproveMember = async (id) => {
    try {
      await api.updateMemberStatus(id, 'Active');
      setPendingList((prev) => prev.filter((m) => m.memberId !== id && m._id !== id));
      setAdminStats((prev) => ({
        ...prev,
        pendingMembers: Math.max(0, prev.pendingMembers - 1),
        activeMembers: prev.activeMembers + 1
      }));
      alert(`Member ${id} verified and approved successfully!`);
    } catch (err) {
      alert(`Error approving member: ${err.message}`);
    }
  };

  const handleLogVolunteerHours = async (e) => {
    e.preventDefault();
    setSubmittingLog(true);
    try {
      const added = Number(logHours) || 0;
      const res = await api.logVolunteerHours({
        driveName: logDriveName,
        hours: added,
        notes: logNotes
      });

      setVolunteerHours(res.totalHours);
      if (res.log) {
        setVolunteerLogs((prev) => [res.log, ...prev]);
      }
      // Update stored user
      if (user) {
        const updated = { ...user, totalHours: res.totalHours };
        localStorage.setItem('wcc_user', JSON.stringify(updated));
        setUser(updated);
      }
      setVolunteerLogSuccess(`Successfully recorded ${added} service hours to MongoDB!`);
      setLogNotes('');
      setTimeout(() => setVolunteerLogSuccess(''), 4000);
    } catch (err) {
      alert(`Error recording hours: ${err.message}`);
    } finally {
      setSubmittingLog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#B62A35] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Connecting to secure database session...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Workspace Header */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {user.role === 'admin' && 'Admin Control Center'}
              {user.role === 'volunteer' && 'Volunteer Action Hub'}
              {user.role === 'member' && 'Member Services Portal'}
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#F1AD1A]/20 text-[#A6772A] border border-[#F1AD1A]/30">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-slate-500">Live MongoDB Atlas Database Connected</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-[#B62A35] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#F1AD1A]" />
            <span className="hidden sm:inline">Public Guest Site</span>
            <span className="sm:hidden">Guest</span>
          </Link>
        </div>
      </header>

      {/* Dynamic Role-Based View */}
      <main className="p-4 sm:p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
        {/* ========================================================= */}
        {/* A. ADMIN VIEW                                             */}
        {/* ========================================================= */}
        {user.role === 'admin' && (
          <div className="space-y-8">
            {/* Live Metric KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Members in DB</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#B62A35] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{adminStats.totalMembers}</div>
                <div className="text-[11px] text-emerald-600 font-semibold">{adminStats.activeMembers} Verified Active</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#A6772A] flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-600">{adminStats.pendingMembers}</div>
                <div className="text-[11px] text-slate-500 font-medium">Awaiting Verification</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Treasury Vault</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">৳ {adminStats.totalLiquidity.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500 font-medium">Recorded Ledger Funds</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activities</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D3557] flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{activities.length}</div>
                <div className="text-[11px] text-blue-600 font-semibold">Active Campaigns</div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/members"
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#B62A35] hover:shadow-md transition-all group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#B62A35] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#B62A35] transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Member Directory</h3>
                <p className="text-xs text-slate-500">View, search, or add members into MongoDB.</p>
              </Link>

              <Link
                href="/finance"
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#A6772A] flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Finance & Accounting</h3>
                <p className="text-xs text-slate-500">Record transactions, expenses, and manage bank accounts.</p>
              </Link>

              <Link
                href="/analytics"
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D3557] flex items-center justify-center">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1D3557] transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Demographic Analytics</h3>
                <p className="text-xs text-slate-500">Review blood group readiness and wing distributions.</p>
              </Link>
            </div>

            {/* Pending Member Applications Table */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Pending Membership Review</h3>
                  <p className="text-xs text-slate-500">Real applications saved in MongoDB awaiting verification</p>
                </div>
                <Link href="/members/new" className="text-xs font-bold text-[#B62A35] hover:underline flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Member Manually</span>
                </Link>
              </div>

              {pendingList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-slate-700">No pending member records in the database.</p>
                  <p className="text-[11px] text-slate-400">New applications submitted from the registration page will appear here live.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Member ID</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Wing</th>
                        <th className="py-2.5 px-3">Mobile</th>
                        <th className="py-2.5 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingList.map((m) => (
                        <tr key={m._id || m.memberId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{m.memberId}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{m.nameBn || m.nameEn}</td>
                          <td className="py-2.5 px-3">{m.wing}</td>
                          <td className="py-2.5 px-3 font-mono">{m.mobile}</td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleApproveMember(m.memberId)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                            >
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* B. MEMBER VIEW                                            */}
        {/* ========================================================= */}
        {user.role === 'member' && (
          <div className="space-y-6">
            {/* Member Tab Switcher Pills */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveTab('hub')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'hub' ? 'bg-[#B62A35] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Overview
              </button>
              <button
                onClick={() => setActiveTab('id-card')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'id-card' ? 'bg-[#B62A35] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Digital ID Card
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'profile' ? 'bg-[#B62A35] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Profile Details
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Official Digital ID Card */}
              {(activeTab === 'hub' || activeTab === 'id-card') && (
                <div className="lg:col-span-6 space-y-4" id="id-card">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900">Official Digital ID Card</h3>
                        <p className="text-xs text-slate-500">Official Membership Credential</p>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Card</span>
                      </button>
                    </div>

                    <div className="printable-card relative bg-gradient-to-br from-slate-900 via-[#1D3557] to-[#B62A35] text-white p-6 rounded-2xl shadow-xl overflow-hidden border border-[#F1AD1A]/40">
                      <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-white p-1 border-2 border-[#F1AD1A]">
                            <img src="/landing/wcc.png" alt="Logo" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <div className="text-xs font-black tracking-wider text-white">WE CAN CHANGE (WCC)</div>
                            <div className="text-[9px] text-[#F1AD1A] font-bold">JHALOKATHI • BANGLADESH</div>
                          </div>
                        </div>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                          VERIFIED
                        </span>
                      </div>

                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-800 border-2 border-[#F1AD1A] shrink-0">
                          <img
                            src={memberRecord?.photoUrl || '/default-avatar.svg'}
                            alt={user.name || 'Member'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-black text-white">{user.name || 'Member'}</h4>
                          <p className="text-xs text-[#F1AD1A] font-bold">ID: {user.memberId || memberRecord?.memberId || 'Pending'}</p>
                          <p className="text-xs text-slate-200">Wing: {memberRecord?.wing || user.volunteerWing || 'General'}</p>
                          <p className="text-xs text-slate-200">Role: Registered Member</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-slate-300">
                        <div>Charter: 2026 • wecanchange.org</div>
                        {user.memberId && (
                          <Link
                            href={`/verify?id=${encodeURIComponent(user.memberId)}`}
                            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded font-bold text-white text-[10px] transition-colors"
                          >
                            Verify QR
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Information & Actions */}
              {(activeTab === 'hub' || activeTab === 'profile') && (
                <div className="lg:col-span-6 space-y-6" id="profile">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <h3 className="text-base font-black text-slate-900">Member Profile Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block mb-0.5">Email</span>
                        <span className="font-semibold text-slate-800 truncate block">{user.email}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block mb-0.5">Phone</span>
                        <span className="font-semibold text-slate-800">{user.phone || memberRecord?.mobile || '-'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block mb-0.5">Member ID</span>
                        <span className="font-mono font-bold text-[#B62A35]">{user.memberId || memberRecord?.memberId || 'Pending'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block mb-0.5">Status</span>
                        <span className="font-bold text-emerald-600">{user.status || memberRecord?.status || 'Active'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reimbursement Claim */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
                    <h3 className="text-base font-black text-slate-900">Expense Reimbursement</h3>
                    <p className="text-xs text-slate-500">
                      Submit personal expenditure receipts for official reimbursement approved by the finance committee.
                    </p>
                    <Link
                      href="/finance/reimbursements"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Submit Expense Claim</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* C. VOLUNTEER VIEW                                         */}
        {/* ========================================================= */}
        {user.role === 'volunteer' && (
          <div className="space-y-6">
            {/* Volunteer Tab Switcher Pills */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveTab('hub')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'hub' ? 'bg-[#F1AD1A] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Overview
              </button>
              <button
                onClick={() => setActiveTab('badge')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'badge' ? 'bg-[#F1AD1A] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                My Digital Badge
              </button>
              <button
                onClick={() => setActiveTab('log')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'log' ? 'bg-[#F1AD1A] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Log Hours
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'history' ? 'bg-[#F1AD1A] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Service History
              </button>
              <button
                onClick={() => setActiveTab('drives')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'drives' ? 'bg-[#F1AD1A] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Upcoming Drives
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Volunteer Badge Card */}
              {(activeTab === 'hub' || activeTab === 'badge') && (
                <div className="lg:col-span-5 space-y-4" id="badge">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900">Official Volunteer Badge</h3>
                        <p className="text-xs text-slate-500">Youth Volunteer Service Credential</p>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                        VOLUNTEER
                      </span>
                    </div>

                    <div className="bg-gradient-to-br from-amber-600 via-[#8E1A23] to-[#1D3557] text-white p-6 rounded-2xl shadow-xl border-2 border-[#F1AD1A] relative overflow-hidden">
                      <div className="flex items-center justify-between pb-3 border-b border-white/20 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-white p-1 border-2 border-[#F1AD1A]">
                            <img src="/landing/wcc.png" alt="WCC" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <div className="text-xs font-black tracking-wide text-white">WE CAN CHANGE</div>
                            <div className="text-[9px] text-[#F1AD1A] font-bold">VOLUNTEER CORPS</div>
                          </div>
                        </div>
                        <Sparkles className="w-5 h-5 text-[#F1AD1A]" />
                      </div>

                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-20 rounded-xl bg-slate-900/60 border-2 border-white/30 flex items-center justify-center text-center p-2 shrink-0">
                          <Award className="w-8 h-8 text-[#F1AD1A]" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-black text-white">{user.name}</h4>
                          <p className="text-xs font-mono font-bold text-[#F1AD1A]">ID: {user.memberId || 'WCC-VOL-0001'}</p>
                          <p className="text-xs text-slate-200">Status: Active Volunteer</p>
                          <p className="text-xs text-slate-200">Total Hours in DB: <span className="font-bold text-[#F1AD1A]">{volunteerHours} hrs</span></p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-slate-300">
                        <div>Database Record Active</div>
                        <Link
                          href={`/verify?id=${encodeURIComponent(user.memberId || 'WCC-VOL-0001')}`}
                          className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded font-bold text-white text-[10px] transition-colors"
                        >
                          Verify Badge
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Log Service Hours Form & History */}
              <div className={activeTab === 'hub' ? 'lg:col-span-7 space-y-6' : 'lg:col-span-12 space-y-6'}>
                {/* Log Service Hours Form */}
                {(activeTab === 'hub' || activeTab === 'log') && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4" id="log">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900">Log Volunteer Service Hours</h3>
                        <p className="text-xs text-slate-500">Record your hours to persist directly into MongoDB</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#A6772A] flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>

                    {volunteerLogSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{volunteerLogSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleLogVolunteerHours} className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Campaign / Drive</label>
                          <input
                            type="text"
                            required
                            value={logDriveName}
                            onChange={(e) => setLogDriveName(e.target.value)}
                            placeholder="e.g. ফ্রি হেলথ ক্যাম্প"
                            className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Hours Served</label>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            max="24"
                            required
                            value={logHours}
                            onChange={(e) => setLogHours(e.target.value)}
                            className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Contribution Notes</label>
                        <input
                          type="text"
                          value={logNotes}
                          onChange={(e) => setLogNotes(e.target.value)}
                          placeholder="e.g. Distributed blood test tokens, assisted doctor registration..."
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingLog}
                        className="px-4 py-2.5 bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>{submittingLog ? 'Saving to Database...' : 'Save Hours to MongoDB'}</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* Real Service History Table from MongoDB */}
                {(activeTab === 'hub' || activeTab === 'history') && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4" id="history">
                    <h3 className="text-base font-black text-slate-900">Service Hours History (From Database)</h3>
                    {volunteerLogs.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                        <span>No service hours recorded yet in MongoDB. Submit the form above to log your first activity!</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                              <th className="py-2 px-3">Date</th>
                              <th className="py-2 px-3">Drive</th>
                              <th className="py-2 px-3">Hours</th>
                              <th className="py-2 px-3">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {volunteerLogs.map((item) => (
                              <tr key={item._id || item.date} className="hover:bg-slate-50">
                                <td className="py-2 px-3 text-slate-500">
                                  {item.date ? new Date(item.date).toLocaleDateString() : 'Today'}
                                </td>
                                <td className="py-2 px-3 font-semibold text-slate-800">{item.driveName}</td>
                                <td className="py-2 px-3 font-bold text-[#A6772A]">+{item.hours} hrs</td>
                                <td className="py-2 px-3 text-slate-600">{item.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Upcoming Community Drives */}
                {(activeTab === 'hub' || activeTab === 'drives') && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4" id="drives">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900">Upcoming Community Action Drives</h3>
                        <p className="text-xs text-slate-500">Upcoming volunteer opportunities across Jhalokathi</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D3557] flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>

                    {activities.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl space-y-2">
                        <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="font-semibold text-slate-700">No community action drives currently scheduled in the database.</p>
                        <p className="text-[11px] text-slate-400">Campaigns created in the admin portal will appear here live for volunteers.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activities.map((act) => (
                          <div key={act.activityId || act._id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {act.wing || 'Community Action'}
                              </span>
                              <span className="text-xs font-semibold text-slate-500">{act.status || 'Active'}</span>
                            </div>
                            <h4 className="text-xs font-black text-slate-900">{act.name}</h4>
                            <p className="text-[11px] text-slate-500">{act.description || 'Official community welfare drive organized by WCC.'}</p>
                            <div className="text-[11px] font-semibold text-[#B62A35]">
                              Venue: {act.venue || 'Jhalokathi'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#B62A35] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Portal...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
