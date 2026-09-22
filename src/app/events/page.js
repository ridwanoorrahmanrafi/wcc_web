'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  CalendarDays,
  Calendar,
  MapPin,
  Users,
  Layers,
  ArrowRight,
  ArrowLeft,
  Filter,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Clock,
  FolderOpen
} from 'lucide-react';

export default function PublicEventsPage() {
  const [events, setEvents] = useState([]);
  const [wings, setWings] = useState([]);
  const [selectedWing, setSelectedWing] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Wings for filtering dropdown
  useEffect(() => {
    async function loadWings() {
      try {
        const data = await api.getWings();
        setWings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load wings for filter:', err);
      }
    }
    loadWings();
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadEvents() {
      try {
        const params = {};
        if (selectedWing) {
          params.wingId = selectedWing;
        }
        if (selectedStatus && selectedStatus !== 'all') {
          params.status = selectedStatus;
        }
        const data = await api.getEvents(params);
        if (!ignore) {
          setEvents(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching events:', err);
          setError(err.message || 'Failed to load events. Please try again.');
          setLoading(false);
        }
      }
    }
    loadEvents();
    return () => { ignore = true; };
  }, [selectedWing, selectedStatus]);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedWing) params.wingId = selectedWing;
      if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
      const data = await api.getEvents(params);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#B62A35_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#B62A35]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <span className="text-[#F1AD1A]">Events</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur text-xs font-bold text-[#F1AD1A]">
              <CalendarDays className="w-4 h-4 text-[#F1AD1A]" />
              <span>COMMUNITY ACTIONS & DRIVES</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Field Campaigns & <br />
              <span className="text-[#F1AD1A]">Community Events</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              ঝালকাঠি জেলাব্যাপী স্বেচ্ছায় রক্তদান ক্যাম্প, বৃক্ষরোপণ, ক্রীড়া প্রতিযোগিতা ও সচেতনতামূলক সভা। নাগরিক সম্পৃক্ততা ও তরুণ নেতৃত্বের মিলনমেলা।
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Wing Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Wing:</span>
            </span>
            <button
              onClick={() => setSelectedWing('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedWing === ''
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Wings
            </button>
            {wings.map((wing) => (
              <button
                key={wing._id}
                onClick={() => setSelectedWing(wing._id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedWing === wing._id
                    ? 'bg-[#B62A35] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {wing.nameEn}
              </button>
            ))}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="event-status-filter" className="text-xs font-bold text-slate-500">Status:</label>
            <select
              id="event-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#B62A35]"
            >
              <option value="all">All Events</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 h-80 overflow-hidden flex flex-col justify-between">
                <div className="h-44 bg-slate-200 w-full"></div>
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                </div>
                <div className="p-6 pt-0">
                  <div className="h-8 bg-slate-100 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 max-w-md mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#B62A35] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Failed to Load Events</h3>
            <p className="text-xs text-slate-600">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Events Found</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              No community events match the selected criteria. Try changing the wing filter or check back soon.
            </p>
            {selectedWing && (
              <button
                onClick={() => setSelectedWing('')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <span>Clear Wing Filter</span>
              </button>
            )}
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => {
              const wingInfo = evt.wingId && typeof evt.wingId === 'object' ? evt.wingId : null;
              const programInfo = evt.programId && typeof evt.programId === 'object' ? evt.programId : null;

              return (
                <div
                  key={evt._id}
                  className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Image */}
                    {evt.coverImage ? (
                      <div className="relative h-48 bg-slate-900 overflow-hidden">
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                        {wingInfo && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold rounded-lg shadow-xs">
                              {wingInfo.nameEn} Wing
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-slate-900 to-[#1D3557] flex items-center justify-center text-white/40 relative">
                        <CalendarDays className="w-10 h-10" />
                        {wingInfo && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 bg-white/15 backdrop-blur text-white text-[10px] font-bold rounded-lg border border-white/20">
                              {wingInfo.nameEn} Wing
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
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
                        {evt.description || 'Community driven event focused on grassroots empowerment and engagement.'}
                      </p>

                      <div className="space-y-1.5 pt-2 text-xs text-slate-500 border-t border-slate-100">
                        {evt.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{evt.location}</span>
                          </div>
                        )}
                        {evt.capacity > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Capacity: {evt.capacity} attendees</span>
                          </div>
                        )}
                        {programInfo && (
                          <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <FolderOpen className="w-3.5 h-3.5 text-[#B62A35] shrink-0" />
                            <span className="truncate">Under Program: {programInfo.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="p-6 pt-0 border-t border-slate-100 mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">Organizing Wing:</span>
                      {wingInfo?.slug ? (
                        <Link
                          href={`/wings/${wingInfo.slug}`}
                          className="text-[#B62A35] hover:underline font-bold text-[11px] truncate max-w-[200px]"
                          title={`${wingInfo.nameEn} Wing`}
                        >
                          {wingInfo.nameEn} Wing
                        </Link>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500">General Action</span>
                      )}
                    </div>

                    <Link
                      href={`/events/${evt._id}`}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-[#B62A35] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs group-hover:bg-[#B62A35] whitespace-nowrap cursor-pointer"
                    >
                      <span>View & Register</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
