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
  CalendarDays,
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
  MessageSquare,
  Zap,
  Loader2,
  Search,
  UserCheck,
  UserPlus,
  Shield,
  Phone,
  Mail,
  ArrowUpRight
} from 'lucide-react';
import { api } from '@/lib/api';

const DEFAULT_VOLUNTEER_AREAS = [
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

  // Admin Coordinators Hub state
  const [coordinators, setCoordinators] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [wingsList, setWingsList] = useState([]);
  const [loadingCoordinators, setLoadingCoordinators] = useState(false);
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [volunteerWingFilter, setVolunteerWingFilter] = useState('All');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVolunteerToAssign, setSelectedVolunteerToAssign] = useState(null);
  const [targetWingId, setTargetWingId] = useState('');
  const [assigningCoordinator, setAssigningCoordinator] = useState(false);
  const [coordinatorActionFeedback, setCoordinatorActionFeedback] = useState({ type: '', message: '' });

  // Demote / Reassign state
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedCoordinatorToReassign, setSelectedCoordinatorToReassign] = useState(null);
  const [demoteConfirmOpen, setDemoteConfirmOpen] = useState(false);
  const [coordinatorToDemote, setCoordinatorToDemote] = useState(null);
  const [demotingCoordinator, setDemotingCoordinator] = useState(false);

  // Admin Volunteer Hub state
  const [membersList, setMembersList] = useState([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [volunteerHubSearch, setVolunteerHubSearch] = useState('');
  const [volunteerHubWingFilter, setVolunteerHubWingFilter] = useState('All');
  const [memberRosterSearch, setMemberRosterSearch] = useState('');
  const [volunteerActionFeedback, setVolunteerActionFeedback] = useState({ type: '', message: '' });

  // Volunteer Nomination Modal state
  const [nominateVolModalOpen, setNominateVolModalOpen] = useState(false);
  const [selectedMemberToNominate, setSelectedMemberToNominate] = useState(null);
  const [targetVolWingId, setTargetVolWingId] = useState('');
  const [volInvitationNote, setVolInvitationNote] = useState('');
  const [sendingVolInvitation, setSendingVolInvitation] = useState(false);

  // Volunteer Demote to Member state
  const [demoteVolConfirmOpen, setDemoteVolConfirmOpen] = useState(false);
  const [volunteerToDemote, setVolunteerToDemote] = useState(null);
  const [demotingVolunteer, setDemotingVolunteer] = useState(false);

  // Volunteer Reassign Wing state
  const [reassignVolWingModalOpen, setReassignVolWingModalOpen] = useState(false);
  const [selectedVolToReassign, setSelectedVolToReassign] = useState(null);
  const [reassigningVolWing, setReassigningVolWing] = useState(false);

  // Coordinator's own view state (when logged in as role === 'coordinator')
  const [coordinatorWing, setCoordinatorWing] = useState(null);
  const [coordinatorWingEvents, setCoordinatorWingEvents] = useState([]);

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
  const [selectedWing, setSelectedWing] = useState('');
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

  // Volunteer Events State
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventRegistrations, setEventRegistrations] = useState({}); // { eventId: registrationObj }
  const [registeringEventId, setRegisteringEventId] = useState(null);
  const [eventFeedback, setEventFeedback] = useState(''); // success/error message

  // Role Invitations / Notifications state
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [respondingInvitationId, setRespondingInvitationId] = useState(null);
  const [invitationFeedback, setInvitationFeedback] = useState({ type: '', message: '' });

  const loadPendingInvitations = async () => {
    try {
      const notifs = await api.getMyNotifications({ status: 'pending' });
      const roleInvs = Array.isArray(notifs)
        ? notifs.filter((n) => n.type === 'role_invitation' && n.status === 'pending')
        : [];
      setPendingInvitations(roleInvs);
    } catch (err) {
      console.error('Failed to load pending invitations:', err);
    }
  };

  const handleRespondInvitation = async (invitationId, action) => {
    setRespondingInvitationId(invitationId);
    setInvitationFeedback({ type: '', message: '' });
    try {
      const res = await api.respondToRoleInvitation(invitationId, action);
      if (action === 'accept' && res.user) {
        localStorage.setItem('wcc_user', JSON.stringify(res.user));
        setUser(res.user);
        setInvitationFeedback({
          type: 'success',
          message: res.message || 'Role accepted successfully! Upgrading your dashboard...'
        });
        setPendingInvitations((prev) => prev.filter((i) => (i._id || i.id) !== invitationId));
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setInvitationFeedback({
          type: 'info',
          message: 'Role invitation declined.'
        });
        setPendingInvitations((prev) => prev.filter((i) => (i._id || i.id) !== invitationId));
        setTimeout(() => setInvitationFeedback({ type: '', message: '' }), 4000);
      }
    } catch (err) {
      setInvitationFeedback({
        type: 'error',
        message: err.message || 'Failed to respond to invitation.'
      });
    } finally {
      setRespondingInvitationId(null);
    }
  };

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

  const fetchCoordinatorsData = async () => {
    setLoadingCoordinators(true);
    try {
      const [coords, vols, wngs, mems] = await Promise.all([
        api.getCoordinators().catch(() => []),
        api.getUsers({ role: 'volunteer' }).catch(() => []),
        api.getWings().catch(() => []),
        api.getUsers({ role: 'member' }).catch(() => [])
      ]);
      setCoordinators(Array.isArray(coords) ? coords : []);
      setVolunteers(Array.isArray(vols) ? vols : []);
      setWingsList(Array.isArray(wngs) ? wngs : []);
      setMembersList(Array.isArray(mems) ? mems : []);
    } catch (err) {
      console.error('Failed to load coordinators data:', err);
    } finally {
      setLoadingCoordinators(false);
    }
  };

  const fetchVolunteersData = async () => {
    setLoadingVolunteers(true);
    try {
      const [vols, mems, wngs, coords] = await Promise.all([
        api.getUsers({ role: 'volunteer' }).catch(() => []),
        api.getUsers({ role: 'member' }).catch(() => []),
        api.getWings().catch(() => []),
        api.getCoordinators().catch(() => [])
      ]);
      setVolunteers(Array.isArray(vols) ? vols : []);
      setMembersList(Array.isArray(mems) ? mems : []);
      setWingsList(Array.isArray(wngs) ? wngs : []);
      setCoordinators(Array.isArray(coords) ? coords : []);
    } catch (err) {
      console.error('Failed to load volunteer hub data:', err);
    } finally {
      setLoadingVolunteers(false);
    }
  };

  useEffect(() => {
    async function initDashboard() {
      try {
        const stored = localStorage.getItem('wcc_user');
        if (!stored) {
          router.push('/login');
          return;
        }
        let currentUser = JSON.parse(stored);

        // Fetch live user profile to sync any role updates (e.g., promoted to coordinator)
        try {
          const meRes = await api.getMe();
          if (meRes && meRes.user) {
            currentUser = meRes.user;
            localStorage.setItem('wcc_user', JSON.stringify(meRes.user));
          }
        } catch {
          // fallback to local stored user
        }

        setUser(currentUser);
        setVolunteerHours(currentUser.totalHours || 0);

        // Fetch data according to role strictly from MongoDB
        if (currentUser.role === 'admin' || currentUser.role === 'finance_officer') {
          if (!requestedTab) setActiveTab('overview');
          const [memStats, finDash, pendingMembers, acts, reqs, impStats, coords, vols, wngs, memUsers] = await Promise.all([
            api.getMemberStats().catch(() => ({ total: 0, active: 0, pending: 0 })),
            api.getFinanceDashboard().catch(() => ({ totalLiquidity: 0 })),
            api.getMembers({ status: 'Pending', limit: 10 }).catch(() => ({ members: [] })),
            api.getActivities().catch(() => []),
            api.getMemberRequests().catch(() => []),
            api.getImpactStats().catch(() => ({ totalPrograms: 0, totalVolunteers: 0, resolvedIssues: 0 })),
            api.getCoordinators().catch(() => []),
            api.getUsers({ role: 'volunteer' }).catch(() => []),
            api.getWings().catch(() => []),
            api.getUsers({ role: 'member' }).catch(() => [])
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
          setCoordinators(Array.isArray(coords) ? coords : []);
          setVolunteers(Array.isArray(vols) ? vols : []);
          setWingsList(Array.isArray(wngs) ? wngs : []);
          setMembersList(Array.isArray(memUsers) ? memUsers : []);
        } else if (currentUser.role === 'coordinator') {
          if (!requestedTab) setActiveTab('coord-hub');
          const [wngs, allEvents, acts, impStats] = await Promise.all([
            api.getWings().catch(() => []),
            api.getEvents().catch(() => []),
            api.getActivities().catch(() => []),
            api.getImpactStats().catch(() => ({ totalPrograms: 0, totalVolunteers: 0, resolvedIssues: 0 }))
          ]);
          setWingsList(Array.isArray(wngs) ? wngs : []);
          setActivities(acts || []);
          setImpactStats(impStats || { totalPrograms: 0, totalVolunteers: 0, resolvedIssues: 0 });

          const resolvedWingId = String(currentUser.assignedWing?._id || currentUser.assignedWing || '');
          const assignedWingObj = (Array.isArray(wngs) ? wngs : []).find(w => String(w._id) === resolvedWingId) || currentUser.assignedWing;
          setCoordinatorWing(assignedWingObj);

          const myWingEvents = (Array.isArray(allEvents) ? allEvents : []).filter(
            ev => String(ev.wingId?._id || ev.wingId || '') === resolvedWingId
          );
          setCoordinatorWingEvents(myWingEvents);
        } else if (currentUser.role === 'volunteer') {
          if (!requestedTab) setActiveTab('hub');
          const [logs, acts, myReqs, events] = await Promise.all([
            api.getVolunteerLogs().catch(() => []),
            api.getActivities().catch(() => []),
            api.getMemberRequests({ userId: currentUser.id || currentUser._id, memberId: currentUser.memberId }).catch(() => []),
            api.getEvents({ status: 'published' }).catch(() => [])
          ]);
          setVolunteerLogs(logs || []);
          setActivities(acts || []);
          setMyRequests(myReqs || []);

          // Load events and check my registrations for each
          const evList = Array.isArray(events) ? events : [];
          setUpcomingEvents(evList);
          if (evList.length > 0) {
            const regMap = {};
            await Promise.all(
              evList.map(async (ev) => {
                try {
                  const r = await api.getMyEventRegistration(ev._id);
                  if (r.registered) regMap[ev._id] = r.registration;
                } catch {
                  // not registered
                }
              })
            );
            setEventRegistrations(regMap);
          }
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

        // Check for pending role invitations for the logged-in user
        await loadPendingInvitations();
      } catch (err) {
        console.error('Dashboard init error:', err);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [router, requestedTab]);

  // Tab Switcher with URL synchronization
  const handleTabSwitch = (newTab) => {
    setActiveTab(newTab);
    const targetUrl = newTab === 'overview' ? '/dashboard' : `/dashboard?tab=${newTab}`;
    router.replace(targetUrl, { scroll: false });
  };

  // Coordinators Hub Action Handlers
  const handleAssignCoordinator = async () => {
    if (!selectedVolunteerToAssign || !targetWingId) {
      setCoordinatorActionFeedback({
        type: 'error',
        message: 'Please select a wing to assign the coordinator to.'
      });
      return;
    }

    setAssigningCoordinator(true);
    setCoordinatorActionFeedback({ type: '', message: '' });

    try {
      const volId = selectedVolunteerToAssign._id || selectedVolunteerToAssign.id;
      const assignedWing = wingsList.find((w) => String(w._id) === String(targetWingId));
      const wingName = assignedWing ? `${assignedWing.nameBn} (${assignedWing.nameEn})` : 'selected wing';

      // Send appointment invitation notification to the volunteer
      await api.sendRoleInvitation({
        recipientUserId: volId,
        recipientEmail: selectedVolunteerToAssign.email,
        recipientMemberId: selectedVolunteerToAssign.memberId,
        recipientName: selectedVolunteerToAssign.name,
        targetRole: 'coordinator',
        targetWing: wingName,
        targetWingId: targetWingId,
        note: `You have been nominated by Admin to lead as Coordinator for ${wingName}. Please accept or decline this appointment on your dashboard.`
      });

      setCoordinatorActionFeedback({
        type: 'success',
        message: `Coordinator appointment invitation sent to ${selectedVolunteerToAssign.name} for ${wingName}! They can now accept the appointment on their dashboard.`
      });

      setAssignModalOpen(false);
      setSelectedVolunteerToAssign(null);
      setTargetWingId('');

      await fetchCoordinatorsData();
      api.getImpactStats().then((s) => setImpactStats(s)).catch(() => {});
    } catch (err) {
      setCoordinatorActionFeedback({
        type: 'error',
        message: err.message || 'Failed to send coordinator appointment invitation. Please try again.'
      });
    } finally {
      setAssigningCoordinator(false);
    }
  };

  const handleReassignWing = async () => {
    if (!selectedCoordinatorToReassign || !targetWingId) return;
    setAssigningCoordinator(true);
    try {
      const coordId = selectedCoordinatorToReassign._id || selectedCoordinatorToReassign.id;
      await api.updateUserWing(coordId, targetWingId);
      const assignedWing = wingsList.find((w) => String(w._id) === String(targetWingId));
      const wingName = assignedWing ? (assignedWing.nameEn || assignedWing.nameBn) : 'new wing';
      setCoordinatorActionFeedback({
        type: 'success',
        message: `${selectedCoordinatorToReassign.name}'s assigned wing updated to ${wingName}.`
      });
      setReassignModalOpen(false);
      setSelectedCoordinatorToReassign(null);
      setTargetWingId('');
      await fetchCoordinatorsData();
    } catch (err) {
      setCoordinatorActionFeedback({
        type: 'error',
        message: err.message || 'Failed to update coordinator wing.'
      });
    } finally {
      setAssigningCoordinator(false);
    }
  };

  const handleDemoteCoordinator = async () => {
    if (!coordinatorToDemote) return;
    setDemotingCoordinator(true);
    try {
      const coordId = coordinatorToDemote._id || coordinatorToDemote.id;
      await api.updateUserRole(coordId, 'volunteer', null);
      setCoordinatorActionFeedback({
        type: 'success',
        message: `${coordinatorToDemote.name} has been reassigned to Volunteer Corps.`
      });
      setDemoteConfirmOpen(false);
      setCoordinatorToDemote(null);
      await fetchCoordinatorsData();
    } catch (err) {
      setCoordinatorActionFeedback({
        type: 'error',
        message: err.message || 'Failed to demote coordinator.'
      });
    } finally {
      setDemotingCoordinator(false);
    }
  };

  // Volunteer Hub Action Handlers
  const handleNominateVolunteer = async () => {
    if (!selectedMemberToNominate || !targetVolWingId) {
      setVolunteerActionFeedback({
        type: 'error',
        message: 'Please select a wing for the volunteer candidate.'
      });
      return;
    }

    setSendingVolInvitation(true);
    setVolunteerActionFeedback({ type: '', message: '' });

    try {
      const memId = selectedMemberToNominate._id || selectedMemberToNominate.id;
      const assignedWing = wingsList.find((w) => String(w._id) === String(targetVolWingId));
      const wingName = assignedWing ? `${assignedWing.nameBn} (${assignedWing.nameEn})` : 'selected wing';

      await api.sendRoleInvitation({
        recipientUserId: memId,
        recipientEmail: selectedMemberToNominate.email,
        recipientMemberId: selectedMemberToNominate.memberId,
        recipientName: selectedMemberToNominate.name,
        targetRole: 'volunteer',
        targetWing: wingName,
        targetWingId: targetVolWingId,
        note: volInvitationNote?.trim() || `You have been nominated by Admin to join the Volunteer Corps under ${wingName}. Please accept or decline this role on your dashboard.`
      });

      setVolunteerActionFeedback({
        type: 'success',
        message: `Volunteer nomination invitation sent to ${selectedMemberToNominate.name} for ${wingName}! They can now accept or decline on their dashboard.`
      });

      setNominateVolModalOpen(false);
      setSelectedMemberToNominate(null);
      setTargetVolWingId('');
      setVolInvitationNote('');

      await fetchVolunteersData();
      api.getImpactStats().then((s) => setImpactStats(s)).catch(() => {});
    } catch (err) {
      setVolunteerActionFeedback({
        type: 'error',
        message: err.message || 'Failed to send volunteer invitation. Please try again.'
      });
    } finally {
      setSendingVolInvitation(false);
    }
  };

  const handleReassignVolunteerWing = async () => {
    if (!selectedVolToReassign || !targetVolWingId) return;
    setReassigningVolWing(true);
    try {
      const volId = selectedVolToReassign._id || selectedVolToReassign.id;
      await api.updateUserWing(volId, targetVolWingId);
      const assignedWing = wingsList.find((w) => String(w._id) === String(targetVolWingId));
      const wingName = assignedWing ? `${assignedWing.nameBn} (${assignedWing.nameEn})` : 'new wing';
      setVolunteerActionFeedback({
        type: 'success',
        message: `${selectedVolToReassign.name}'s assigned volunteer wing updated to ${wingName}.`
      });
      setReassignVolWingModalOpen(false);
      setSelectedVolToReassign(null);
      setTargetVolWingId('');
      await fetchVolunteersData();
    } catch (err) {
      setVolunteerActionFeedback({
        type: 'error',
        message: err.message || 'Failed to update volunteer wing.'
      });
    } finally {
      setReassigningVolWing(false);
    }
  };

  const handleDemoteVolunteer = async () => {
    if (!volunteerToDemote) return;
    setDemotingVolunteer(true);
    try {
      const volId = volunteerToDemote._id || volunteerToDemote.id;
      await api.updateUserRole(volId, 'member', null);
      setVolunteerActionFeedback({
        type: 'success',
        message: `${volunteerToDemote.name} has been reassigned to General Member role.`
      });
      setDemoteVolConfirmOpen(false);
      setVolunteerToDemote(null);
      await fetchVolunteersData();
      api.getImpactStats().then((s) => setImpactStats(s)).catch(() => {});
    } catch (err) {
      setVolunteerActionFeedback({
        type: 'error',
        message: err.message || 'Failed to demote volunteer.'
      });
    } finally {
      setDemotingVolunteer(false);
    }
  };

  const filteredVolunteers = volunteers.filter((vol) => {
    const q = volunteerSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      vol.name?.toLowerCase().includes(q) ||
      vol.email?.toLowerCase().includes(q) ||
      vol.phone?.toLowerCase().includes(q) ||
      vol.memberId?.toLowerCase().includes(q) ||
      vol.volunteerWing?.toLowerCase().includes(q);

    const matchesWing =
      volunteerWingFilter === 'All' ||
      (vol.volunteerWing && vol.volunteerWing.toLowerCase().includes(volunteerWingFilter.toLowerCase()));

    return matchesSearch && matchesWing;
  });

  const filteredVolunteerHubList = volunteers.filter((vol) => {
    const q = volunteerHubSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      vol.name?.toLowerCase().includes(q) ||
      vol.email?.toLowerCase().includes(q) ||
      vol.phone?.toLowerCase().includes(q) ||
      vol.memberId?.toLowerCase().includes(q) ||
      vol.volunteerWing?.toLowerCase().includes(q);

    const matchesWing =
      volunteerHubWingFilter === 'All' ||
      (vol.volunteerWing && vol.volunteerWing.toLowerCase().includes(volunteerHubWingFilter.toLowerCase()));

    return matchesSearch && matchesWing;
  });

  const filteredMembersRoster = membersList.filter((mem) => {
    const q = memberRosterSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      mem.name?.toLowerCase().includes(q) ||
      mem.email?.toLowerCase().includes(q) ||
      mem.phone?.toLowerCase().includes(q) ||
      mem.memberId?.toLowerCase().includes(q) ||
      mem.upazila?.toLowerCase().includes(q);

    const isGeneralMember = mem.role === 'member' || !mem.role;
    return matchesSearch && isGeneralMember;
  });

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

  const getRoleTitle = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin Control Center';
      case 'coordinator':
        return 'Wing Coordinator Hub';
      case 'volunteer':
        return 'Volunteer Action Hub';
      case 'finance_officer':
        return 'Treasury & Finance Portal';
      default:
        return 'Member Services Portal';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { text: 'Admin', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'coordinator':
        return { text: 'Coordinator', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'volunteer':
        return { text: 'Volunteer', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'finance_officer':
        return { text: 'Finance', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { text: 'Member', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Workspace Header */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {getRoleTitle(user.role)}
            </h1>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getRoleBadge(user.role).color}`}>
              {getRoleBadge(user.role).text}
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
        {/* Role Invitation Interactive Banner */}
        {pendingInvitations.length > 0 && (
          <div className="space-y-4">
            {pendingInvitations.map((inv) => (
              <div
                key={inv._id || inv.id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-[#B62A35] to-[#8E1A23] p-1 shadow-lg"
              >
                <div className="bg-white rounded-[14px] p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                            Leadership & Role Appointment
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            from {inv.senderName || 'WCC Central Administration'}
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                          {inv.title}
                        </h2>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 self-start sm:self-auto">
                      <span>Offered Role:</span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black uppercase tracking-wider text-[10px]">
                        {inv.targetRole === 'coordinator' ? 'Wing Coordinator' : 'Volunteer'}
                      </span>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70 text-slate-700 text-xs leading-relaxed space-y-2">
                    <p className="font-semibold text-slate-800 whitespace-pre-line">{inv.message}</p>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 pt-1 border-t border-amber-200/50">
                      <div>
                        <span className="text-slate-400 font-medium">Assigned Wing: </span>
                        <strong className="text-[#B62A35] font-black">{inv.targetWing}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Privileges: </span>
                        <span className="font-semibold text-slate-800">
                          {inv.targetRole === 'coordinator'
                            ? 'Lead wing operations, create and manage events, oversee volunteers'
                            : 'Log field service hours, participate in community drives, receive volunteer accreditation'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Response Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-[11px] text-slate-400 italic">
                      You can choose to accept and activate this role, or politely decline to remain in your current capacity.
                    </p>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        disabled={respondingInvitationId === (inv._id || inv.id)}
                        onClick={() => handleRespondInvitation(inv._id || inv.id, 'reject')}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={respondingInvitationId === (inv._id || inv.id)}
                        onClick={() => handleRespondInvitation(inv._id || inv.id, 'accept')}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {respondingInvitationId === (inv._id || inv.id)
                            ? 'Activating Role...'
                            : 'Accept & Activate Role'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invitation Feedback Toast */}
        {invitationFeedback.message && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold animate-fadeIn ${
              invitationFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : invitationFeedback.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{invitationFeedback.message}</span>
            </div>
            <button onClick={() => setInvitationFeedback({ type: '', message: '' })} className="hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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

              <div
                onClick={() => handleTabSwitch('requests')}
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

              <div
                onClick={() => handleTabSwitch('coordinators')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#B62A35] transition-all"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Wing Coordinators</span>
                  <div className="text-xl font-black text-[#B62A35]">{coordinators.length}</div>
                  <span className="text-[10px] text-purple-600 font-semibold">Appointed Wing Leads</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#B62A35] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div
                onClick={() => handleTabSwitch('volunteers')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-500 transition-all"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Volunteer Corps</span>
                  <div className="text-xl font-black text-[#A6772A]">{volunteers.length || impactStats.totalVolunteers}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Active Across Wings</span>
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

            {/* Coordinators Hub Tab Content */}
            {activeTab === 'coordinators' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Action Feedback Banner */}
                {coordinatorActionFeedback.message && (
                  <div
                    className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200 ${
                      coordinatorActionFeedback.type === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {coordinatorActionFeedback.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="font-semibold">{coordinatorActionFeedback.message}</span>
                    </div>
                    <button
                      onClick={() => setCoordinatorActionFeedback({ type: '', message: '' })}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Coordinators Hub Hero Banner */}
                <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-rose-300 border border-white/10">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>উইং কো-অর্ডিনেটর ও ভলান্টিয়ার নেতৃত্ব ব্যবস্থাপনা</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Wing Coordinators Hub & Volunteer Leadership
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Assign dedicated volunteers from any wing as official Wing Coordinators. Once appointed, wing coordinators can create events, record volunteer attendance, and lead community initiatives for their assigned wing.
                      </p>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                      <button
                        onClick={fetchCoordinatorsData}
                        disabled={loadingCoordinators}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingCoordinators ? 'animate-spin' : ''}`} />
                        <span>Refresh Rosters</span>
                      </button>
                      <Link
                        href="/admin/events"
                        className="px-4 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>Events Hub</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Wings</span>
                      <div className="text-2xl font-black text-white">{wingsList.length}</div>
                      <span className="text-[10px] text-slate-400">Operational wings</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wing Coordinators</span>
                      <div className="text-2xl font-black text-emerald-400">{coordinators.length}</div>
                      <span className="text-[10px] text-emerald-300/80">Active appointed leads</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Volunteer Corps</span>
                      <div className="text-2xl font-black text-[#F1AD1A]">{volunteers.length}</div>
                      <span className="text-[10px] text-amber-300/80">Eligible across all wings</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Leadership Coverage</span>
                      <div className="text-2xl font-black text-blue-400">
                        {wingsList.length > 0 ? `${Math.min(100, Math.round((coordinators.length / wingsList.length) * 100))}%` : '100%'}
                      </div>
                      <span className="text-[10px] text-blue-300/80">Wings with appointed lead</span>
                    </div>
                  </div>
                </div>


                {/* Section 2: Volunteer Corps Across All Wings */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">
                          সকল উইং-এর ভলান্টিয়ার তালিকা (Volunteer Corps of All Wings)
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {filteredVolunteers.length} Active Volunteers
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select any volunteer to promote them to Wing Coordinator. They will receive event creation privileges for their wing.
                      </p>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={volunteerSearch}
                          onChange={(e) => setVolunteerSearch(e.target.value)}
                          placeholder="Search by name, mobile, wing..."
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#B62A35] transition-all"
                        />
                        {volunteerSearch && (
                          <button
                            onClick={() => setVolunteerSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={volunteerWingFilter}
                          onChange={(e) => setVolunteerWingFilter(e.target.value)}
                          className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:border-[#B62A35]"
                        >
                          <option value="All">All Wings</option>
                          {wingsList.map((w) => (
                            <option key={w._id} value={w.nameEn}>
                              {w.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Volunteers Table */}
                  {filteredVolunteers.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl space-y-2 border border-dashed border-slate-200">
                      <HeartHandshake className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No volunteers match your search filter.</p>
                      <p className="text-slate-400">Try clearing the search query or selecting "All Wings".</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50">
                            <th className="py-3 px-4 rounded-l-xl">Volunteer Details</th>
                            <th className="py-3 px-4">Contact</th>
                            <th className="py-3 px-4">Active Wing / Interests</th>
                            <th className="py-3 px-4">Location & Hours</th>
                            <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredVolunteers.map((vol) => (
                            <tr key={vol._id || vol.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#A6772A] font-black text-xs flex items-center justify-center shrink-0 border border-amber-200">
                                    {vol.name ? vol.name.charAt(0).toUpperCase() : 'V'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm">{vol.name}</div>
                                    <div className="text-[11px] font-mono text-slate-500">{vol.memberId || 'VOLUNTEER'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <div className="text-slate-700 font-mono text-[11px]">{vol.email}</div>
                                  <div className="text-slate-500 font-mono text-[11px]">{vol.phone || 'No phone'}</div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-[#B62A35] border border-rose-200 font-bold text-[10px] rounded-full">
                                    {vol.volunteerWing || 'সাধারণ উইং (General Corps)'}
                                  </span>
                                  {Array.isArray(vol.volunteerInterests) && vol.volunteerInterests.length > 0 && (
                                    <p className="text-[10px] text-slate-500 truncate max-w-xs">
                                      {vol.volunteerInterests.join(', ')}
                                    </p>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <div className="text-slate-700 font-semibold">{vol.upazila || 'ঝালকাঠি সদর'}, {vol.district || 'ঝালকাঠি'}</div>
                                  <div className="text-[11px] text-emerald-600 font-bold">
                                    {vol.totalHours || 0} Service Hours Logged
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedVolunteerToAssign(vol);
                                    const matchingWing = wingsList.find(
                                      (w) =>
                                        vol.volunteerWing &&
                                        (w.nameBn.includes(vol.volunteerWing) ||
                                          w.nameEn.toLowerCase().includes(vol.volunteerWing.toLowerCase()))
                                    );
                                    setTargetWingId(matchingWing ? matchingWing._id : (wingsList[0]?._id || ''));
                                    setAssignModalOpen(true);
                                  }}
                                  className="px-3.5 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>উইং কো-অর্ডিনেটর নিযুক্ত করুন</span>
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

            {/* Volunteer Hub Tab Content */}
            {activeTab === 'volunteers' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Action Feedback Banner */}
                {volunteerActionFeedback.message && (
                  <div
                    className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200 ${
                      volunteerActionFeedback.type === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {volunteerActionFeedback.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="font-semibold">{volunteerActionFeedback.message}</span>
                    </div>
                    <button
                      onClick={() => setVolunteerActionFeedback({ type: '', message: '' })}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Volunteer Hub Hero Banner */}
                <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-amber-300 border border-white/10">
                        <HeartHandshake className="w-3.5 h-3.5 text-amber-300" />
                        <span>উইং ভলান্টিয়ার কর্পস ও ফিল্ড অ্যাক্টিভিস্ট ব্যবস্থাপনা</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Volunteer Hub & Grassroots Action Corps
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Manage active volunteers across all operational wings, track community service hours, and appoint registered general members into active field volunteers. Top volunteers can be promoted to lead as Wing Coordinators.
                      </p>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                      <button
                        onClick={fetchVolunteersData}
                        disabled={loadingVolunteers}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingVolunteers ? 'animate-spin' : ''}`} />
                        <span>Refresh Rosters</span>
                      </button>
                      <Link
                        href="/members"
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Member Directory</span>
                      </Link>
                      <button
                        onClick={() => handleTabSwitch('requests')}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Member Requests</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Volunteers</span>
                      <div className="text-2xl font-black text-[#F1AD1A]">{volunteers.length}</div>
                      <span className="text-[10px] text-amber-300/80">Active field corps</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Eligible Members Pool</span>
                      <div className="text-2xl font-black text-blue-400">{filteredMembersRoster.length}</div>
                      <span className="text-[10px] text-blue-300/80">Available for nomination</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Service Hours</span>
                      <div className="text-2xl font-black text-emerald-400">
                        {volunteers.reduce((sum, v) => sum + (Number(v.totalHours) || 0), 0)} hrs
                      </div>
                      <span className="text-[10px] text-emerald-300/80">Recorded community hours</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wing Distribution</span>
                      <div className="text-2xl font-black text-rose-400">
                        {wingsList.filter((w) =>
                          volunteers.some((v) =>
                            v.volunteerWing &&
                            (v.volunteerWing.includes(w.nameBn) ||
                              v.volunteerWing.toLowerCase().includes(w.nameEn.toLowerCase()))
                          )
                        ).length}{' '}
                        / {wingsList.length}
                      </div>
                      <span className="text-[10px] text-rose-300/80">Wings with volunteer team</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Active Volunteer Corps Management Directory */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">
                          সক্রিয় ভলান্টিয়ার তালিকা (Active Volunteer Corps Directory)
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {filteredVolunteerHubList.length} Active Volunteers
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage active volunteer profiles, reassign wings, promote to Wing Coordinator, or demote back to General Member.
                      </p>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={volunteerHubSearch}
                          onChange={(e) => setVolunteerHubSearch(e.target.value)}
                          placeholder="Search volunteers by name, mobile, wing..."
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500 transition-all"
                        />
                        {volunteerHubSearch && (
                          <button
                            onClick={() => setVolunteerHubSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={volunteerHubWingFilter}
                          onChange={(e) => setVolunteerHubWingFilter(e.target.value)}
                          className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:border-amber-500"
                        >
                          <option value="All">All Wings</option>
                          {wingsList.map((w) => (
                            <option key={w._id} value={w.nameEn}>
                              {w.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Volunteers Table */}
                  {filteredVolunteerHubList.length === 0 ? (
                    <div className="p-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl space-y-2 border border-dashed border-slate-200">
                      <HeartHandshake className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No volunteers match your search filter.</p>
                      <p className="text-slate-400">Try clearing the search query or selecting "All Wings".</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50">
                            <th className="py-3 px-4 rounded-l-xl">Volunteer Details</th>
                            <th className="py-3 px-4">Contact</th>
                            <th className="py-3 px-4">Active Wing / Interests</th>
                            <th className="py-3 px-4">Location & Hours</th>
                            <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredVolunteerHubList.map((vol) => (
                            <tr key={vol._id || vol.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#A6772A] font-black text-xs flex items-center justify-center shrink-0 border border-amber-200">
                                    {vol.name ? vol.name.charAt(0).toUpperCase() : 'V'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm">{vol.name}</div>
                                    <div className="text-[11px] font-mono text-slate-500">{vol.memberId || 'VOLUNTEER'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <div className="text-slate-700 font-mono text-[11px]">{vol.email}</div>
                                  <div className="text-slate-500 font-mono text-[11px]">{vol.phone || 'No phone'}</div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[10px] rounded-full">
                                    {vol.volunteerWing || 'সাধারণ উইং (General Corps)'}
                                  </span>
                                  {Array.isArray(vol.volunteerInterests) && vol.volunteerInterests.length > 0 && (
                                    <p className="text-[10px] text-slate-500 truncate max-w-xs">
                                      {vol.volunteerInterests.join(', ')}
                                    </p>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <div className="text-slate-700 font-semibold">{vol.upazila || 'ঝালকাঠি সদর'}, {vol.district || 'ঝালকাঠি'}</div>
                                  <div className="text-[11px] text-emerald-600 font-bold">
                                    {vol.totalHours || 0} Service Hours Logged
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Quick promote to coordinator */}
                                  <button
                                    onClick={() => {
                                      setSelectedVolunteerToAssign(vol);
                                      const matchingWing = wingsList.find(
                                        (w) =>
                                          vol.volunteerWing &&
                                          (w.nameBn.includes(vol.volunteerWing) ||
                                            w.nameEn.toLowerCase().includes(vol.volunteerWing.toLowerCase()))
                                      );
                                      setTargetWingId(matchingWing ? matchingWing._id : (wingsList[0]?._id || ''));
                                      setAssignModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-lg font-bold text-[11px] shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                                    title="Promote to Wing Coordinator"
                                  >
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>কো-অর্ডিনেটর পদোন্নতি</span>
                                  </button>

                                  {/* Change Wing */}
                                  <button
                                    onClick={() => {
                                      setSelectedVolToReassign(vol);
                                      const matchingWing = wingsList.find(
                                        (w) =>
                                          vol.volunteerWing &&
                                          (w.nameBn.includes(vol.volunteerWing) ||
                                            w.nameEn.toLowerCase().includes(vol.volunteerWing.toLowerCase()))
                                      );
                                      setTargetVolWingId(matchingWing ? matchingWing._id : (wingsList[0]?._id || ''));
                                      setReassignVolWingModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                    title="Reassign Wing"
                                  >
                                    উইং পরিবর্তন
                                  </button>

                                  {/* Demote to Member */}
                                  <button
                                    onClick={() => {
                                      setVolunteerToDemote(vol);
                                      setDemoteVolConfirmOpen(true);
                                    }}
                                    className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                    title="Demote to Member"
                                  >
                                    সদস্য পদ
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Section 3: Eligible General Members Pool */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">
                          ভলান্টিয়ার হিসেবে নিয়োগযোগ্য সাধারণ সদস্য তালিকা (Eligible General Members Pool)
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                          {filteredMembersRoster.length} General Members
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Appoint verified members into the active Volunteer Corps. Members will receive a role nomination notification on their dashboard to accept or decline.
                      </p>
                    </div>

                    {/* Member Search Bar */}
                    <div className="relative flex-1 sm:w-72">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={memberRosterSearch}
                        onChange={(e) => setMemberRosterSearch(e.target.value)}
                        placeholder="Search general members by name, ID, phone..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#B62A35] transition-all"
                      />
                      {memberRosterSearch && (
                        <button
                          onClick={() => setMemberRosterSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Members Table */}
                  {filteredMembersRoster.length === 0 ? (
                    <div className="p-10 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl space-y-2 border border-dashed border-slate-200">
                      <Users className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No eligible general members found.</p>
                      <p className="text-slate-400">All registered users are already active volunteers or coordinators, or no members match your search.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50">
                            <th className="py-3 px-4 rounded-l-xl">Member Profile</th>
                            <th className="py-3 px-4">Contact</th>
                            <th className="py-3 px-4">Location / Current Wing</th>
                            <th className="py-3 px-4">Registration Status</th>
                            <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredMembersRoster.slice(0, 15).map((mem) => (
                            <tr key={mem._id || mem.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200">
                                    {mem.name ? mem.name.charAt(0).toUpperCase() : 'M'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm">{mem.name}</div>
                                    <div className="text-[11px] font-mono text-slate-500">{mem.memberId || 'MEMBER'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <div className="text-slate-700 font-mono text-[11px]">{mem.email}</div>
                                  <div className="text-slate-500 font-mono text-[11px]">{mem.phone || 'No phone'}</div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <div className="text-slate-800 font-medium">
                                    {mem.upazila ? `${mem.upazila}, ${mem.district || 'ঝালকাঠি'}` : 'ঝালকাঠি'}
                                  </div>
                                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold text-[10px] rounded">
                                    {mem.volunteerWing || 'সাধারণ উইং'}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Verified Member
                                </span>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedMemberToNominate(mem);
                                    setTargetVolWingId(wingsList[0]?._id || '');
                                    setNominateVolModalOpen(true);
                                  }}
                                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>+ ভলান্টিয়ার হিসেবে নিয়োগ দিন</span>
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
          </div>
        )}

        {/* ========================================================= */}
        {/* COORDINATOR VIEW                                          */}
        {/* ========================================================= */}
        {user.role === 'coordinator' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Coordinator Hero Banner */}
            <div className="bg-linear-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-900/40">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-purple-300 border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                    <span>অফিসিয়াল উইং কো-অর্ডিনেটর কন্ট্রোল হাব</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {coordinatorWing?.nameEn || coordinatorWing?.name || 'Wing Coordinator Operations'}
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-200 font-medium">
                    {coordinatorWing?.nameBn} — {coordinatorWing?.description || 'Manage grassroots programs, volunteer drives, and community events for your assigned wing.'}
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                  <Link
                    href="/admin/events"
                    className="px-5 py-3 bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>Create Wing Event</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Coordinator Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">My Assigned Wing</span>
                  <div className="text-lg font-black text-white truncate">{coordinatorWing?.nameEn || 'Assigned Wing'}</div>
                  <span className="text-[10px] text-emerald-400">Verified Active Lead</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Wing Events</span>
                  <div className="text-2xl font-black text-white">{coordinatorWingEvents.length}</div>
                  <span className="text-[10px] text-slate-300">Scheduled drives</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Community Impact</span>
                  <div className="text-2xl font-black text-[#F1AD1A]">{impactStats.resolvedIssues || 0}</div>
                  <span className="text-[10px] text-amber-200">Issues Resolved</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Active Volunteers</span>
                  <div className="text-2xl font-black text-emerald-400">{impactStats.totalVolunteers || 0}</div>
                  <span className="text-[10px] text-emerald-200">Corps mobilized</span>
                </div>
              </div>
            </div>

            {/* Quick Operations Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/admin/events"
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#B62A35] hover:shadow-md transition-all group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#B62A35] flex items-center justify-center">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#B62A35] transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Events & Field Drives</h3>
                <p className="text-xs text-slate-500">Create new events, view RSVPs, and record volunteer attendance.</p>
              </Link>

              <Link
                href="/admin/programs"
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-500 hover:shadow-md transition-all group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Wing Programs</h3>
                <p className="text-xs text-slate-500">Coordinate long-term campaigns and operational initiatives.</p>
              </Link>

              <Link
                href="/admin/issues"
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#A6772A] flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Community Issues</h3>
                <p className="text-xs text-slate-500">Track civic reports and mobilize field resolutions.</p>
              </Link>
            </div>

            {/* Upcoming Events for This Wing */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    উইং-এর আসন্ন ইভেন্টসমূহ (Scheduled Drives & Events)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Community events scheduled under your wing. Click to create a new drive or manage attendance.
                  </p>
                </div>
                <Link
                  href="/admin/events"
                  className="px-4 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Event</span>
                </Link>
              </div>

              {coordinatorWingEvents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl space-y-3 border border-dashed border-slate-200">
                  <CalendarDays className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-semibold text-slate-700">No scheduled events found for this wing.</p>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    As Wing Coordinator, you can schedule and lead new community drives anytime.
                  </p>
                  <Link
                    href="/admin/events"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] text-white rounded-xl text-xs font-bold hover:bg-[#9E1F2A] transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create First Event Now</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coordinatorWingEvents.map((ev) => (
                    <div key={ev._id} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B62A35] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                          {ev.status || 'Scheduled'}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {ev.date ? new Date(ev.date).toLocaleDateString() : 'Upcoming'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{ev.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{ev.description || 'No description provided.'}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>Location: <strong className="text-slate-700">{ev.location}</strong></span>
                        <Link
                          href="/admin/events"
                          className="text-xs font-bold text-[#B62A35] hover:underline flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
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

            {/* Volunteer Tab Switcher */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveTab('hub')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'hub' ? 'bg-[#B62A35] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('vol-events')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'vol-events' ? 'bg-[#B62A35] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Ongoing Events</span>
                {upcomingEvents.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#F1AD1A] text-slate-950 font-black text-[10px] rounded-full">
                    {upcomingEvents.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('vol-log')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'vol-log' ? 'bg-[#B62A35] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Service Hours
              </button>
              <button
                onClick={() => setActiveTab('vol-requests')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'vol-requests' ? 'bg-[#B62A35] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Wing Transfer</span>
              </button>
            </div>

            {/* EVENT FEEDBACK BANNER */}
            {eventFeedback && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fadeIn ${
                eventFeedback.startsWith('✓')
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {eventFeedback.startsWith('✓')
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                <span>{eventFeedback}</span>
              </div>
            )}

            {/* Wing Change Card for Volunteers — shown on hub + vol-requests */}
            {(activeTab === 'hub' || activeTab === 'vol-requests') && (
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
            )}

            {/* ========================================================= */}
            {/* VOLUNTEER EVENTS TAB                                       */}
            {/* ========================================================= */}
            {activeTab === 'vol-events' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-900 via-[#1D3557] to-[#122338] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-[#F1AD1A]/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F1AD1A] text-slate-950 font-black text-[10px] uppercase tracking-wider">
                        Volunteer Opportunities
                      </span>
                      <span className="text-xs text-slate-300">Live from Database</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Ongoing & Upcoming <span className="text-[#F1AD1A]">Community Events</span>
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      Browse all active WCC community drives and register as a volunteer. Your participation will be recorded and counted toward your total service hours.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {Object.keys(eventRegistrations).length} Events Registered
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {upcomingEvents.length} Total Open Events
                      </span>
                    </div>
                  </div>
                </div>

                {/* Events Grid */}
                {upcomingEvents.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
                    <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                      <CalendarDays className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Active Events</h3>
                    <p className="text-xs text-slate-500">
                      There are no upcoming events right now. Check back soon — coordinators publish new community drives regularly.
                    </p>
                    <Link
                      href="/events"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl transition-all hover:bg-[#B62A35]"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      Browse Public Events
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {upcomingEvents.map((evt) => {
                      const isRegistered = Boolean(eventRegistrations[evt._id]);
                      const isRegistering = registeringEventId === evt._id;
                      const wingInfo = evt.wingId && typeof evt.wingId === 'object' ? evt.wingId : null;
                      const eventDate = evt.date ? new Date(evt.date) : null;
                      const isUpcoming = eventDate ? eventDate > new Date() : true;

                      return (
                        <div
                          key={evt._id}
                          className={`group bg-white rounded-3xl border overflow-hidden shadow-xs transition-all flex flex-col ${
                            isRegistered
                              ? 'border-emerald-300 ring-1 ring-emerald-200'
                              : 'border-slate-200 hover:shadow-md hover:border-slate-300'
                          }`}
                        >
                          {/* Cover Image */}
                          <div className="relative h-40 bg-slate-900 overflow-hidden shrink-0">
                            {evt.coverImage ? (
                              <img
                                src={evt.coverImage}
                                alt={evt.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-[#1D3557] flex items-center justify-center">
                                <CalendarDays className="w-10 h-10 text-white/30" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                            {/* Registered badge */}
                            {isRegistered && (
                              <div className="absolute top-3 right-3">
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-md">
                                  <Check className="w-3 h-3" />
                                  Registered
                                </span>
                              </div>
                            )}
                            {/* Wing badge */}
                            {wingInfo && (
                              <div className="absolute bottom-3 left-3">
                                <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold rounded-lg shadow-xs">
                                  {wingInfo.nameEn || 'Wing'}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Card Content */}
                          <div className="p-5 flex flex-col flex-1 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 uppercase">
                                Published
                              </span>
                              {eventDate && (
                                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#B62A35]" />
                                  {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 flex-1">
                              {evt.title}
                            </h3>

                            {evt.description && (
                              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                {evt.description}
                              </p>
                            )}

                            {evt.location && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{evt.location}</span>
                              </div>
                            )}

                            {/* Action Button */}
                            <div className="pt-2 border-t border-slate-100 mt-auto">
                              {isRegistered ? (
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    You are registered!
                                  </span>
                                  <Link
                                    href={`/events/${evt._id}`}
                                    className="text-[11px] text-[#B62A35] font-bold hover:underline flex items-center gap-1"
                                  >
                                    View Details
                                    <ArrowRight className="w-3 h-3" />
                                  </Link>
                                </div>
                              ) : (
                                <button
                                  onClick={async () => {
                                    setRegisteringEventId(evt._id);
                                    setEventFeedback('');
                                    try {
                                      await api.registerForEvent(evt._id);
                                      setEventRegistrations(prev => ({ ...prev, [evt._id]: { registered: true } }));
                                      setEventFeedback(`✓ Successfully registered for "${evt.title.slice(0, 40)}..."! Your volunteer participation has been recorded.`);
                                      setTimeout(() => setEventFeedback(''), 6000);
                                    } catch (err) {
                                      setEventFeedback(`Failed to register: ${err.message}`);
                                      setTimeout(() => setEventFeedback(''), 5000);
                                    } finally {
                                      setRegisteringEventId(null);
                                    }
                                  }}
                                  disabled={isRegistering}
                                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-[#B62A35] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
                                >
                                  {isRegistering ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Registering...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-3.5 h-3.5" />
                                      <span>Register as Volunteer</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Link to public events page */}
                <div className="text-center">
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View All Events on Public Page
                  </Link>
                </div>
              </div>
            )}

            {/* Service Hours Tab */}
            {activeTab === 'vol-log' && (
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
            )}

            {/* Hub / Overview tab: show activities */}
            {activeTab === 'hub' && (
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
            )}
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
                  {wingsList.map((wing) => {
                    const wingTitleBn = wing.nameBn || wing.nameEn;
                    const wingTitleEn = wing.nameEn || wing.slug;
                    const isCurrent = wingTitleBn === currentWingName || wing.slug === currentWingName;
                    const isSelected = wingTitleBn === selectedWing || wing.slug === selectedWing;

                    return (
                      <label
                        key={wing._id || wing.slug}
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
                          value={wingTitleBn}
                          checked={isSelected}
                          onChange={() => setSelectedWing(wingTitleBn)}
                          className="mt-1 text-[#B62A35] focus:ring-[#B62A35]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{wingTitleBn}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-semibold">
                                বর্তমান উইং
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{wingTitleEn}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{wing.description}</p>
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
                  {(wingsList.length > 0
                    ? wingsList.flatMap((w) =>
                        w.missionPoints && w.missionPoints.length > 0
                          ? w.missionPoints.map((mp) => `${mp} (${w.nameBn})`)
                          : [`${w.nameBn} কার্যক্রম`]
                      )
                    : DEFAULT_VOLUNTEER_AREAS
                  ).map((area, idx) => {
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

      {/* 1. Assign Coordinator Modal */}
      {assignModalOpen && selectedVolunteerToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#B62A35] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    উইং কো-অর্ডিনেটর হিসেবে নিয়োগ
                  </h3>
                  <p className="text-[11px] text-slate-500">Appoint Volunteer to Wing Leadership</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAssignModalOpen(false);
                  setSelectedVolunteerToAssign(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Volunteer Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate</span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border text-slate-600 font-bold">
                  {selectedVolunteerToAssign.memberId || 'VOLUNTEER'}
                </span>
              </div>
              <div className="font-black text-slate-900 text-sm">{selectedVolunteerToAssign.name}</div>
              <div className="text-xs text-slate-500 font-mono">{selectedVolunteerToAssign.email}</div>
              {selectedVolunteerToAssign.volunteerWing && (
                <div className="text-xs text-slate-600 pt-1 border-t border-slate-200">
                  Preferred Wing: <strong>{selectedVolunteerToAssign.volunteerWing}</strong>
                </div>
              )}
            </div>

            {/* Wing Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                দায়িত্বপ্রাপ্ত উইং নির্বাচন করুন (Select Target Wing) <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetWingId}
                onChange={(e) => setTargetWingId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#B62A35]"
              >
                <option value="">-- Choose a Wing --</option>
                {wingsList.map((w) => {
                  const existingCoord = coordinators.find((c) => {
                    const cWingId = c.assignedWing?._id || c.assignedWing;
                    return String(cWingId) === String(w._id);
                  });
                  return (
                    <option key={w._id} value={w._id}>
                      {w.nameEn} ({w.nameBn}) {existingCoord ? `[Currently: ${existingCoord.name}]` : '[Vacant]'}
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-slate-400">
                This user will be assigned as the official lead coordinator for this wing.
              </p>
            </div>

            {/* Capability Notice */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-1 text-xs text-emerald-900">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Granted Coordinator Capabilities:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-emerald-700 space-y-0.5 pt-1">
                <li>Create, edit, and publish official events for this wing at <strong>/admin/events</strong></li>
                <li>Take attendance for volunteers attending wing campaigns</li>
                <li>Access the dedicated Coordinator Operations Hub on login</li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAssignModalOpen(false);
                  setSelectedVolunteerToAssign(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={assigningCoordinator || !targetWingId}
                onClick={handleAssignCoordinator}
                className="flex-1 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {assigningCoordinator ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Invitation...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Appointment Invitation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Demote Coordinator Confirmation Modal */}
      {demoteConfirmOpen && coordinatorToDemote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Demote Wing Coordinator?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to demote <strong>{coordinatorToDemote.name}</strong> back to Volunteer Corps? They will lose access to wing event creation and coordinator tools.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setDemoteConfirmOpen(false);
                  setCoordinatorToDemote(null);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={demotingCoordinator}
                onClick={handleDemoteCoordinator}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {demotingCoordinator ? 'Demoting...' : 'Confirm Demote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Reassign Wing Modal */}
      {reassignModalOpen && selectedCoordinatorToReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Change Assigned Wing</h3>
              <button
                onClick={() => {
                  setReassignModalOpen(false);
                  setSelectedCoordinatorToReassign(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div>Coordinator: <strong>{selectedCoordinatorToReassign.name}</strong></div>
              <div className="text-slate-400 font-mono">{selectedCoordinatorToReassign.email}</div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Select New Wing</label>
              <select
                value={targetWingId}
                onChange={(e) => setTargetWingId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="">-- Choose New Wing --</option>
                {wingsList.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.nameEn} ({w.nameBn})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setReassignModalOpen(false);
                  setSelectedCoordinatorToReassign(null);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={assigningCoordinator || !targetWingId}
                onClick={handleReassignWing}
                className="flex-1 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {assigningCoordinator ? 'Saving...' : 'Update Wing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Nominate / Appoint Volunteer Modal */}
      {nominateVolModalOpen && selectedMemberToNominate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#A6772A] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    ভলান্টিয়ার হিসেবে নিয়োগ ও আমন্ত্রণ
                  </h3>
                  <p className="text-[11px] text-slate-500">Appoint Member to Volunteer Corps</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNominateVolModalOpen(false);
                  setSelectedMemberToNominate(null);
                  setVolInvitationNote('');
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Member Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Member</span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border text-slate-600 font-bold">
                  {selectedMemberToNominate.memberId || 'MEMBER'}
                </span>
              </div>
              <div className="font-black text-slate-900 text-sm">{selectedMemberToNominate.name}</div>
              <div className="text-xs text-slate-500 font-mono">{selectedMemberToNominate.email}</div>
              {selectedMemberToNominate.volunteerWing && (
                <div className="text-xs text-slate-600 pt-1 border-t border-slate-200">
                  Current Wing: <strong>{selectedMemberToNominate.volunteerWing}</strong>
                </div>
              )}
            </div>

            {/* Wing Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                দায়িত্বপ্রাপ্ত উইং নির্বাচন করুন (Select Target Wing) <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetVolWingId}
                onChange={(e) => setTargetVolWingId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="">-- Choose a Wing --</option>
                {wingsList.map((w) => {
                  const wingVolunteers = volunteers.filter(
                    (v) =>
                      v.volunteerWing &&
                      (v.volunteerWing.includes(w.nameBn) ||
                        v.volunteerWing.toLowerCase().includes(w.nameEn.toLowerCase()))
                  );
                  return (
                    <option key={w._id} value={w._id}>
                      {w.nameEn} ({w.nameBn}) [{wingVolunteers.length} Active Volunteers]
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-slate-400">
                The member will be invited to participate in community drives and campaigns for this wing.
              </p>
            </div>

            {/* Invitation Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                আমন্ত্রণ বার্তা (Optional Invitation Message / Note)
              </label>
              <textarea
                value={volInvitationNote}
                onChange={(e) => setVolInvitationNote(e.target.value)}
                placeholder="Add a personalized encouragement note or department details..."
                rows={2}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-amber-500 resize-none"
              />
            </div>

            {/* Capability Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1 text-xs text-amber-900">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Granted Volunteer Privileges:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-amber-800/90 space-y-0.5 pt-1">
                <li>Access to the Volunteer Corps Portal & Official Digital Badge</li>
                <li>Ability to log verified grassroots service hours</li>
                <li>Eligibility to be promoted to Wing Coordinator in the future</li>
                <li>Member must accept the appointment card on their dashboard</li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setNominateVolModalOpen(false);
                  setSelectedMemberToNominate(null);
                  setVolInvitationNote('');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingVolInvitation || !targetVolWingId}
                onClick={handleNominateVolunteer}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {sendingVolInvitation ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Invitation...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Volunteer Invitation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Demote Volunteer to Member Confirmation Modal */}
      {demoteVolConfirmOpen && volunteerToDemote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Demote to General Member?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to reassign <strong>{volunteerToDemote.name}</strong> back to General Member role? They will lose access to the volunteer service logger and active corps portal.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setDemoteVolConfirmOpen(false);
                  setVolunteerToDemote(null);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={demotingVolunteer}
                onClick={handleDemoteVolunteer}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {demotingVolunteer ? 'Demoting...' : 'Confirm Demote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Reassign Volunteer Wing Modal */}
      {reassignVolWingModalOpen && selectedVolToReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#A6772A] flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Change Volunteer Wing</h3>
                  <p className="text-[11px] text-slate-500">Reassign Volunteer to Another Department</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setReassignVolWingModalOpen(false);
                  setSelectedVolToReassign(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>Volunteer: <strong>{selectedVolToReassign.name}</strong></div>
              <div className="text-slate-400 font-mono">{selectedVolToReassign.email}</div>
              {selectedVolToReassign.volunteerWing && (
                <div className="text-slate-500 pt-1 border-t border-slate-200">
                  Current Wing: <strong className="text-slate-700">{selectedVolToReassign.volunteerWing}</strong>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Select New Wing</label>
              <select
                value={targetVolWingId}
                onChange={(e) => setTargetVolWingId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="">-- Choose New Wing --</option>
                {wingsList.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.nameEn} ({w.nameBn})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setReassignVolWingModalOpen(false);
                  setSelectedVolToReassign(null);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={reassigningVolWing || !targetVolWingId}
                onClick={handleReassignVolunteerWing}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {reassigningVolWing ? 'Saving...' : 'Update Wing'}
              </button>
            </div>
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
