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
  DollarSign,
  X,
  Send,
  RefreshCw,
  Filter,
  Layers,
  MessageSquare
} from 'lucide-react';
import { api } from '@/lib/api';

const WCC_WINGS = [
  { id: 'education', name: 'শিক্ষা ও যুব উন্নয়ন উইং', en: 'Education & Youth Development', desc: 'স্কিল ট্রেনিং, ক্যারিয়ার গাইডেন্স ও ছাত্রবৃত্তি' },
  { id: 'health', name: 'স্বাস্থ্য ও চিকিৎসা সেবা উইং', en: 'Health & Medical Services', desc: 'ব্লাড ডোনেশন, ফ্রি মেডিকেল ক্যাম্প ও জরুরি সহায়তা' },
  { id: 'ict', name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT) উইং', en: 'ICT & Digital Innovation', desc: 'আইটি প্রশিক্ষণ, সফটওয়্যার ও ডিজিটাল অটোমেশন' },
  { id: 'environment', name: 'পরিবেশ, জলবায়ু ও বৃক্ষরোপণ উইং', en: 'Environment & Climate', desc: 'বৃক্ষরোপণ অভিযান, বর্জ্য ব্যবস্থাপনা ও পরিবেশ সুরক্ষা' },
  { id: 'welfare', name: 'সমাজকল্যাণ ও ত্রাণ পুনর্বাসন উইং', en: 'Social Welfare & Relief', desc: 'জরুরি দুর্যোগ ত্রাণ বিতরণ ও পুনর্বাসন প্রকল্প' },
  { id: 'culture', name: 'সংস্কৃতি, ক্রীড়া ও প্রকাশনা উইং', en: 'Culture, Sports & Publications', desc: 'ক্রীড়া প্রতিযোগিতা, সাংস্কৃতিক অনুষ্ঠান ও সাময়িকী' }
];

const VOLUNTEER_AREAS = [
  'জরুরি রক্তদান ও ব্লাড ডোনেশন ক্যাম্প (Blood Donation Drives)',
  'ফ্রি স্বাস্থ্য ও চক্ষু ক্যাম্প সহায়তা (Free Medical Camp Support)',
  'বন্যা ও দুর্যোগে জরুরি ত্রাণ বিতরণ (Disaster Relief & Distribution)',
  'আইটি, ওয়েব ও সোশ্যাল মিডিয়া (IT & Tech Volunteering)',
  'পরিবেশ রক্ষা ও বৃক্ষরোপণ কর্মসূচি (Tree Plantation & Green Drives)',
  'যুব সম্মেলন ও সমাজ সচেতনতামূলক কাজ (Youth Seminars & Outreach)'
];

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
  const [impactStats, setImpactStats] = useState({
    totalPrograms: 0,
    totalVolunteers: 0,
    resolvedIssues: 0
  });
  const [pendingList, setPendingList] = useState([]);
  const [activities, setActivities] = useState([]);

  // Admin Member Requests
  const [adminRequests, setAdminRequests] = useState([]);
  const [adminRequestFilter, setAdminRequestFilter] = useState('all');
  const [reviewNotes, setReviewNotes] = useState({});
  const [reviewingId, setReviewingId] = useState(null);

  // Member / Volunteer Data
  const [memberRecord, setMemberRecord] = useState(null);
  const [myReimbursements, setMyReimbursements] = useState([]);
  const [volunteerHours, setVolunteerHours] = useState(0);
  const [volunteerLogs, setVolunteerLogs] = useState([]);
  const [volunteerLogSuccess, setVolunteerLogSuccess] = useState('');

  // Member Requests state
  const [myRequests, setMyRequests] = useState([]);
  const [wingModalOpen, setWingModalOpen] = useState(false);
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [selectedWing, setSelectedWing] = useState(WCC_WINGS[0].name);
  const [wingReason, setWingReason] = useState('');
  const [selectedVolunteerInterests, setSelectedVolunteerInterests] = useState([]);
  const [volunteerReason, setVolunteerReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState('');

  // Service Log Form State for Volunteers
  const [logDriveName, setLogDriveName] = useState('');
  const [logHours, setLogHours] = useState('');
  const [logNotes, setLogNotes] = useState('');
  const [submittingLog, setSubmittingLog] = useState(false);

  // Sync tab from URL if present
  useEffect(() => {
    if (requestedTab === 'profile') {
      router.push('/profile');
      return;
    }
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab, router]);

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
          const [memStats, finDash, pendingMembers, acts, reqs, impStats] = await Promise.all([
            api.getMemberStats().catch(() => ({ total: 0, active: 0, pending: 0 })),
            api.getFinanceDashboard().catch(() => ({ totalLiquidity: 0 })),
            api.getMembers({ status: 'Pending', limit: 10 }).catch(() => ({ members: [] })),
            api.getActivities().catch(() => []),
            api.getMemberRequests().catch(() => []),
            api.getImpactStats().catch(() => ({ totalPrograms: 0, totalVolunteers: 0, resolvedIssues: 0 }))
          ]);

          setAdminStats({
            totalMembers: memStats.total || 0,
            activeMembers: memStats.active || 0,
            pendingMembers: memStats.pending || 0,
            totalLiquidity: finDash.totalLiquidity || 0
          });
          setImpactStats(impStats || { totalPrograms: 0, totalVolunteers: 0, resolvedIssues: 0 });
          setPendingList(pendingMembers.members || []);
          setActivities(acts || []);
          setAdminRequests(reqs || []);
        } else if (currentUser.role === 'volunteer') {
          if (!requestedTab) setActiveTab('hub');
          const [logs, acts, myReqs] = await Promise.all([
            api.getVolunteerLogs().catch(() => []),
            api.getActivities().catch(() => []),
            api.getMemberRequests({ userId: currentUser.id || currentUser._id, memberId: currentUser.memberId }).catch(() => [])
          ]);
          setVolunteerLogs(logs || []);
          setActivities(acts || []);
          setMyRequests(myReqs || []);
        } else {
          // Member role
          if (!requestedTab) setActiveTab('hub');
          if (currentUser.memberId) {
            const mem = await api.getMember(currentUser.memberId).catch(() => null);
            setMemberRecord(mem);
          }
          const [reims, acts, myReqs] = await Promise.all([
            api.getReimbursements().catch(() => []),
            api.getActivities().catch(() => []),
            api.getMemberRequests({ userId: currentUser.id || currentUser._id, memberId: currentUser.memberId }).catch(() => [])
          ]);
          setMyReimbursements(reims || []);
          setActivities(acts || []);
          setMyRequests(myReqs || []);
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

  // Submit Wing Change Request
  const handleSubmitWingChange = async (e) => {
    e.preventDefault();
    if (!selectedWing) return;
    setSubmittingRequest(true);
    try {
      const currentAssignedWing = memberRecord?.wing || user.volunteerWing || 'সাধারণ উইং';
      if (selectedWing === currentAssignedWing) {
        alert('আপনি ইতোমধ্যে এই উইংয়ে আছেন। অনুগ্রহ করে ভিন্ন একটি উইং নির্বাচন করুন।');
        setSubmittingRequest(false);
        return;
      }
      const newReq = await api.submitMemberRequest({
        userId: user.id || user._id,
        memberId: user.memberId || memberRecord?.memberId || 'Pending',
        memberName: user.name || memberRecord?.nameBn || memberRecord?.nameEn || 'Member',
        memberEmail: user.email,
        type: 'wing_change',
        currentWing: currentAssignedWing,
        requestedWing: selectedWing,
        reason: wingReason
      });
      setMyRequests((prev) => [newReq, ...prev]);
      setWingModalOpen(false);
      setWingReason('');
      setRequestSuccessMsg('উইং পরিবর্তনের আবেদন সফলভাবে জমা হয়েছে! অ্যাডমিন অনুমোদন করার সাথে সাথে আপনার উইং আপডেট হবে।');
      setTimeout(() => setRequestSuccessMsg(''), 6000);
    } catch (err) {
      alert('আবেদন পাঠাতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Toggle Volunteer Interest Checkbox
  const handleToggleInterest = (area) => {
    setSelectedVolunteerInterests((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  // Submit Volunteer Application Request
  const handleSubmitVolunteerApp = async (e) => {
    e.preventDefault();
    if (selectedVolunteerInterests.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি সেবামূলক কাজের ক্ষেত্র নির্বাচন করুন।');
      return;
    }
    setSubmittingRequest(true);
    try {
      const currentAssignedWing = memberRecord?.wing || user.volunteerWing || 'সাধারণ উইং';
      const newReq = await api.submitMemberRequest({
        userId: user.id || user._id,
        memberId: user.memberId || memberRecord?.memberId || 'Pending',
        memberName: user.name || memberRecord?.nameBn || memberRecord?.nameEn || 'Member',
        memberEmail: user.email,
        type: 'become_volunteer',
        currentWing: currentAssignedWing,
        requestedWing: currentAssignedWing,
        volunteerInterests: selectedVolunteerInterests,
        reason: volunteerReason
      });
      setMyRequests((prev) => [newReq, ...prev]);
      setVolunteerModalOpen(false);
      setSelectedVolunteerInterests([]);
      setVolunteerReason('');
      setRequestSuccessMsg('ভলান্টিয়ার হওয়ার আবেদন সফলভাবে জমা হয়েছে! অ্যাডমিন অনুমোদন করলে আপনি ভলান্টিয়ার ব্যাজ ও উইং দায়িত্ব পাবেন।');
      setTimeout(() => setRequestSuccessMsg(''), 6000);
    } catch (err) {
      alert('আবেদন পাঠাতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Admin Review Member Request (Approve or Reject)
  const handleReviewRequest = async (requestId, status) => {
    setReviewingId(requestId);
    try {
      const notes = reviewNotes[requestId] || '';
      const updated = await api.reviewMemberRequest(requestId, {
        status,
        adminNotes: notes,
        reviewedBy: user.name || 'Admin'
      });
      setAdminRequests((prev) => prev.map((r) => (r._id === requestId ? updated : r)));
      alert(`Request has been marked as ${status.toUpperCase()}! Status updated successfully.`);
    } catch (err) {
      alert('Error updating request status: ' + err.message);
    } finally {
      setReviewingId(null);
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
      if (user) {
        const updated = { ...user, totalHours: res.totalHours };
        localStorage.setItem('wcc_user', JSON.stringify(updated));
        setUser(updated);
      }
      setVolunteerLogSuccess(`Successfully recorded ${added} service hours! Your service record has been updated.`);
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
        <p className="text-sm font-semibold text-slate-500">Loading your secure workspace...</p>
      </div>
    );
  }

  if (!user) return null;

  const currentWingName = memberRecord?.wing || user.volunteerWing || 'সাধারণ উইং';
  const pendingAdminRequestsCount = adminRequests.filter((r) => r.status === 'pending').length;

  const filteredAdminRequests = adminRequests.filter((r) => {
    if (adminRequestFilter === 'all') return true;
    if (adminRequestFilter === 'pending') return r.status === 'pending';
    if (adminRequestFilter === 'approved') return r.status === 'approved';
    if (adminRequestFilter === 'rejected') return r.status === 'rejected';
    if (adminRequestFilter === 'wing_change') return r.type === 'wing_change';
    if (adminRequestFilter === 'become_volunteer') return r.type === 'become_volunteer';
    return true;
  });

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
          <p className="text-xs text-slate-500">Central Portal Online & Verified</p>
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
            {/* Admin Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'overview' ? 'bg-[#B62A35] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Overview & Directory
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                  activeTab === 'requests' ? 'bg-[#B62A35] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Member Requests</span>
                {pendingAdminRequestsCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full">
                    {pendingAdminRequestsCount}
                  </span>
                )}
              </button>
            </div>

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

              <div
                onClick={() => setActiveTab('requests')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 cursor-pointer hover:border-amber-500 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Member Requests</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#A6772A] flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-600">{pendingAdminRequestsCount}</div>
                <div className="text-[11px] text-slate-500 font-medium">Wing & Volunteer Applications</div>
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
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{activities.length}</div>
                <div className="text-[11px] text-blue-600 font-semibold">Active Campaigns</div>
              </div>
            </div>

            {/* Grassroots Impact Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Programs Run</span>
                  <div className="text-xl font-black text-slate-900">{impactStats.totalPrograms}</div>
                  <span className="text-[10px] text-blue-600 font-semibold">Community Initiatives</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Volunteers</span>
                  <div className="text-xl font-black text-[#A6772A]">{impactStats.totalVolunteers}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Active Corps</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#A6772A] flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Issues Solved</span>
                  <div className="text-xl font-black text-emerald-600">{impactStats.resolvedIssues}</div>
                  <span className="text-[10px] text-slate-500 font-semibold">Civic Resolutions</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Admin Overview Tab Content */}
            {activeTab === 'overview' && (
              <>
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
                    <p className="text-xs text-slate-500">View, search, or register verified members.</p>
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

                  <button
                    onClick={() => setActiveTab('requests')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all group space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D3557] flex items-center justify-center">
                        <HeartHandshake className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {pendingAdminRequestsCount} Pending
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Review Member Requests</h3>
                    <p className="text-xs text-slate-500">Approve preferred wing changes and volunteer applications.</p>
                  </button>
                </div>

                {/* Pending Member Applications Table */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Pending Membership Registration Review</h3>
                      <p className="text-xs text-slate-500">Applications submitted and awaiting official verification</p>
                    </div>
                    <Link href="/members/new" className="text-xs font-bold text-[#B62A35] hover:underline flex items-center gap-1">
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Member Manually</span>
                    </Link>
                  </div>

                  {pendingList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="font-semibold text-slate-700">No pending member registration applications found.</p>
                      <p className="text-[11px] text-slate-400">New sign ups appear here live.</p>
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
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer"
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
              </>
            )}

            {/* Admin Member Requests Tab Content */}
            {(activeTab === 'requests' || activeTab === 'overview') && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5" id="member-requests">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">
                        Member Requests (Wing Changes & Volunteer Enlistments)
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {adminRequests.length} Total
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Review and accept member requests to change wings or become active youth volunteers.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {['all', 'pending', 'approved', 'rejected', 'wing_change', 'become_volunteer'].map((filterKey) => (
                      <button
                        key={filterKey}
                        onClick={() => setAdminRequestFilter(filterKey)}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all capitalize ${
                          adminRequestFilter === filterKey
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {filterKey === 'wing_change' ? 'Wing Change' : filterKey === 'become_volunteer' ? 'Volunteer Apps' : filterKey}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredAdminRequests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl space-y-2">
                    <HeartHandshake className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-700">No requests found matching the current filter.</p>
                    <p className="text-[11px] text-slate-400">
                      When members request wing changes or apply to be volunteers from their dashboard, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAdminRequests.map((req) => {
                      const isPending = req.status === 'pending';
                      const isApproved = req.status === 'approved';
                      const isRejected = req.status === 'rejected';

                      return (
                        <div
                          key={req._id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isPending
                              ? 'border-amber-200 bg-amber-50/20'
                              : isApproved
                              ? 'border-emerald-200 bg-emerald-50/10'
                              : 'border-slate-200 bg-slate-50/30'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Left: Applicant details & Request specifics */}
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    req.type === 'wing_change'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                                  }`}
                                >
                                  {req.type === 'wing_change' ? 'উইং পরিবর্তন / Wing Change' : 'ভলান্টিয়ার আবেদন / Volunteer Application'}
                                </span>

                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    isPending
                                      ? 'bg-amber-100 text-amber-800'
                                      : isApproved
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {isPending && <Clock className="w-3 h-3" />}
                                  {isApproved && <Check className="w-3 h-3" />}
                                  {isRejected && <X className="w-3 h-3" />}
                                  {req.status.toUpperCase()}
                                </span>

                                <span className="text-[11px] text-slate-400">
                                  {new Date(req.createdAt).toLocaleString()}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
                                <span className="font-bold text-slate-900 text-sm">{req.memberName}</span>
                                <span className="font-mono text-slate-500">ID: {req.memberId}</span>
                                {req.memberEmail && <span className="text-slate-500">{req.memberEmail}</span>}
                              </div>

                              {/* Specific Content */}
                              {req.type === 'wing_change' ? (
                                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Current Wing:</span>
                                    <span className="font-semibold text-slate-700">{req.currentWing}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#B62A35]" />
                                    <span className="text-slate-500">Requested Preferred Wing:</span>
                                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                      {req.requestedWing}
                                    </span>
                                  </div>
                                  {req.reason && (
                                    <div className="text-slate-600 mt-1 pt-1 border-t border-slate-100">
                                      <span className="font-semibold text-slate-500">Applicant Reason: </span>
                                      &ldquo;{req.reason}&rdquo;
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                                  <div>
                                    <span className="font-semibold text-slate-600 block mb-1">Volunteer Interest Areas:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {req.volunteerInterests?.map((interest, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded text-[11px] font-medium"
                                        >
                                          {interest}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  {req.reason && (
                                    <div className="text-slate-600 pt-1 border-t border-slate-100">
                                      <span className="font-semibold text-slate-500">Motivation / Experience: </span>
                                      &ldquo;{req.reason}&rdquo;
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Admin remarks if reviewed */}
                              {!isPending && (
                                <div className="text-[11px] text-slate-500 pt-1">
                                  Reviewed by <span className="font-bold text-slate-700">{req.reviewedBy || 'Admin'}</span>
                                  {req.adminNotes && (
                                    <span className="ml-2 italic text-slate-600">&ldquo;{req.adminNotes}&rdquo;</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Right: Actions */}
                            {isPending ? (
                              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 items-end justify-center">
                                <div className="w-full sm:w-60">
                                  <input
                                    type="text"
                                    placeholder="Admin remarks / notes (optional)"
                                    value={reviewNotes[req._id] || ''}
                                    onChange={(e) =>
                                      setReviewNotes((prev) => ({ ...prev, [req._id]: e.target.value }))
                                    }
                                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#B62A35]"
                                  />
                                </div>
                                <div className="flex items-center gap-2 w-full justify-end">
                                  <button
                                    disabled={reviewingId === req._id}
                                    onClick={() => handleReviewRequest(req._id, 'approved')}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Accept & Approve</span>
                                  </button>
                                  <button
                                    disabled={reviewingId === req._id}
                                    onClick={() => handleReviewRequest(req._id, 'rejected')}
                                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-right shrink-0">
                                <span
                                  className={`px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                                    isApproved
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {isApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                                  <span>{isApproved ? 'Approved & Recorded' : 'Rejected'}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* B. MEMBER VIEW                                            */}
        {/* ========================================================= */}
        {user.role === 'member' && (
          <div className="space-y-6">
            {/* Member Tab Switcher Pills */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveTab('hub')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'hub' ? 'bg-[#B62A35] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Overview
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'requests' ? 'bg-[#B62A35] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Wing & Volunteer Hub</span>
                {myRequests.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#F1AD1A] text-slate-950 font-black text-[10px] rounded-full">
                    {myRequests.length}
                  </span>
                )}
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

            {/* Flash success banner */}
            {requestSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{requestSuccessMsg}</span>
              </div>
            )}

            {/* Wing & Volunteer Hub Hero Feature Card (Visible on 'hub' and 'requests') */}
            {(activeTab === 'hub' || activeTab === 'requests') && (
              <div className="bg-gradient-to-br from-slate-900 via-[#1D3557] to-[#122338] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#B62A35]/15 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F1AD1A] text-slate-950 font-black text-[10px] uppercase tracking-wider">
                        Preferred Wing Selection
                      </span>
                      <span className="text-xs text-slate-300">Charter 2026</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Your Current Wing: <span className="text-[#F1AD1A]">{currentWingName}</span>
                    </h2>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      WCC is organized into 6 specialized wings. You can request a transfer to your preferred wing based on your skills, or apply to join the Youth Volunteer Corps. All requests are processed by the central administration committee.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => setWingModalOpen(true)}
                      className="px-4 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Request Wing Change</span>
                    </button>

                    <button
                      onClick={() => setVolunteerModalOpen(true)}
                      className="px-4 py-2.5 bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Apply to Become Volunteer</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submitted Requests Status Tracker (Live from MongoDB) */}
            {(activeTab === 'hub' || activeTab === 'requests') && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">My Submitted Requests & Live Status</h3>
                    <p className="text-xs text-slate-500">Track pending wing transfers and volunteer enlistment approvals</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWingModalOpen(true)}
                      className="text-xs font-bold text-[#B62A35] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>New Request</span>
                    </button>
                  </div>
                </div>

                {myRequests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl space-y-2">
                    <HeartHandshake className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-700">No requests submitted yet.</p>
                    <p className="text-[11px] text-slate-400">
                      Click the &ldquo;Request Wing Change&rdquo; or &ldquo;Apply to Become Volunteer&rdquo; buttons above to choose your preferred wing or join field campaigns.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Request Type</th>
                          <th className="py-2.5 px-3">Details</th>
                          <th className="py-2.5 px-3">Your Reason</th>
                          <th className="py-2.5 px-3">Admin Status</th>
                          <th className="py-2.5 px-3">Admin Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {myRequests.map((req) => {
                          const isPending = req.status === 'pending';
                          const isApproved = req.status === 'approved';
                          const isRejected = req.status === 'rejected';

                          return (
                            <tr key={req._id} className="hover:bg-slate-50">
                              <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                                {new Date(req.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    req.type === 'wing_change'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {req.type === 'wing_change' ? 'উইং পরিবর্তন' : 'ভলান্টিয়ার আবেদন'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                {req.type === 'wing_change' ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-500">{req.currentWing}</span>
                                    <ArrowRight className="w-3 h-3 text-[#B62A35]" />
                                    <span className="font-bold text-blue-700">{req.requestedWing}</span>
                                  </div>
                                ) : (
                                  <div className="text-slate-700">
                                    {req.volunteerInterests?.length > 0 ? req.volunteerInterests.join(', ') : 'Youth Volunteer'}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                                {req.reason || '-'}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                                    isPending
                                      ? 'bg-amber-100 text-amber-800'
                                      : isApproved
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {isPending && <Clock className="w-3 h-3" />}
                                  {isApproved && <CheckCircle2 className="w-3 h-3" />}
                                  {isRejected && <AlertCircle className="w-3 h-3" />}
                                  <span>
                                    {isPending && 'বিবেচনাধীন (Pending)'}
                                    {isApproved && 'অনুমোদিত (Approved)'}
                                    {isRejected && 'প্রত্যাখ্যাত (Rejected)'}
                                  </span>
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-500 italic max-w-xs">
                                {req.adminNotes ? `"${req.adminNotes}"` : isApproved ? 'Accepted by admin' : isPending ? 'Review in progress' : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
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
                          <p className="text-xs text-slate-200">Wing: {currentWingName}</p>
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
                        <span className="text-slate-400 block mb-0.5">Assigned Wing</span>
                        <span className="font-bold text-blue-700">{currentWingName}</span>
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
            {/* Flash success banner */}
            {requestSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{requestSuccessMsg}</span>
              </div>
            )}

            {/* Wing Change Card for Volunteers */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                  Volunteer Assignment
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Assigned Wing: <span className="text-[#B62A35]">{currentWingName}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Want to contribute to another operational wing? You can submit a wing transfer request for admin review.
                </p>
              </div>
              <button
                onClick={() => setWingModalOpen(true)}
                className="px-4 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Request Wing Transfer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Volunteer Badge Card */}
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
                        <p className="text-xs text-slate-200">Wing: {currentWingName}</p>
                        <p className="text-xs text-slate-200">Total Service Hours: <span className="font-bold text-[#F1AD1A]">{volunteerHours} hrs</span></p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-slate-300">
                      <div>Official Status: Active</div>
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

              {/* Log Service Hours Form & History */}
              <div className="lg:col-span-7 space-y-6">
                {/* Log Service Hours Form */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4" id="log">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Log Volunteer Service Hours</h3>
                      <p className="text-xs text-slate-500">Record your volunteer activity hours for verified recognition.</p>
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
                      className="px-4 py-2.5 bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{submittingLog ? 'Saving Hours...' : 'Log Volunteer Hours'}</span>
                    </button>
                  </form>
                </div>

                {/* Real Service History Table */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4" id="history">
                  <h3 className="text-base font-black text-slate-900">Service Hours History</h3>
                  {volunteerLogs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                      <span>No service hours recorded yet. Submit the form above to log your first activity!</span>
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

                {/* Upcoming Community Drives */}
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
                      <p className="font-semibold text-slate-700">No community action drives currently scheduled.</p>
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
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* MODAL 1: REQUEST WING CHANGE                                      */}
      {/* ================================================================= */}
      {wingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setWingModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                Official Wing Selection
              </span>
              <h3 className="text-lg font-black text-slate-900">
                পছন্দের উইং পরিবর্তনের আবেদন (Request Wing Change)
              </h3>
              <p className="text-xs text-slate-500">
                বর্তমান উইং: <span className="font-bold text-slate-800">{currentWingName}</span>
              </p>
            </div>

            <form onSubmit={handleSubmitWingChange} className="space-y-5 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-slate-800">
                  নতুন উইং নির্বাচন করুন / Choose Preferred Wing:
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {WCC_WINGS.map((wing) => {
                    const isCurrent = wing.name === currentWingName;
                    const isSelected = wing.name === selectedWing;

                    return (
                      <label
                        key={wing.id}
                        className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#B62A35] bg-rose-50/50 shadow-xs ring-1 ring-[#B62A35]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        } ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="radio"
                          name="selectedWing"
                          disabled={isCurrent}
                          value={wing.name}
                          checked={isSelected}
                          onChange={() => setSelectedWing(wing.name)}
                          className="mt-1 text-[#B62A35] focus:ring-[#B62A35]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{wing.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-semibold">
                                বর্তমান উইং
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{wing.en}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{wing.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  উইং পরিবর্তনের কারণ বা আপনার আগ্রহ (Reason for Choosing this Wing):
                </label>
                <textarea
                  rows={3}
                  required
                  value={wingReason}
                  onChange={(e) => setWingReason(e.target.value)}
                  placeholder="যেমন: আমি আইটি ও সফটওয়্যার ডেভেলপমেন্টে দক্ষ, তাই তথ্য ও যোগাযোগ প্রযুক্তি উইংয়ে দায়িত্ব পালন করতে আগ্রহী..."
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:border-[#B62A35] focus:outline-hidden text-xs"
                ></textarea>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
                <AlertCircle className="w-4 h-4 text-[#B62A35] shrink-0 mt-0.5" />
                <p>
                  আপনার আবেদনটি সাবমিট করার পর কেন্দ্রীয় অ্যাডমিন প্যানেলে যাচাই করা হবে। অ্যাডমিন অনুমোদন প্রদান করলে আপনার আইডি কার্ড এবং প্রোফাইল স্বয়ংক্রিয়ভাবে নতুন উইংয়ে আপডেট হয়ে যাবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-5 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingRequest ? 'Submitting Request...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: APPLY TO BECOME A VOLUNTEER                              */}
      {/* ================================================================= */}
      {volunteerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setVolunteerModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                Youth Volunteer Enlistment
              </span>
              <h3 className="text-lg font-black text-slate-900">
                ভলান্টিয়ার হওয়ার আবেদন (Apply to Become a Volunteer)
              </h3>
              <p className="text-xs text-slate-500">
                WCC-এর সামাজিক ও মানবিক উদ্যোগে ফিল্ড ভলান্টিয়ার হিসেবে যুক্ত হতে আপনার আগ্রহ প্রকাশ করুন।
              </p>
            </div>

            <form onSubmit={handleSubmitVolunteerApp} className="space-y-5 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-slate-800">
                  আপনি কোন কোন ক্ষেত্রে স্বেচ্ছাসেবা দিতে চান? (Select Volunteer Areas):
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {VOLUNTEER_AREAS.map((area, idx) => {
                    const isChecked = selectedVolunteerInterests.includes(area);

                    return (
                      <label
                        key={idx}
                        className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-1 ring-purple-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleInterest(area)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-semibold text-slate-800 text-xs">{area}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  আপনার অনুপ্রেরণা ও সেবামূলক কাজের অভিজ্ঞতা (Motivation & Prior Experience):
                </label>
                <textarea
                  rows={3}
                  required
                  value={volunteerReason}
                  onChange={(e) => setVolunteerReason(e.target.value)}
                  placeholder="যেমন: আমি ঝালকাঠির স্থানীয় যুবকদের সাথে সমাজসেবামূলক কাজে যুক্ত হতে আগ্রহী এবং জরুরি রক্তদান ও মেডিকেল ক্যাম্পে সক্রিয় ভূমিকা পালন করতে চাই..."
                  className="w-full p-3 border border-slate-200 rounded-2xl focus:border-purple-600 focus:outline-hidden text-xs"
                ></textarea>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-start gap-2.5 text-[11px] text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <p>
                  অ্যাডমিন কর্তৃক আবেদন অনুমোদিত হলে আপনার অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে ভলান্টিয়ার হিসেবে উন্নীত হবে এবং আপনি ভলান্টিয়ার ব্যাজ ও সার্ভিস আওয়ার লগ করার সুবিধা পাবেন।
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVolunteerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-5 py-2.5 bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingRequest ? 'Submitting Application...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#B62A35] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading Portal...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
