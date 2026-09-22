'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';
import {
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  UserCheck,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  User,
  Phone,
  Calendar,
  X,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const STATUS_FLOW = [
  { key: 'pending', label: 'Pending Review', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-sky-50 text-sky-800 border-sky-200' },
  { key: 'resolved', label: 'Resolved', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
];

export default function AdminIssuesPage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [issues, setIssues] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'pending' | 'in_progress' | 'resolved'

  // Messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Modals
  const [selectedIssue, setSelectedIssue] = useState(null); // for view details
  const [statusModalIssue, setStatusModalIssue] = useState(null); // for status change
  const [newStatus, setNewStatus] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [assignModalIssue, setAssignModalIssue] = useState(null); // for assign modal
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // 1. Check Authentication & Permissions
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('wcc_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const isAuthorized = user && (user.role === 'admin' || user.role === 'coordinator');

  // 2. Fetch Issues & Coordinators
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      if (search.trim()) {
        params.search = search.trim();
      }
      // If coordinator, backend scopes automatically, or pass coordinator's assigned wing
      if (user?.role === 'coordinator' && user.assignedWing) {
        params.wingId = String(user.assignedWing?._id || user.assignedWing);
      }

      const res = await api.getIssues(params);
      const list = res.issues || res;
      setIssues(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
      setErrorMessage(err.message || 'Failed to fetch community issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinatorsList = async () => {
    try {
      const data = await api.getCoordinators();
      setCoordinators(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch coordinators:', err);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchIssues();
      fetchCoordinatorsList();
    }
  }, [authChecked, isAuthorized, statusFilter]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIssues();
  };

  // Copy tracking code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Status Change Modal
  const openStatusModal = (issue) => {
    setStatusModalIssue(issue);
    setNewStatus(issue.status);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Submit Status Change (AuditLog is handled automatically by backend)
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalIssue || !newStatus) return;

    if (newStatus === statusModalIssue.status) {
      setStatusModalIssue(null);
      return;
    }

    setStatusSubmitting(true);
    setErrorMessage('');
    try {
      const res = await api.updateIssueStatus(statusModalIssue._id, newStatus);
      setSuccessMessage(
        `Issue ${statusModalIssue.issueCode} status updated from '${statusModalIssue.status}' to '${newStatus}'`
      );
      setStatusModalIssue(null);
      fetchIssues();
    } catch (err) {
      console.error('Error updating issue status:', err);
      setErrorMessage(err.message || 'Failed to update issue status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Open Assign Modal
  const openAssignModal = (issue) => {
    setAssignModalIssue(issue);
    setSelectedAssignee(issue.assignedTo?._id || issue.assignedTo || '');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Submit Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModalIssue) return;

    setAssignSubmitting(true);
    setErrorMessage('');
    try {
      await api.assignIssue(assignModalIssue._id, {
        assignedTo: selectedAssignee || null
      });
      const assigneeObj = coordinators.find((c) => String(c._id) === String(selectedAssignee));
      setSuccessMessage(
        assigneeObj
          ? `Issue ${assignModalIssue.issueCode} assigned to ${assigneeObj.name} (${assigneeObj.role})`
          : `Issue ${assignModalIssue.issueCode} unassigned`
      );
      setAssignModalIssue(null);
      fetchIssues();
    } catch (err) {
      console.error('Error assigning issue:', err);
      setErrorMessage(err.message || 'Failed to assign issue');
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Filter available coordinators for the assignment dropdown based on role
  const eligibleAssignees = coordinators.filter((c) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'coordinator') {
      const myWing = String(user.assignedWing?._id || user.assignedWing || '');
      const cWing = String(c.assignedWing?._id || c.assignedWing || '');
      return !cWing || cWing === myWing;
    }
    return false;
  });

  // Stats calculation
  const totalCount = issues.length;
  const pendingCount = issues.filter((i) => i.status === 'pending').length;
  const inProgressCount = issues.filter((i) => i.status === 'in_progress').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;

  // Render Access Denied if unauthorized
  if (authChecked && !isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Community Issue Management is restricted to verified WCC Administrators and Wing Coordinators.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-block py-2.5 px-6 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header / Breadcrumb */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B62A35] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Civic Triage & Dispatch
                </span>
                {user?.role === 'coordinator' && (
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Coordinator Scoped
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <AlertTriangle className="w-7 h-7 text-[#B62A35]" />
                <span>Community Issues Management</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {user?.role === 'admin'
                  ? 'All public civic complaints and emergency issues reported across Jhalakathi district.'
                  : `Managing civic issues assigned or relevant to your wing.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchIssues}
                disabled={loading}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                title="Refresh list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <Link
                href="/report-issue"
                target="_blank"
                className="py-2.5 px-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Public Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Feedback Alerts */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-emerald-600 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-rose-600 hover:text-rose-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Tracked</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</div>
            <p className="text-[11px] text-slate-500">All registered issues</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Review</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">{pendingCount}</div>
            <p className="text-[11px] text-amber-700/80">Awaiting triage & assignment</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-200 bg-sky-50/20 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">In Progress</span>
            <div className="text-2xl sm:text-3xl font-black text-sky-600">{inProgressCount}</div>
            <p className="text-[11px] text-sky-700/80">Action team dispatched</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Resolved</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{resolvedCount}</div>
            <p className="text-[11px] text-emerald-700/80">Completed civic interventions</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'All', label: 'All Issues' },
              { id: 'pending', label: 'Pending' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code, title, reporter, area..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
              />
            </div>
            <button
              type="submit"
              className="py-2 px-4 bg-slate-900 hover:bg-[#B62A35] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
            >
              Search
            </button>
          </form>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-5">Issue Code</th>
                  <th className="py-4 px-5">Title</th>
                  <th className="py-4 px-5">Location</th>
                  <th className="py-4 px-5">Reporter</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Created Date</th>
                  <th className="py-4 px-5">Assigned To</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#B62A35]" />
                        <span className="text-xs font-semibold">Loading community issues...</span>
                      </div>
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-slate-300" />
                        <span className="text-sm font-bold text-slate-700">No community issues found</span>
                        <p className="text-xs text-slate-400">
                          {statusFilter !== 'All'
                            ? `No issues with status '${statusFilter}' match your query.`
                            : 'No community issues have been reported yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr
                      key={issue._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Issue Code */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                          <span>{issue.issueCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(issue.issueCode)}
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                            title="Copy issue code"
                          >
                            {copiedCode === issue.issueCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {issue.title}
                        </div>
                        {issue.photoUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-medium mt-0.5">
                            Photo attached
                          </span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 truncate">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{issue.location}</span>
                        </div>
                      </td>

                      {/* Reporter */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{issue.reporterName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{issue.reporterContact}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <StatusBadge status={issue.status} />
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-5 whitespace-nowrap text-slate-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {issue.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {(issue.assignedTo.name || 'U')[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-xs">
                                {issue.assignedTo.name}
                              </div>
                              <div className="text-[10px] text-slate-400 capitalize">
                                {issue.assignedTo.role}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Unassigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedIssue(issue)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Change Status */}
                          <button
                            type="button"
                            onClick={() => openStatusModal(issue)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Change Status"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          {/* Assign Coordinator / User */}
                          <button
                            type="button"
                            onClick={() => openAssignModal(issue)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Assign Personnel"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 1. VIEW DETAILS MODAL */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-slate-900">
                    {selectedIssue.issueCode}
                  </span>
                  <StatusBadge status={selectedIssue.status} />
                </div>
                <h3 className="text-xl font-black text-slate-900">{selectedIssue.title}</h3>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Location & Details */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Location / Area
                </span>
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium mt-0.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{selectedIssue.location}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Full Description
                </span>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mt-1">
                  {selectedIssue.description}
                </div>
              </div>

              {/* Attached Photo */}
              {selectedIssue.photoUrl && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Photo Evidence
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-72 flex items-center justify-center mt-1">
                    <img
                      src={selectedIssue.photoUrl}
                      alt="Evidence"
                      className="max-h-72 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Reporter Contact Info */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    Reporter Name
                  </span>
                  <p className="text-xs font-bold text-slate-900">{selectedIssue.reporterName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    Contact Phone / Email
                  </span>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-700" />
                    <span>{selectedIssue.reporterContact}</span>
                  </p>
                </div>
              </div>

              {/* Assignment & Timestamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-slate-500">
                <div>
                  <span className="font-semibold text-slate-700 block">Assigned Personnel:</span>
                  <span>{selectedIssue.assignedTo?.name ? `${selectedIssue.assignedTo.name} (${selectedIssue.assignedTo.role})` : 'Unassigned'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block">Reported On:</span>
                  <span>{new Date(selectedIssue.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions in View Modal */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const issue = selectedIssue;
                  setSelectedIssue(null);
                  openStatusModal(issue);
                }}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Change Status</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const issue = selectedIssue;
                  setSelectedIssue(null);
                  openAssignModal(issue);
                }}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-[#B62A35] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <UserCheck className="w-4 h-4" />
                <span>Assign Personnel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHANGE STATUS MODAL */}
      {statusModalIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Status Transition
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Update Issue Status
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {statusModalIssue.issueCode}
                </p>
              </div>
              <button
                onClick={() => setStatusModalIssue(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Flow Visualization */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Status Workflow Pipeline:</span>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                {STATUS_FLOW.map((s, idx) => (
                  <div key={s.key} className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        statusModalIssue.status === s.key
                          ? 'bg-slate-900 text-white ring-2 ring-slate-400'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {s.label}
                    </span>
                    {idx < STATUS_FLOW.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select New Status
                </label>
                <div className="space-y-2">
                  {STATUS_FLOW.map((s) => (
                    <label
                      key={s.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        newStatus === s.key
                          ? 'border-[#B62A35] bg-rose-50/40 text-slate-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="issueStatus"
                        value={s.key}
                        checked={newStatus === s.key}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="text-[#B62A35] focus:ring-[#B62A35]"
                      />
                      <div className="flex-1">
                        <span className="text-xs">{s.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                ℹ️ Status transitions are automatically audited by the backend system with your credentials.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalIssue(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusSubmitting}
                  className="flex-1 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  {statusSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Status</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ASSIGN PERSONNEL MODAL */}
      {assignModalIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  Staff Dispatch
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Assign Coordinator / User
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {assignModalIssue.issueCode}
                </p>
              </div>
              <button
                onClick={() => setAssignModalIssue(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assignee
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
                >
                  <option value="">-- Unassigned --</option>
                  {eligibleAssignees.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.role}) {c.assignedWing?.nameEn ? `• Wing: ${c.assignedWing.nameEn}` : ''}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400">
                  Select a coordinator or staff member responsible for inspecting and resolving this issue.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalIssue(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSubmitting}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-[#B62A35] disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  {assignSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Confirm Assignment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
