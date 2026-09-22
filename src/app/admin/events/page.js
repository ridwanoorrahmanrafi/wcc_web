'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
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
  MapPin,
  Users,
  RefreshCw,
  Calendar,
  ClipboardCheck,
  Check
} from 'lucide-react';
import { api } from '@/lib/api';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  published: { label: 'Published', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  completed: { label: 'Completed', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-50 text-rose-800 border-rose-200' }
};

export default function AdminEventsPage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [events, setEvents] = useState([]);
  const [wings, setWings] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedWingFilter, setSelectedWingFilter] = useState('All');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const isAuthorized = user && (user.role === 'admin' || user.role === 'coordinator');
  const isCoordinator = user?.role === 'coordinator';
  const coordinatorWingId = user?.assignedWing?._id || user?.assignedWing || '';

  const canManageEvent = (evt) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'coordinator') {
      const evtWingId = String(evt.wingId?._id || evt.wingId || '');
      return evtWingId === String(coordinatorWingId);
    }
    return false;
  };

  // Feedback states
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    wingId: '',
    programId: '',
    date: '',
    location: '',
    capacity: '',
    description: '',
    coverImage: '',
    status: 'draft'
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Attendance modal
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceEvent, setAttendanceEvent] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);

  const handleOpenAttendance = async (evt) => {
    setAttendanceEvent(evt);
    setAttendanceModalOpen(true);
    setAttendanceLoading(true);
    try {
      const res = await api.getEventRegistrations(evt._id);
      setAttendanceList(res.registrations || []);
    } catch (err) {
      console.error('Failed to load event registrations:', err);
      setErrorMessage(err.message || 'Failed to load event registrations');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleToggleAttendance = (regId) => {
    setAttendanceList((prev) =>
      prev.map((item) =>
        item._id === regId ? { ...item, attended: !item.attended } : item
      )
    );
  };

  const handleMarkAll = (attended) => {
    setAttendanceList((prev) =>
      prev.map((item) => ({ ...item, attended }))
    );
  };

  const handleSaveAttendance = async () => {
    if (!attendanceEvent) return;
    setAttendanceSaving(true);
    try {
      const payload = attendanceList.map((a) => ({
        registrationId: a._id,
        userId: a.userId?._id || a.userId,
        attended: Boolean(a.attended)
      }));
      await api.updateEventAttendance(attendanceEvent._id, payload);
      const attendedCount = payload.filter((p) => p.attended).length;
      setSuccessMessage(
        `Attendance saved for "${attendanceEvent.title}" (${attendedCount} of ${payload.length} attended)`
      );
      setAttendanceModalOpen(false);
    } catch (err) {
      console.error('Failed to save attendance:', err);
      setErrorMessage(err.message || 'Failed to save attendance');
    } finally {
      setAttendanceSaving(false);
    }
  };

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
  const fetchMetadata = async () => {
    try {
      const [wingsData, progsData] = await Promise.all([
        api.getWings().catch(() => []),
        api.getPrograms().catch(() => [])
      ]);
      setWings(Array.isArray(wingsData) ? wingsData : []);
      setPrograms(Array.isArray(progsData) ? progsData : []);
    } catch (err) {
      console.error('Failed to load wings or programs metadata:', err);
    }
  };

  // 3. Fetch Events
  // 3. Fetch Events
  const fetchEvents = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = {};
      if (isCoordinator && coordinatorWingId) {
        params.wingId = coordinatorWingId;
      } else if (selectedWingFilter !== 'All') {
        params.wingId = selectedWingFilter;
      }
      if (selectedProgramFilter !== 'All') params.programId = selectedProgramFilter;
      if (selectedStatusFilter !== 'All') params.status = selectedStatusFilter;

      const data = await api.getEvents(params);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked || !isAuthorized) return;
    const timer = setTimeout(() => {
      fetchMetadata();
    }, 0);
    return () => clearTimeout(timer);
  }, [authChecked, isAuthorized]);

  useEffect(() => {
    if (!authChecked || !isAuthorized) return;
    const timer = setTimeout(() => {
      fetchEvents();
    }, 0);
    return () => clearTimeout(timer);
  }, [authChecked, isAuthorized, selectedWingFilter, selectedProgramFilter, selectedStatusFilter]);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      wingId: isCoordinator && coordinatorWingId ? coordinatorWingId : (wings[0]?._id || ''),
      programId: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      capacity: '',
      description: '',
      coverImage: '',
      status: 'draft'
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    const resolvedWingId = evt.wingId?._id || evt.wingId || '';
    const resolvedProgramId = evt.programId?._id || evt.programId || '';

    setFormData({
      title: evt.title || '',
      wingId: resolvedWingId,
      programId: resolvedProgramId,
      date: evt.date ? new Date(evt.date).toISOString().split('T')[0] : '',
      location: evt.location || '',
      capacity: evt.capacity !== null && evt.capacity !== undefined ? String(evt.capacity) : '',
      description: evt.description || '',
      coverImage: evt.coverImage || '',
      status: evt.status || 'draft'
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
    if (!formData.date) errors.date = 'Event date is required';
    if (!formData.location.trim()) errors.location = 'Location is required';

    if (formData.capacity) {
      const cap = Number(formData.capacity);
      if (isNaN(cap) || cap <= 0) {
        errors.capacity = 'Capacity must be a positive number';
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
        programId: formData.programId || null,
        date: formData.date,
        location: formData.location.trim(),
        capacity: formData.capacity ? Number(formData.capacity) : null,
        description: formData.description.trim(),
        coverImage: formData.coverImage.trim(),
        status: formData.status
      };

      if (editingEvent) {
        await api.updateEvent(editingEvent._id, payload);
        flashSuccess(`Event "${payload.title}" updated successfully!`);
      } else {
        await api.createEvent(payload);
        flashSuccess(`Event "${payload.title}" created successfully!`);
      }

      setFormModalOpen(false);
      fetchEvents();
    } catch (err) {
      setFormErrors({ submit: err.message || 'Failed to save event.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    try {
      await api.deleteEvent(eventToDelete._id);
      flashSuccess(`Event "${eventToDelete.title}" removed.`);
      setDeleteModalOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper date formatter
  const formatDate = (val) => {
    if (!val) return 'TBD';
    return new Date(val).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filtered programs for dropdown based on currently chosen wing
  const availableProgramsForForm = formData.wingId
    ? programs.filter((p) => String(p.wingId?._id || p.wingId) === String(formData.wingId))
    : programs;

  // Search filter
  const filteredEvents = events.filter((e) => {
    const q = search.toLowerCase();
    const wingName = e.wingId?.nameEn?.toLowerCase() || '';
    const progTitle = e.programId?.title?.toLowerCase() || '';
    const loc = e.location?.toLowerCase() || '';
    return (
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      wingName.includes(q) ||
      progTitle.includes(q) ||
      loc.includes(q)
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
          Event Management is restricted to system administrators and authorized wing coordinators.
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
              <CalendarDays className="w-5 h-5 text-[#B62A35]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Events Hub
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Organize community drives, field camps, workshops, volunteer gatherings, and scheduled activities.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { fetchMetadata(); fetchEvents(); }}
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
            <span>New Event</span>
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
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location, wing..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#B62A35] transition-all"
            />
          </div>

          {/* Dynamic Wing Filter */}
          <div className="w-full sm:w-48">
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

          {/* Dynamic Program Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedProgramFilter}
              onChange={(e) => setSelectedProgramFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:border-[#B62A35]"
            >
              <option value="All">All Programs</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-36">
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
            Total: <span className="text-slate-900">{filteredEvents.length}</span> Events
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

      {/* Events Listing */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Loading Events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Events Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || selectedWingFilter !== 'All' || selectedProgramFilter !== 'All' || selectedStatusFilter !== 'All'
              ? 'No events match the selected filters.'
              : 'Schedule your first community event under an operational wing.'}
          </p>
          {!search && selectedWingFilter === 'All' && selectedProgramFilter === 'All' && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#9E1F2A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Event</span>
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
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Wing / Program</th>
                  <th className="py-3.5 px-4">Date & Location</th>
                  <th className="py-3.5 px-4">Capacity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => {
                  const statusInfo = STATUS_CONFIG[evt.status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={evt._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {evt.coverImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={evt.coverImage}
                              alt={evt.title}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">{evt.title}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                              {evt.description || <span className="italic text-slate-400">No description</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-bold text-[10px] border border-slate-200">
                            <Layers className="w-3 h-3 text-[#B62A35]" />
                            <span>{evt.wingId?.nameEn || 'General Wing'}</span>
                          </div>
                          {evt.programId && (
                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[150px]">{evt.programId.title}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px] text-slate-800 font-semibold">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatDate(evt.date)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[180px]">{evt.location}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.capacity ? `${evt.capacity} attendees` : 'Open / Unlimited'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManageEvent(evt) && (
                            <button
                              onClick={() => handleOpenAttendance(evt)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Manage Attendance"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                            </button>
                          )}
                          {canManageEvent(evt) && (
                            <button
                              onClick={() => handleOpenEdit(evt)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Event"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canManageEvent(evt) && (
                            <button
                              onClick={() => { setEventToDelete(evt); setDeleteModalOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
          {filteredEvents.map((evt) => {
            const statusInfo = STATUS_CONFIG[evt.status] || STATUS_CONFIG.draft;
            return (
              <div
                key={evt._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Cover Image */}
                <div className="h-36 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden flex items-center justify-center">
                  {evt.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={evt.coverImage}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="text-white/30 flex flex-col items-center gap-1">
                      <CalendarDays className="w-8 h-8" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Event</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border backdrop-blur-xs ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-black/60 text-white rounded-md backdrop-blur-xs border border-white/10">
                      {evt.wingId?.nameEn || 'Wing'}
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-900 text-base leading-snug">{evt.title}</h3>
                    {evt.programId && (
                      <p className="text-[11px] font-bold text-[#B62A35]">
                        Program: {evt.programId.title}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {evt.description || 'No description provided for this event.'}
                    </p>
                  </div>

                  {/* Metadata Bar */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Date:</span>
                      <span className="font-semibold text-slate-800">{formatDate(evt.date)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Location:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]">{evt.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Capacity:</span>
                      <span className="font-semibold text-slate-800">{evt.capacity ? `${evt.capacity} seats` : 'Open'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    {canManageEvent(evt) && (
                      <button
                        onClick={() => handleOpenAttendance(evt)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Attendance</span>
                      </button>
                    )}
                    {canManageEvent(evt) && (
                      <button
                        onClick={() => handleOpenEdit(evt)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                    {canManageEvent(evt) && (
                      <button
                        onClick={() => { setEventToDelete(evt); setDeleteModalOpen(true); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
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
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
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
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Free Eye Care Camp & Consultation"
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
                  <select
                    required
                    disabled={isCoordinator}
                    value={formData.wingId}
                    onChange={(e) => setFormData({ ...formData, wingId: e.target.value, programId: '' })}
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-hidden transition-all disabled:opacity-75 disabled:cursor-not-allowed ${
                      formErrors.wingId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                    }`}
                  >
                    <option value="">Select a Wing...</option>
                    {wings
                      .filter((w) => !isCoordinator || String(w._id) === String(coordinatorWingId))
                      .map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.nameEn} ({w.nameBn})
                        </option>
                      ))}
                  </select>
                  {isCoordinator && (
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">Locked to your assigned wing</p>
                  )}
                  {formErrors.wingId && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.wingId}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Program Alignment (Optional)
                  </label>
                  <select
                    value={formData.programId}
                    onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#B62A35] transition-all"
                  >
                    <option value="">None / Standalone Event</option>
                    {availableProgramsForForm.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Event Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden transition-all text-slate-800 ${
                      formErrors.date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                    }`}
                  />
                  {formErrors.date && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.date}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Location / Venue <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Jhalakathi Govt. High School Auditorium"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden transition-all ${
                      formErrors.location ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                    }`}
                  />
                  {formErrors.location && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.location}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Capacity / Seats</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g. 200 (Leave empty for open venue)"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden transition-all ${
                      formErrors.capacity ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                    }`}
                  />
                  {formErrors.capacity && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.capacity}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
                  >
                    <option value="draft">Draft (Planning)</option>
                    <option value="published">Published (Public)</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event schedule details, volunteer roles, equipment required..."
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
                  <span>{editingEvent ? 'Update Event' : 'Save Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">Delete Event</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong className="text-slate-800">{eventToDelete.title}</strong>? This action cannot be undone.
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

      {/* Attendance Management Modal */}
      {attendanceModalOpen && attendanceEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Attendance Management
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {attendanceEvent.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(attendanceEvent.date)}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{attendanceEvent.location}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttendanceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attendance Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Registered</span>
                <span className="text-xl font-black text-slate-900">{attendanceList.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">Attended</span>
                <span className="text-xl font-black text-emerald-600">
                  {attendanceList.filter((a) => a.attended).length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-[10px] font-bold uppercase text-rose-700 block">No-Show</span>
                <span className="text-xl font-black text-rose-600">
                  {attendanceList.filter((a) => !a.attended).length}
                </span>
              </div>
            </div>

            {/* Batch Action Toolbar */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-slate-700">Roster Check-in:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll(true)}
                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg transition-colors"
                >
                  Mark All Attended
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll(false)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                >
                  Mark All No-Show
                </button>
              </div>
            </div>

            {/* Attendance Roster Table */}
            {attendanceLoading ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#B62A35]" />
                <span className="text-xs font-semibold mt-2 block">Loading registrations...</span>
              </div>
            ) : attendanceList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-100">
                No participants have registered for this event yet.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Participant Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Registration Status</th>
                      <th className="py-2.5 px-3 text-center">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceList.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">
                            {item.userId?.name || 'Anonymous User'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.userId?.email || item.userId?.phone || 'No contact'}
                          </div>
                        </td>
                        <td className="py-3 px-3 capitalize text-slate-600 font-medium">
                          {item.userId?.role || 'member'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Registered
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(item.attended)}
                              onChange={() => handleToggleAttendance(item._id)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <span
                              className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                                item.attended
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {item.attended ? 'Attended' : 'No-Show'}
                            </span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAttendanceModalOpen(false)}
                className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={attendanceSaving || attendanceList.length === 0}
                className="py-2.5 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {attendanceSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Attendance...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
