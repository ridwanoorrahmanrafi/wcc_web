'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Search,
  Table as TableIcon,
  Grid,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldAlert,
  Image as ImageIcon,
  Clock,
  Layers,
  RefreshCw,
  Tag
} from 'lucide-react';
import { api } from '@/lib/api';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  published: { label: 'Published', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  completed: { label: 'Completed', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-50 text-rose-800 border-rose-200' }
};

export default function AdminProgramsPage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [programs, setPrograms] = useState([]);
  const [wings, setWings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedWingFilter, setSelectedWingFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const isAuthorized = user && (user.role === 'admin' || user.role === 'coordinator');
  const isCoordinator = user?.role === 'coordinator';
  const coordinatorWingId = user?.assignedWing?._id || user?.assignedWing || '';

  const canManageProgram = (prog) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'coordinator') {
      const progWingId = String(prog.wingId?._id || prog.wingId || '');
      return progWingId === String(coordinatorWingId);
    }
    return false;
  };

  // Feedback states
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    wingId: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    coverImage: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Check user session
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('wcc_user') : null;
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to parse user session:', e);
      } finally {
        setAuthChecked(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 2. Fetch Wings & Programs
  const fetchWings = async () => {
    try {
      const data = await api.getWings();
      setWings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load wings:', err);
    }
  };

  const fetchPrograms = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = {};
      if (isCoordinator && coordinatorWingId) {
        params.wingId = coordinatorWingId;
      } else if (selectedWingFilter !== 'All') {
        params.wingId = selectedWingFilter;
      }
      if (selectedStatusFilter !== 'All') params.status = selectedStatusFilter;

      const data = await api.getPrograms(params);
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load programs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked || !isAuthorized) return;
    const timer = setTimeout(() => {
      fetchWings();
    }, 0);
    return () => clearTimeout(timer);
  }, [authChecked, isAuthorized]);

  useEffect(() => {
    if (!authChecked || !isAuthorized) return;
    const timer = setTimeout(() => {
      fetchPrograms();
    }, 0);
    return () => clearTimeout(timer);
  }, [authChecked, isAuthorized, selectedWingFilter, selectedStatusFilter]);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Open Create
  const handleOpenCreate = () => {
    setEditingProgram(null);
    setFormData({
      title: '',
      wingId: isCoordinator && coordinatorWingId ? coordinatorWingId : (wings[0]?._id || ''),
      description: '',
      startDate: '',
      endDate: '',
      status: 'draft',
      coverImage: ''
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (prog) => {
    setEditingProgram(prog);
    const resolvedWingId = prog.wingId?._id || prog.wingId || '';

    setFormData({
      title: prog.title || '',
      wingId: resolvedWingId,
      description: prog.description || '',
      startDate: prog.startDate ? new Date(prog.startDate).toISOString().split('T')[0] : '',
      endDate: prog.endDate ? new Date(prog.endDate).toISOString().split('T')[0] : '',
      status: prog.status || 'draft',
      coverImage: prog.coverImage || ''
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Form Validation & Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.wingId) errors.wingId = 'Wing selection is required';

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errors.endDate = 'End date cannot be earlier than start date';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const payload = {
        title: formData.title.trim(),
        wingId: formData.wingId,
        description: formData.description.trim(),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        status: formData.status,
        coverImage: formData.coverImage.trim()
      };

      if (editingProgram) {
        await api.updateProgram(editingProgram._id, payload);
        flashSuccess(`Program "${payload.title}" updated successfully!`);
      } else {
        await api.createProgram(payload);
        flashSuccess(`Program "${payload.title}" created successfully!`);
      }

      setFormModalOpen(false);
      fetchPrograms();
    } catch (err) {
      setFormErrors({ submit: err.message || 'Failed to save program.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!programToDelete) return;
    setDeleting(true);
    try {
      await api.deleteProgram(programToDelete._id);
      flashSuccess(`Program "${programToDelete.title}" removed.`);
      setDeleteModalOpen(false);
      setProgramToDelete(null);
      fetchPrograms();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete program.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper date formatter
  const formatDate = (val) => {
    if (!val) return 'TBD';
    return new Date(val).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Client-side text search filter
  const filteredPrograms = programs.filter((p) => {
    const q = search.toLowerCase();
    const wingName = p.wingId?.nameEn?.toLowerCase() || '';
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      wingName.includes(q)
    );
  });

  // Access Control Guard
  if (!authChecked) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-[#B62A35] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Required</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Program Management is restricted to system administrators and authorized wing coordinators.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-[#B62A35] rounded-xl border border-rose-100 shadow-xs">
              <Calendar className="w-5 h-5 text-[#B62A35]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Programs Hub
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage campaigns, institutional drives, project roadmaps, and their parent wing alignments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPrograms}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#B62A35]' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Program</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search programs by title or wing..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#B62A35] transition-all"
            />
          </div>

          {/* Dynamic Wing Filter */}
          <div className="w-full sm:w-52">
            <select
              value={isCoordinator ? coordinatorWingId : selectedWingFilter}
              onChange={(e) => setSelectedWingFilter(e.target.value)}
              disabled={isCoordinator}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:border-[#B62A35] disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {!isCoordinator && <option value="All">All Wings</option>}
              {wings
                .filter((w) => !isCoordinator || String(w._id) === String(coordinatorWingId))
                .map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.nameEn}
                  </option>
                ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-40">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:border-[#B62A35]"
            >
              <option value="All">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between w-full lg:w-auto gap-3">
          <span className="text-xs font-bold text-slate-500">
            Total: <span className="text-slate-900">{filteredPrograms.length}</span> Programs
          </span>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#B62A35] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                viewMode === 'cards' ? 'bg-white text-[#B62A35] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Program Listing */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Loading Programs...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Programs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || selectedWingFilter !== 'All' || selectedStatusFilter !== 'All'
              ? 'No programs match the selected filters.'
              : 'Launch your first organized community program under a designated Wing.'}
          </p>
          {!search && selectedWingFilter === 'All' && selectedStatusFilter === 'All' && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#9E1F2A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Program</span>
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table Layout */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="py-3.5 px-4">Program</th>
                  <th className="py-3.5 px-4">Wing</th>
                  <th className="py-3.5 px-4">Timeline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrograms.map((prog) => {
                  const statusInfo = STATUS_CONFIG[prog.status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={prog._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {prog.coverImage ? (
                            <img
                              src={prog.coverImage}
                              alt={prog.title}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">{prog.title}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                              {prog.description || <span className="italic text-slate-400">No description</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold text-[11px] border border-slate-200">
                          <Layers className="w-3.5 h-3.5 text-[#B62A35]" />
                          <span>{prog.wingId?.nameEn || 'General Wing'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatDate(prog.startDate)} — {formatDate(prog.endDate)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {canManageProgram(prog) ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(prog)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Program"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setProgramToDelete(prog); setDeleteModalOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Program"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">View only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrograms.map((prog) => {
            const statusInfo = STATUS_CONFIG[prog.status] || STATUS_CONFIG.draft;
            return (
              <div
                key={prog._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Cover Image */}
                <div className="h-36 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden flex items-center justify-center">
                  {prog.coverImage ? (
                    <img
                      src={prog.coverImage}
                      alt={prog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="text-white/30 flex flex-col items-center gap-1">
                      <Calendar className="w-8 h-8" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Program</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border backdrop-blur-xs ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-black/60 text-white rounded-md backdrop-blur-xs border border-white/10">
                      {prog.wingId?.nameEn || 'Wing'}
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-base leading-snug">{prog.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {prog.description || 'No description provided for this program.'}
                    </p>
                  </div>

                  {/* Dates Bar */}
                  <div className="space-y-1 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Timeline:</span>
                      <span className="font-semibold text-slate-800">{formatDate(prog.startDate)} — {formatDate(prog.endDate)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {canManageProgram(prog) ? (
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEdit(prog)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => { setProgramToDelete(prog); setDeleteModalOpen(true); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 italic">View only</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-[#B62A35] rounded-xl">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingProgram ? 'Edit Program' : 'Create New Program'}
                </h3>
              </div>
              <button
                onClick={() => setFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.submit && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formErrors.submit}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Program Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Rural Digital Education Campaign 2026"
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden transition-all ${
                    formErrors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                  }`}
                />
                {formErrors.title && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Associated Wing <span className="text-rose-500">*</span>
                  </label>
                  {isCoordinator ? (
                    <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold">
                      {wings.find((w) => String(w._id) === String(coordinatorWingId))?.nameEn || 'Your Assigned Wing'}
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.wingId}
                      onChange={(e) => setFormData({ ...formData, wingId: e.target.value })}
                      className={`w-full p-2.5 bg-slate-50 border rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-hidden transition-all ${
                        formErrors.wingId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                      }`}
                    >
                      <option value="">Select a Wing...</option>
                      {wings.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.nameEn} ({w.nameBn})
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.wingId && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.wingId}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
                  >
                    <option value="draft">Draft (Planning)</option>
                    <option value="published">Published (Active)</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden transition-all text-slate-800 ${
                      formErrors.endDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                    }`}
                  />
                  {formErrors.endDate && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.endDate}</p>}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline program objectives, intended impact, and key targets..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingProgram ? 'Update Program' : 'Save Program'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && programToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">Delete Program</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong className="text-slate-800">{programToDelete.title}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {deleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
