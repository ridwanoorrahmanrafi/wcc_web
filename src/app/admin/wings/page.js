'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  Search,
  Table as TableIcon,
  Grid,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldAlert,
  Image as ImageIcon,
  ListChecks,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminWingsPage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [wings, setWings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Feedback states
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingWing, setEditingWing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    nameEn: '',
    nameBn: '',
    slug: '',
    description: '',
    missionPoints: [],
    coverImage: ''
  });
  const [missionInput, setMissionInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [wingToDelete, setWingToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Check user role
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

  // 2. Fetch wings
  const fetchWings = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await api.getWings();
      setWings(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load wings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked || user?.role !== 'admin') return;
    const timer = setTimeout(() => {
      fetchWings();
    }, 0);
    return () => clearTimeout(timer);
  }, [authChecked, user]);

  // Flash message clear
  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingWing(null);
    setFormData({
      nameEn: '',
      nameBn: '',
      slug: '',
      description: '',
      missionPoints: [],
      coverImage: ''
    });
    setMissionInput('');
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (wing) => {
    setEditingWing(wing);
    setFormData({
      nameEn: wing.nameEn || '',
      nameBn: wing.nameBn || '',
      slug: wing.slug || '',
      description: wing.description || '',
      missionPoints: Array.isArray(wing.missionPoints) ? [...wing.missionPoints] : [],
      coverImage: wing.coverImage || ''
    });
    setMissionInput('');
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Auto-generate slug from nameEn if user hasn't typed custom slug
  const handleNameEnChange = (val) => {
    setFormData((prev) => {
      const next = { ...prev, nameEn: val };
      if (!editingWing && (!prev.slug || prev.slug === slugify(prev.nameEn))) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  const slugify = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Mission points tag management
  const handleAddMissionPoint = () => {
    const trimmed = missionInput.trim();
    if (trimmed && !formData.missionPoints.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        missionPoints: [...prev.missionPoints, trimmed]
      }));
      setMissionInput('');
    }
  };

  const handleRemoveMissionPoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      missionPoints: prev.missionPoints.filter((_, i) => i !== index)
    }));
  };

  // Form Validation & Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.nameEn.trim()) errors.nameEn = 'English name is required';
    if (!formData.nameBn.trim()) errors.nameBn = 'Bangla name is required';
    if (!formData.slug.trim()) errors.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      errors.slug = 'Slug may only contain lowercase letters, numbers, and hyphens';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const payload = {
        nameEn: formData.nameEn.trim(),
        nameBn: formData.nameBn.trim(),
        slug: formData.slug.trim().toLowerCase(),
        description: formData.description.trim(),
        missionPoints: formData.missionPoints,
        coverImage: formData.coverImage.trim()
      };

      if (editingWing) {
        await api.updateWing(editingWing._id, payload);
        flashSuccess(`Wing "${payload.nameEn}" updated successfully!`);
      } else {
        await api.createWing(payload);
        flashSuccess(`Wing "${payload.nameEn}" created successfully!`);
      }

      setFormModalOpen(false);
      fetchWings();
    } catch (err) {
      setFormErrors({ submit: err.message || 'Failed to save wing.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!wingToDelete) return;
    setDeleting(true);
    try {
      await api.deleteWing(wingToDelete._id);
      flashSuccess(`Wing "${wingToDelete.nameEn}" removed.`);
      setDeleteModalOpen(false);
      setWingToDelete(null);
      fetchWings();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete wing.');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered list
  const filteredWings = wings.filter((w) => {
    const q = search.toLowerCase();
    return (
      (w.nameEn && w.nameEn.toLowerCase().includes(q)) ||
      (w.nameBn && w.nameBn.includes(q)) ||
      (w.slug && w.slug.toLowerCase().includes(q)) ||
      (w.description && w.description.toLowerCase().includes(q))
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

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-[#B62A35] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Access Required</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The Wing Management suite is restricted to system administrators with elevated oversight privileges.
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
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-[#B62A35] rounded-xl border border-rose-100 shadow-xs">
              <Sparkles className="w-5 h-5 text-[#B62A35]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Wings Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure organizational pillars, bilingual titles, key mission goals, and public portal routing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchWings}
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
            <span>New Wing</span>
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

      {/* Search & Layout Toggle Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wings by name or slug..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#B62A35] transition-all"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <span className="text-xs font-bold text-slate-500">
            Total: <span className="text-slate-900">{filteredWings.length}</span> Wings
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

      {/* Content Rendering */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Loading Wings...</p>
        </div>
      ) : filteredWings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Wings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? 'No wings matched your search criteria.' : 'Create the first operational wing to begin organizing community initiatives.'}
          </p>
          {!search && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#9E1F2A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Wing</span>
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
                  <th className="py-3.5 px-4">Wing</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Mission Goals</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWings.map((wing) => (
                  <tr key={wing._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {wing.coverImage ? (
                          <img
                            src={wing.coverImage}
                            alt={wing.nameEn}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{wing.nameEn}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{wing.nameBn}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {wing.slug}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                        {wing.description || <span className="text-slate-400 italic">No description provided</span>}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {Array.isArray(wing.missionPoints) && wing.missionPoints.length > 0 ? (
                          wing.missionPoints.map((point, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold px-2 py-0.5 bg-rose-50 text-[#B62A35] rounded-md border border-rose-100"
                            >
                              {point}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">None</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(wing)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Wing"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setWingToDelete(wing); setDeleteModalOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Wing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWings.map((wing) => (
            <div
              key={wing._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Card Cover */}
              <div className="h-36 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden flex items-center justify-center">
                {wing.coverImage ? (
                  <img
                    src={wing.coverImage}
                    alt={wing.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="text-white/30 flex flex-col items-center gap-1">
                    <Sparkles className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">WCC Wing</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-black/60 text-white rounded-md backdrop-blur-xs font-bold border border-white/10">
                    {wing.slug}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-black text-slate-900 text-base">{wing.nameEn}</h3>
                    <span className="text-xs font-bold text-[#B62A35] shrink-0">{wing.nameBn}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {wing.description || 'No description provided for this wing.'}
                  </p>
                </div>

                {/* Mission Points */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5 text-[#B62A35]" />
                    <span>Mission Goals ({wing.missionPoints?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(wing.missionPoints) && wing.missionPoints.length > 0 ? (
                      wing.missionPoints.map((point, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md"
                        >
                          {point}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">No mission points added</span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(wing)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => { setWingToDelete(wing); setDeleteModalOpen(true); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-[#B62A35] rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingWing ? 'Edit Wing' : 'Create New Wing'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    English Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => handleNameEnChange(e.target.value)}
                    placeholder="e.g. Education Wing"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden transition-all ${
                      formErrors.nameEn ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                    }`}
                  />
                  {formErrors.nameEn && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.nameEn}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bangla Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder="যেমন: শিক্ষা উইং"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden transition-all ${
                      formErrors.nameBn ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                    }`}
                  />
                  {formErrors.nameBn && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.nameBn}</p>}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                    placeholder="e.g. education"
                    className={`w-full p-2.5 font-mono bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden transition-all ${
                      formErrors.slug ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Unique path identifier (e.g. /api/wings/{formData.slug || 'slug'})</p>
                {formErrors.slug && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.slug}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize the core vision and civic purpose of this wing..."
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

              {/* Mission Points Manager */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Mission Points</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={missionInput}
                    onChange={(e) => setMissionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMissionPoint();
                      }
                    }}
                    placeholder="Type a mission goal and press Enter..."
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddMissionPoint}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formData.missionPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 max-h-28 overflow-y-auto">
                    {formData.missionPoints.map((point, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-slate-800 font-semibold rounded-lg border border-slate-200 shadow-2xs text-[11px]"
                      >
                        <span>{point}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMissionPoint(index)}
                          className="text-slate-400 hover:text-rose-600 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                  <span>{editingWing ? 'Update Wing' : 'Save Wing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && wingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">Delete Wing</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong className="text-slate-800">{wingToDelete.nameEn}</strong>? This action cannot be undone.
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
