'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Target,
  Layers,
  Sparkles,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function WingDetailPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;

  const [wing, setWing] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wcc_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      if (!slug) return;
      try {
        let currentWing;
        try {
          currentWing = await api.getWing(slug);
        } catch (err) {
          if (err.message?.includes('404') || err.message?.toLowerCase().includes('not found')) {
            if (!ignore) {
              setNotFound(true);
              setLoading(false);
            }
            return;
          }
          throw err;
        }

        if (!currentWing) {
          if (!ignore) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        const wingId = currentWing._id;
        const [programsData, eventsData] = await Promise.all([
          api.getPrograms({ wingId }).catch(() => []),
          api.getEvents({ wingId }).catch(() => [])
        ]);

        if (!ignore) {
          setWing(currentWing);
          setPrograms(Array.isArray(programsData) ? programsData : []);
          setEvents(Array.isArray(eventsData) ? eventsData : []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching wing details:', err);
          setError(err.message || 'Failed to load wing details. Please try again.');
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { ignore = true; };
  }, [slug]);

  const handleRetry = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      let currentWing;
      try {
        currentWing = await api.getWing(slug);
      } catch (err) {
        if (err.message?.includes('404') || err.message?.toLowerCase().includes('not found')) {
          setNotFound(true);
          return;
        }
        throw err;
      }
      if (!currentWing) {
        setNotFound(true);
        return;
      }
      setWing(currentWing);
      const wingId = currentWing._id;
      const [programsData, eventsData] = await Promise.all([
        api.getPrograms({ wingId }).catch(() => []),
        api.getEvents({ wingId }).catch(() => [])
      ]);
      setPrograms(Array.isArray(programsData) ? programsData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      console.error('Error fetching wing details:', err);
      setError(err.message || 'Failed to load wing details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'draft':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="bg-slate-900 h-80 animate-pulse w-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-20 bg-slate-100 rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-slate-200 rounded-3xl animate-pulse"></div>
            <div className="h-64 bg-slate-200 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State (Invalid Slug)
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 max-w-md w-full text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#B62A35] flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              404 • INVALID WING
            </span>
            <h1 className="text-2xl font-black text-slate-900">Wing Not Found</h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              We could not find an organizational wing with the slug <code className="text-rose-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded">&ldquo;{slug}&rdquo;</code>.
            </p>
          </div>
          <Link
            href="/wings"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Wings</span>
          </Link>
        </div>
      </div>
    );
  }

  // General Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white border border-rose-200 rounded-3xl p-8 sm:p-12 max-w-md w-full text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-[#B62A35] flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">Failed to Load Wing</h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{error}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Loading</span>
            </button>
            <Link
              href="/wings"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Wings Directory</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!wing) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Banner */}
      <section className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
        {/* Cover image background */}
        {wing.coverImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={wing.coverImage}
              alt={wing.nameEn}
              className="w-full h-full object-cover opacity-25 filter blur-xs scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60"></div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 space-y-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/wings" className="hover:text-white transition-colors">
              Wings
            </Link>
            <span>/</span>
            <span className="text-[#F1AD1A] font-bold">{wing.nameEn}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#B62A35]/20 border border-[#B62A35]/40 text-[#F1AD1A] text-xs font-extrabold uppercase tracking-wider">
                  {wing.slug} wing
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur text-slate-300 text-xs font-semibold">
                  {wing.nameBn}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                {wing.nameEn} <span className="text-[#F1AD1A]">Wing</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
                {wing.description || 'Dedicated to civic empowerment, community support, and sustainable social impact.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={user ? '/dashboard?tab=requests' : '/register'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{user ? 'Request to Join this Wing' : 'Join as Member'}</span>
                </Link>
                <Link
                  href="/wings"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs rounded-xl transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>All 5 Wings</span>
                </Link>
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="lg:col-span-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F1AD1A]">
                  Wing Highlights
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Programs</p>
                    <p className="text-2xl font-black text-white">{programs.length}</p>
                    <span className="text-[10px] text-emerald-400">Initiatives</span>
                  </div>
                  <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Events</p>
                    <p className="text-2xl font-black text-white">{events.length}</p>
                    <span className="text-[10px] text-blue-400">Active Drives</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10 text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Official We Can Change (WCC) Strategic Pillar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* 1. Mission Goals Section */}
        {Array.isArray(wing.missionPoints) && wing.missionPoints.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
                CORE TARGETS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Strategic Mission Goals
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Key civic priorities and quantifiable development targets under the {wing.nameEn} Wing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wing.missionPoints.map((point, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#B62A35] flex items-center justify-center shrink-0 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm">{point}</h3>
                    <p className="text-xs text-slate-500">
                      Community driven milestone committed to transparent grassroots execution.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. Programs Belonging to this Wing */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
                PROJECTS & DRIVES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Programs in {wing.nameEn} ({programs.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Structured initiatives organized and operated under this organizational wing.
              </p>
            </div>
            <Link
              href="/programs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B62A35] hover:underline shrink-0"
            >
              <span>View All NGO Programs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {programs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <FolderOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No Programs Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  There are currently no active programs registered under the {wing.nameEn} wing. New initiatives will appear here once announced.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <div
                  key={program._id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {program.coverImage ? (
                      <div className="h-44 bg-slate-900 overflow-hidden">
                        <img
                          src={program.coverImage}
                          alt={program.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
                        <FolderOpen className="w-10 h-10" />
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getStatusColor(program.status)}`}>
                          {program.status || 'Active'}
                        </span>
                        {(program.startDate || program.endDate) && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(program.startDate)}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                        {program.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {program.description || 'Program details and community objectives are being coordinated.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Timeline: {formatDate(program.startDate)} - {formatDate(program.endDate)}</span>
                    <Link
                      href="/programs"
                      className="text-[#B62A35] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. Events Belonging to this Wing */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
                COMMUNITY DRIVES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Events in {wing.nameEn} ({events.length})
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Field activities, blood donation drives, tournaments, and seminars hosted by this wing.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B62A35] hover:underline shrink-0"
            >
              <span>View All Community Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <CalendarDays className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No Events Scheduled</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  There are no scheduled community events or field campaigns for the {wing.nameEn} wing right now.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => (
                <div
                  key={evt._id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {evt.coverImage ? (
                      <div className="h-44 bg-slate-900 overflow-hidden">
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
                        <CalendarDays className="w-10 h-10" />
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getStatusColor(evt.status)}`}>
                          {evt.status || 'Active'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#B62A35]" />
                          <span>{formatDate(evt.date)}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                        {evt.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {evt.description || 'Community event bringing youth and citizens together.'}
                      </p>

                      <div className="space-y-1.5 pt-2 text-xs text-slate-500">
                        {evt.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{evt.location}</span>
                          </div>
                        )}
                        {evt.capacity > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Capacity: {evt.capacity} volunteers / attendees</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>{evt.programId?.title ? `Program: ${evt.programId.title}` : 'Direct Wing Drive'}</span>
                    <Link
                      href="/events"
                      className="text-[#B62A35] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
