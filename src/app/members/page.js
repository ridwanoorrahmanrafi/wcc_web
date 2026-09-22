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
  ShieldCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';

export default function MembersPage() {
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

  const wings = [
    'All',
    'শিক্ষা উইং',
    'স্বাস্থ্য উইং',
    'সমাজকল্যাণ উইং',
    'পরিবেশ উইং',
    'আইসিটি উইং',
    'সংস্কৃতি উইং',
    'অর্থ ও পরিকল্পনা উইং'
  ];

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
                      <Link
                        href={`/members/${member.memberId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-[#B62A35] hover:text-white text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Link>
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
                <Link
                  href={`/members/${member.memberId}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#B62A35] hover:underline"
                >
                  <span>Profile & ID Card</span>
                  <Eye className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
