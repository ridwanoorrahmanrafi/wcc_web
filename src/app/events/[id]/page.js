'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';
import {
  Calendar,
  CalendarDays,
  MapPin,
  Users,
  FolderOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  UserPlus,
  LogIn,
  RefreshCw,
  Share2,
  Check,
  XCircle,
  FileText,
  ClipboardCheck
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User & Registration state
  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState('');
  const [regErrorMessage, setRegErrorMessage] = useState('');

  // Admin / Coordinator Roster & Attendance
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState('');
  const [attendanceErr, setAttendanceErr] = useState('');

  // 1. Load User from LocalStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('wcc_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 2. Fetch Event Details & Registration Status
  const loadEventData = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getEvent(eventId);
      setEvent(data);

      // If user is logged in, check registration
      const token = typeof window !== 'undefined' ? localStorage.getItem('wcc_token') : null;
      if (token) {
        try {
          const regStatus = await api.getMyEventRegistration(eventId);
          setIsRegistered(Boolean(regStatus.registered));
          setUserRegistration(regStatus.registration || null);
        } catch (e) {
          console.warn('Could not fetch personal registration status:', e.message);
        }

        // If user is admin or coordinator, fetch attendee roster
        const storedUser = localStorage.getItem('wcc_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.role === 'admin' || u.role === 'coordinator') {
            fetchRoster();
          }
        }
      }
    } catch (err) {
      console.error('Failed to load event details:', err);
      setError(err.message || 'Event not found or failed to load');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoster = async () => {
    try {
      setRosterLoading(true);
      const res = await api.getEventRegistrations(eventId);
      setRoster(res.registrations || []);
    } catch (err) {
      console.warn('Roster fetch notice:', err.message);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleToggleAttendance = (regId) => {
    setRoster((prev) =>
      prev.map((item) =>
        item._id === regId ? { ...item, attended: !item.attended } : item
      )
    );
  };

  const handleMarkAllAttendance = (attended) => {
    setRoster((prev) =>
      prev.map((item) => ({ ...item, attended }))
    );
  };

  const handleSaveAttendance = async () => {
    setAttendanceSaving(true);
    setAttendanceMsg('');
    setAttendanceErr('');
    try {
      const payload = roster.map((r) => ({
        registrationId: r._id,
        userId: r.userId?._id || r.userId,
        attended: Boolean(r.attended)
      }));
      await api.updateEventAttendance(eventId, payload);
      const attendedCount = payload.filter((p) => p.attended).length;
      setAttendanceMsg(
        `Attendance updated successfully! (${attendedCount} attended, ${payload.length - attendedCount} no-show)`
      );
      setTimeout(() => setAttendanceMsg(''), 4500);
    } catch (err) {
      console.error('Failed to update attendance:', err);
      setAttendanceErr(err.message || 'Failed to update attendance');
    } finally {
      setAttendanceSaving(false);
    }
  };

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  // Handle Event Registration
  const handleRegister = async () => {
    if (!user) {
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }

    setRegistering(true);
    setRegSuccessMessage('');
    setRegErrorMessage('');

    try {
      const res = await api.registerForEvent(eventId);
      setIsRegistered(true);
      setUserRegistration(res.registration);
      setRegSuccessMessage('🎉 Congratulations! You have successfully registered for this event.');

      // Refresh event data to update seat count and roster
      loadEventData();
    } catch (err) {
      console.error('Registration failed:', err);
      setRegErrorMessage(err.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-slate-50">
        <RefreshCw className="w-8 h-8 animate-spin text-[#B62A35]" />
        <p className="mt-3 text-xs sm:text-sm font-bold text-slate-600">
          Loading event details...
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-[#B62A35] rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Event Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {error || 'The requested event does not exist, is in draft, or has been removed.'}
          </p>
          <div className="pt-2">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 py-2.5 px-6 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Events</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const wingInfo = event.wingId && typeof event.wingId === 'object' ? event.wingId : null;
  const programInfo = event.programId && typeof event.programId === 'object' ? event.programId : null;
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.status === 'completed';
  const isDraft = event.status === 'draft';
  const capacity = event.capacity || 0;
  const registeredCount = event.registeredCount || 0;
  const isFull = event.isFull || (capacity > 0 && registeredCount >= capacity);
  const seatsLeft = capacity > 0 ? Math.max(0, capacity - registeredCount) : null;
  const capacityPercent = capacity > 0 ? Math.min(100, Math.round((registeredCount / capacity) * 100)) : 0;

  const isCoordinatorOrAdmin = user && (user.role === 'admin' || user.role === 'coordinator');
  const canModifyAttendance =
    user?.role === 'admin' ||
    (user?.role === 'coordinator' &&
      String(user.assignedWing?._id || user.assignedWing || '') ===
        String(event.wingId?._id || event.wingId || ''));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#B62A35] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Alerts */}
        {regSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{regSuccessMessage}</div>
          </div>
        )}

        {regErrorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{regErrorMessage}</div>
          </div>
        )}

        {/* Main Event Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Details & Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Cover Image */}
              {event.coverImage ? (
                <div className="relative h-64 sm:h-80 bg-slate-950">
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    {wingInfo && (
                      <span className="px-3 py-1 bg-white/95 backdrop-blur text-slate-900 text-xs font-bold rounded-lg shadow-sm">
                        {wingInfo.nameEn} Wing
                      </span>
                    )}
                    <StatusBadge status={event.status} />
                  </div>
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-slate-900 to-[#1D3557] flex items-center justify-center text-white/30">
                  <CalendarDays className="w-16 h-16" />
                </div>
              )}

              {/* Title & Metadata */}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {!event.coverImage && <StatusBadge status={event.status} />}
                    {wingInfo?.slug && (
                      <Link
                        href={`/wings/${wingInfo.slug}`}
                        className="text-xs font-bold text-[#B62A35] hover:underline"
                      >
                        {wingInfo.nameEn} Wing
                      </Link>
                    )}
                    {programInfo && (
                      <span className="text-xs font-medium text-slate-500">
                        • Program: {programInfo.title}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {event.title}
                  </h1>
                </div>

                {/* Key Facts Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Calendar className="w-4 h-4 text-[#B62A35] shrink-0" />
                    <div>
                      <span className="font-semibold block">{formatDate(event.date)}</span>
                      <span className="text-xs text-slate-400">{formatTime(event.date)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-[#B62A35] shrink-0" />
                    <div>
                      <span className="font-semibold block">{event.location}</span>
                      <span className="text-xs text-slate-400">Jhalakathi District</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    About This Event
                  </h3>
                  <div className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {event.description ||
                      'Join We Can Change volunteers, leaders, and community members for this grassroots civic initiative.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Roster & Management (Visible to Admins and Wing Coordinators) */}
            {isCoordinatorOrAdmin && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-[#B62A35]" />
                      <span>Event Attendance & Registrations</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {canModifyAttendance
                        ? 'Check in registered participants and manage attendance records.'
                        : 'Registration roster for this event (Read-only for other wings).'}
                    </p>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                      {roster.length} registered
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
                      {roster.filter((r) => r.attended).length} attended
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
                      {roster.filter((r) => !r.attended).length} no-show
                    </span>
                  </div>
                </div>

                {/* Notifications */}
                {attendanceMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{attendanceMsg}</span>
                  </div>
                )}
                {attendanceErr && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{attendanceErr}</span>
                  </div>
                )}

                {/* Quick Batch Actions */}
                {canModifyAttendance && roster.length > 0 && (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span>Quick Actions:</span>
                      <button
                        type="button"
                        onClick={() => handleMarkAllAttendance(true)}
                        className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Mark All Attended
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkAllAttendance(false)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Mark All No-Show
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAttendance}
                      disabled={attendanceSaving}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
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
                )}

                {rosterLoading ? (
                  <div className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#B62A35]" />
                    <span className="text-xs mt-1 block">Loading roster...</span>
                  </div>
                ) : roster.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-slate-100">
                    No members or volunteers have registered for this event yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-3">Participant Name</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3">Registration Status</th>
                          <th className="py-2.5 px-3 text-center">Attendance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {roster.map((r) => (
                          <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">
                                {r.userId?.name || 'Anonymous User'}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {r.userId?.email || r.userId?.phone || 'No contact'}
                              </div>
                            </td>
                            <td className="py-3 px-3 capitalize text-slate-600 font-medium">
                              {r.userId?.role || 'member'}
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Registered
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {canModifyAttendance ? (
                                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(r.attended)}
                                    onChange={() => handleToggleAttendance(r._id)}
                                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <span
                                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                                      r.attended
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {r.attended ? 'Attended' : 'No-Show'}
                                  </span>
                                </label>
                              ) : (
                                <span
                                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md ${
                                    r.attended
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {r.attended ? 'Attended' : 'No-Show'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Registration Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xl space-y-6 sticky top-24">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Seat Reservation
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  Event Registration
                </h2>
              </div>

              {/* Capacity Progress */}
              {capacity > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Reserved Seats:</span>
                    <span className="text-slate-900 font-mono">
                      {registeredCount} / {capacity}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isFull
                          ? 'bg-rose-500'
                          : capacityPercent > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{seatsLeft} seats remaining</span>
                    <span>{capacityPercent}% filled</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Open Community Capacity (No strict limit)</span>
                </div>
              )}

              {/* REGISTRATION STATE DISPLAY */}
              {/* STATE 1: ALREADY REGISTERED */}
              {isRegistered ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 text-emerald-950 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>You are Registered for this Event</span>
                  </div>
                  <p className="text-xs text-emerald-900/80 leading-relaxed">
                    Your seat is reserved. Please arrive 15 minutes before scheduled start time and present your WCC ID card or registered name.
                  </p>
                  {userRegistration?.registeredAt && (
                    <div className="text-[11px] text-emerald-800 font-medium pt-1 border-t border-emerald-200/60">
                      Registered on: {new Date(userRegistration.registeredAt).toLocaleString()}
                    </div>
                  )}
                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      className="inline-block w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl text-center transition-colors shadow-xs"
                    >
                      View in Member Portal
                    </Link>
                  </div>
                </div>
              ) : isCancelled ? (
                /* STATE 2: EVENT CANCELLED */
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-700">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Registration Closed • Cancelled</span>
                  </div>
                  <p className="text-[11px] text-rose-800/80 leading-relaxed">
                    This event has been cancelled by the organizers.
                  </p>
                </div>
              ) : isCompleted ? (
                /* STATE 3: EVENT COMPLETED */
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs space-y-1 text-center">
                  <span className="font-bold block">Event Concluded</span>
                  <p className="text-[11px] text-slate-500">
                    This event has already taken place.
                  </p>
                </div>
              ) : isDraft ? (
                /* STATE 4: DRAFT */
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <span className="font-bold block">Draft Event</span>
                  <p className="text-[11px] text-amber-800/80">
                    Registration will open once this event is officially published.
                  </p>
                </div>
              ) : isFull ? (
                /* STATE 5: CAPACITY REACHED */
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Capacity Reached</span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 leading-relaxed">
                    All {capacity} available seats for this event are fully booked. Check back later in case seats open up.
                  </p>
                </div>
              ) : !user ? (
                /* STATE 6: NOT LOGGED IN */
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <LogIn className="w-4 h-4 text-[#B62A35]" />
                      <span>Account Required</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Please sign in with your verified Member or Volunteer account to register and reserve your seat.
                    </p>
                  </div>

                  <Link
                    href={`/login?redirect=/events/${eventId}`}
                    className="w-full py-3.5 px-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Register</span>
                  </Link>

                  <p className="text-[11px] text-center text-slate-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-[#B62A35] font-semibold hover:underline">
                      Join WCC
                    </Link>
                  </p>
                </div>
              ) : (
                /* STATE 7: ELIGIBLE TO REGISTER */
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F1AD1A] shrink-0" />
                    <span>
                      Signed in as <strong>{user.name}</strong> ({user.role})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full py-3.5 px-6 bg-[#B62A35] hover:bg-[#9E1F2A] disabled:bg-slate-400 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {registering ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Registering Seat...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Register / Join Event</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400 leading-relaxed">
                    By registering, you commit to attending and adhering to WCC community code of conduct.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
