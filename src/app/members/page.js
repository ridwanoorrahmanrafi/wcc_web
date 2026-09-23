'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Table as TableIcon,
  Grid,
  Phone,
  Mail,
  MapPin,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';

export default function MembersPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [wingFilter, setWingFilter] = useState('All');
  const [bloodFilter, setBloodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const [wings, setWings] = useState(['All']);
  const [fullWings, setFullWings] = useState([]);

  // Appoint Role State
  const [appointModalOpen, setAppointModalOpen] = useState(false);
  const [selectedMemberForAppoint, setSelectedMemberForAppoint] = useState(null);
  const [appointRole, setAppointRole] = useState('volunteer');
  const [appointWing, setAppointWing] = useState('');
  const [appointNote, setAppointNote] = useState('');
  const [appointing, setAppointing] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wcc_user');
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    async function loadWings() {
      try {
        const data = await api.getWings();
        if (Array.isArray(data) && data.length > 0) {
          setFullWings(data);
          setWings(['All', ...data.map(w => w.nameBn)]);
        }
      } catch (err) {
        console.error('Failed to load wings for filter:', err);
      }
    }
    loadWings();
  }, []);

  const handleOpenAppointModal = (member) => {
    setSelectedMemberForAppoint(member);
    setAppointRole('volunteer');
    setAppointWing(fullWings[0]?.nameBn || member.wing || 'সাধারণ উইং');
    setAppointNote('');
    setAppointModalOpen(true);
  };

  const handleSubmitAppoint = async (e) => {
    e.preventDefault();
    if (!selectedMemberForAppoint) return;
    setAppointing(true);
    setFeedback({ type: '', message: '' });
    try {
      const targetWingObj = fullWings.find(
        w => w.nameBn === appointWing || w.nameEn === appointWing || w.slug === appointWing
      );
      await api.sendRoleInvitation({
        recipientMemberId: selectedMemberForAppoint.memberId,
        recipientEmail: selectedMemberForAppoint.email,
        recipientName: selectedMemberForAppoint.nameEn || selectedMemberForAppoint.nameBn,
        targetRole: appointRole,
        targetWing: targetWingObj ? `${targetWingObj.nameBn} (${targetWingObj.nameEn})` : appointWing,
        targetWingId: targetWingObj ? targetWingObj._id : '',
        note: appointNote
      });
      setFeedback({
        type: 'success',
        message: `Role invitation sent to ${selectedMemberForAppoint.nameEn}! A notification has been placed on their dashboard to accept or decline.`
      });
      setAppointModalOpen(false);
      setSelectedMemberForAppoint(null);
      setTimeout(() => setFeedback({ type: '', message: '' }), 6000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to send role invitation.'
      });
    } finally {
      setAppointing(false);
    }
  };

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.getMembers({
        search,
        wing: wingFilter,
        blood: bloodFilter,
        status: statusFilter,
        page,
        limit
      });
      setMembers(res.members || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, wingFilter, bloodFilter, statusFilter, page, limit]);

  const handleExportCSV = () => {
    if (!members.length) return;
    const headers = [
      'Member ID',
      'Name (EN)',
      'Name (BN)',
      'Mobile',
      'Email',
      'Blood Group',
      'Wing',
      'Profession',
      'District',
      'Upazila',
      'Status'
    ];

    const rows = members.map((m) => [
      `"${m.memberId || ''}"`,
      `"${m.nameEn || ''}"`,
      `"${m.nameBn || ''}"`,
      `"${m.mobile || ''}"`,
      `"${m.email || ''}"`,
      `"${m.blood || ''}"`,
      `"${m.wing || ''}"`,
      `"${m.profession || ''}"`,
      `"${m.district || ''}"`,
      `"${m.upazila || ''}"`,
      `"${m.status || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WCC_Members_Directory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Member Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B62A35]/10 text-[#B62A35]">
              {total} Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central registry of verified We Can Change members across all wings and upazilas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/members/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Name (BN/EN), Member ID, Mobile, or Profession..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#B62A35]"
            />
          </div>

          {/* Wing filter */}
          <div className="sm:col-span-2">
            <select
              value={wingFilter}
              onChange={(e) => {
                setWingFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-2.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-[#B62A35]"
            >
              {wings.map((w) => (
                <option key={w} value={w}>
                  {w === 'All' ? 'All Wings' : w}
                </option>
              ))}
            </select>
          </div>

          {/* Blood group filter */}
          <div className="sm:col-span-2">
            <select
              value={bloodFilter}
              onChange={(e) => {
                setBloodFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-2.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-[#B62A35]"
            >
              {bloodGroups.map((b) => (
                <option key={b} value={b}>
                  {b === 'All' ? 'All Blood Groups' : `Blood: ${b}`}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-2.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-[#B62A35]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* View mode toggle & clear filters */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{members.length}</span> of{' '}
            <span className="font-bold text-slate-800">{total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white shadow-xs text-[#B62A35]' : 'text-slate-500'}`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md ${viewMode === 'cards' ? 'bg-white shadow-xs text-[#B62A35]' : 'text-slate-500'}`}
                title="Card View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading members...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-700">No members found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria, wing, or status filter.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Data Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Member Info</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Blood</th>
                  <th className="py-3 px-4">Wing</th>
                  <th className="py-3 px-4">Profession</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr key={member.memberId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          <img
                            src={member.photoUrl || '/default-avatar.svg'}
                            alt={member.nameEn}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/default-avatar.svg';
                            }}
                          />
                        </div>
                        <div>
                          <Link
                            href={`/members/${member.memberId}`}
                            className="font-bold text-slate-900 hover:text-[#B62A35] transition-colors"
                          >
                            {member.nameEn}
                          </Link>
                          <div className="text-[11px] text-slate-500">{member.nameBn}</div>
                          <span className="font-mono text-[10px] text-slate-400 font-semibold">
                            {member.memberId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 space-y-0.5">
                      <div className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{member.mobile}</span>
                      </div>
                      {member.email && (
                        <div className="flex items-center gap-1 text-slate-500 truncate max-w-[140px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded font-black text-[11px] bg-rose-50 text-rose-700 border border-rose-200">
                        {member.blood || 'N/A'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {member.wing || 'সাধারণ উইং'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{member.profession || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{member.workplace || ''}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{member.upazila || 'ঝালকাঠি সদর'}</div>
                      <div className="text-[10px] text-slate-400">{member.district || 'ঝালকাঠি'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={member.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => handleOpenAppointModal(member)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 border border-amber-200 font-bold text-[11px] transition-colors shadow-xs"
                            title="Appoint as Volunteer or Wing Coordinator"
                          >
                            <ShieldCheck className="w-3 h-3 text-amber-600 group-hover:text-white" />
                            <span>Appoint</span>
                          </button>
                        )}
                        <Link
                          href={`/members/${member.memberId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-[#B62A35] hover:text-white text-slate-700 font-semibold text-[11px] transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Touch Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.memberId}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <img
                      src={member.photoUrl || '/default-avatar.svg'}
                      alt={member.nameEn}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-avatar.svg';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {member.nameEn}
                    </h3>
                    <p className="text-xs text-slate-500">{member.nameBn}</p>
                    <span className="font-mono text-[10px] text-slate-400 font-semibold">
                      {member.memberId}
                    </span>
                  </div>
                </div>
                <StatusBadge status={member.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Blood Group</span>
                  <span className="font-bold text-rose-600">{member.blood || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Wing</span>
                  <span className="font-semibold text-slate-700 truncate block">{member.wing}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Profession</span>
                  <span className="font-semibold text-slate-700 truncate block">{member.profession}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Upazila</span>
                  <span className="font-semibold text-slate-700 truncate block">{member.upazila}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] font-mono text-slate-500">
                  {member.mobile}
                </div>
                <div className="flex items-center gap-2">
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => handleOpenAppointModal(member)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-800 border border-amber-200 font-bold text-[11px] transition-colors shadow-xs"
                      title="Appoint as Volunteer or Wing Coordinator"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>Appoint</span>
                    </button>
                  )}
                  <Link
                    href={`/members/${member.memberId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#B62A35] hover:underline"
                  >
                    <span>Profile & ID Card</span>
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appoint Member Modal */}
      {appointModalOpen && selectedMemberForAppoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                  Admin Action
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Appoint Member Role</h3>
                <p className="text-xs text-slate-500">
                  Send a formal role appointment to this member. A notification will appear on their dashboard to accept or decline.
                </p>
              </div>
              <button
                onClick={() => setAppointModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Summary Card */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0">
                <img
                  src={selectedMemberForAppoint.photoUrl || '/default-avatar.svg'}
                  alt={selectedMemberForAppoint.nameEn}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.svg';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-900 truncate">
                  {selectedMemberForAppoint.nameEn} ({selectedMemberForAppoint.nameBn})
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="font-mono font-semibold">{selectedMemberForAppoint.memberId}</span>
                  <span>•</span>
                  <span>{selectedMemberForAppoint.email || selectedMemberForAppoint.mobile}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitAppoint} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Target Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAppointRole('volunteer')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      appointRole === 'volunteer'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs text-slate-900">Volunteer Corps</span>
                      {appointRole === 'volunteer' && <CheckCircle className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Field volunteer with service hour logging and event participation rights.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppointRole('coordinator')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      appointRole === 'coordinator'
                        ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs text-slate-900">Wing Coordinator</span>
                      {appointRole === 'coordinator' && <CheckCircle className="w-4 h-4 text-purple-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Organizational lead authorized to create events and coordinate volunteers for a wing.
                    </p>
                  </button>
                </div>
              </div>

              {/* Target Wing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Wing
                </label>
                <select
                  value={appointWing}
                  onChange={(e) => setAppointWing(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B62A35] bg-white text-slate-800"
                  required
                >
                  {fullWings.map((w) => (
                    <option key={w._id || w.slug} value={w.nameBn}>
                      {w.nameBn} ({w.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Personal Invitation Message (Optional)
                </label>
                <textarea
                  value={appointNote}
                  onChange={(e) => setAppointNote(e.target.value)}
                  placeholder="e.g. We would love to have you lead our health initiatives given your expertise..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B62A35]"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAppointModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appointing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{appointing ? 'Sending Invitation...' : 'Send Role Invitation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
