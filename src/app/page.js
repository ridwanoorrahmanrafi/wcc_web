'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Wallet,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Search,
  CheckCircle2,
  Activity,
  HeartHandshake,
  BookOpen,
  Laptop,
  TreePine,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Trophy,
  Landmark,
  Check,
  ExternalLink,
  PhoneCall,
  LogIn
} from 'lucide-react';
import { api } from '@/lib/api';

const heroImages = [
  '/landing/image1.jpg',
  '/landing/image2.jpg',
  '/landing/image3.jpg',
  '/landing/image5.jpg',
  '/landing/image6.jpg',
  '/landing/image7.jpg',
  '/landing/image8.jpg',
  '/landing/image9.jpg',
  '/landing/image10.jpg',
  '/landing/image12.jpg'
];

export default function HomePage() {
  const router = useRouter();

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickVerifyId, setQuickVerifyId] = useState('');
  const [user, setUser] = useState(null);

  // Live Stats from MongoDB
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalLiquidity: 0,
    totalActivities: 0
  });

  // Check login state
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wcc_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {}
  }, []);

  // Fetch Live Stats from Backend wcc_api
  useEffect(() => {
    async function fetchStats() {
      try {
        const [memStats, finDash, acts] = await Promise.all([
          api.getMemberStats().catch(() => ({ total: 0, active: 0 })),
          api.getFinanceDashboard().catch(() => ({ totalLiquidity: 0 })),
          api.getActivities().catch(() => [])
        ]);

        setStats({
          totalMembers: memStats.total || 0,
          activeMembers: memStats.active || 0,
          totalLiquidity: finDash.totalLiquidity || 0,
          totalActivities: Array.isArray(acts) ? acts.length : 0
        });
      } catch (err) {
        console.error('Stats loading error:', err);
      }
    }
    fetchStats();
  }, []);

  // Hero auto-slider timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (!quickVerifyId.trim()) return;
    router.push(`/verify?id=${encodeURIComponent(quickVerifyId.trim())}`);
  };

  const focusAreas = [
    {
      title: 'শিক্ষা (Education)',
      icon: BookOpen,
      desc: 'মেধাবী ও অসচ্ছল শিক্ষার্থীদের শিক্ষাবৃত্তি, বিনামূল্যে শিক্ষা উপকরণ বিতরণ ও উচ্চশিক্ষা ক্যারিয়ার গাইডেন্স।',
      color: 'bg-rose-50 text-[#B62A35]'
    },
    {
      title: 'স্বাস্থ্যসেবা (Health Care)',
      icon: Stethoscope,
      desc: 'বিনামূল্যে বিশেষজ্ঞ ডাক্তারদের মেডিকেল ক্যাম্প, জরুরি রক্তদান নেটওয়ার্ক এবং গ্রামীণ ডায়াবেটিস ও চক্ষু স্ক্রিনিং।',
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'আইসিটি ও প্রযুক্তি (IT & ICT)',
      icon: Laptop,
      desc: 'ঝালকাঠির তরুণ প্রজন্মকে দক্ষ জনশক্তিতে রূপান্তরে ফ্রিল্যান্সিং, ওয়েব ডিজাইন ও ডিজিটাল সাক্ষরতা কর্মশালা।',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'খেলাধুলা ও যুবশক্তি (Sports)',
      icon: Trophy,
      desc: 'মাদক ও ডিজিটাল আসক্তি মুক্ত সমাজ গঠনে তৃণমূল ক্রিকেট, ফুটবল টুর্নামেন্ট ও যুব অ্যাথলেটিক্স আয়োজন।',
      color: 'bg-amber-50 text-[#A6772A]'
    },
    {
      title: 'সংস্কৃতি ও ঐতিহ্য (Culture & Heritage)',
      icon: Landmark,
      desc: 'বাঙালি সংস্কৃতি, ভাষা আন্দোলন ও মুক্তিযুদ্ধের সঠিক ইতিহাস সংরক্ষণ ও সাহিত্য সম্মেলনের আয়োজন।',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'পরিবেশ ও জলবায়ু (Environment)',
      icon: TreePine,
      desc: 'সুগন্ধা নদী তীরবর্তী এলাকায় ব্যাপক বৃক্ষরোপণ, প্লাস্টিক দূষণ নিয়ন্ত্রণ ও পরিবেশবান্ধব সবুজ মডেল গ্রাম গঠন।',
      color: 'bg-teal-50 text-teal-600'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ========================================================= */}
      {/* 1. HERO SECTION WITH IMAGE SLIDER                        */}
      {/* ========================================================= */}
      <section className="relative min-h-[620px] lg:min-h-[700px] flex items-center overflow-hidden bg-slate-950 text-white">
        {/* Background Slides */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'opacity 1s ease-in-out, transform 8s ease'
              }}
            />
          ))}
          {/* Dark gradient overlay for ultra-crisp readable typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/50"></div>
          <div className="absolute inset-0 bg-radial-at-c from-transparent to-slate-950/70"></div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <button
          onClick={handlePrevSlide}
          aria-label="Previous image"
          className="absolute left-4 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-[#B62A35] border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hidden sm:flex"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextSlide}
          aria-label="Next image"
          className="absolute right-4 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-[#B62A35] border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hidden sm:flex"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-[#F1AD1A]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Vision & Call to Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur text-xs font-bold text-[#F1AD1A]">
                <ShieldCheck className="w-4 h-4 text-[#F1AD1A]" />
                <span>We Can Change (WCC) • Official Guest Portal</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                The Power of <br />
                <span className="text-[#F1AD1A]">Youth & Good Governance</span> <br />
                Can Build the <span className="text-[#B62A35]">Bangladesh</span> of Tomorrow.
              </h1>

              <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl">
                ঝালকাঠি জেলাভিত্তিক একটি অগ্রণী অরাজনৈতিক সামাজিক সংগঠন। সততা, স্বচ্ছতা ও তরুণ প্রজন্মের সম্মিলিত ক্ষমতায়নে আমরা গঠন করছি এক বৈষম্যহীন ও স্বনির্ভর সমাজ।
              </p>

              {/* Action Buttons for Guest / Logged In */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.02]"
                  >
                    <span>Go to My {user.role.toUpperCase()} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register?role=member"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.02]"
                    >
                      <Users className="w-4 h-4" />
                      <span>Become a Member</span>
                    </Link>

                    <Link
                      href="/register?role=volunteer"
                      className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold text-sm shadow-lg transition-all hover:scale-[1.02]"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Join as Volunteer</span>
                    </Link>

                    <Link
                      href="/login"
                      className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-sm backdrop-blur transition-all"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Portal Login</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Public Member Verification Search Bar */}
              <div className="pt-4 max-w-xl">
                <p className="text-xs text-slate-300 mb-2 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant Public Member & Volunteer ID Verification:</span>
                </p>
                <form onSubmit={handleQuickVerify} className="flex items-center bg-white rounded-2xl shadow-xl p-1.5">
                  <div className="pl-3 pr-2 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={quickVerifyId}
                    onChange={(e) => setQuickVerifyId(e.target.value)}
                    placeholder="Enter ID (e.g. WCC-2026-0001 or WCC-VOL-0001)..."
                    className="w-full text-slate-900 text-sm font-medium focus:outline-hidden py-1.5 px-1"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-xs"
                  >
                    Verify ID
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl text-center space-y-5 max-w-sm w-full">
                <div className="w-28 h-28 mx-auto rounded-full bg-white p-2 shadow-xl border-2 border-[#F1AD1A] overflow-hidden">
                  <img
                    src="/landing/wcc.png"
                    alt="We Can Change"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">We Can Change</h3>
                  <p className="text-xs text-[#F1AD1A] font-bold tracking-wider uppercase mt-0.5">আমরাই আনব পরিবর্তন</p>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  ঝালকাঠি সদর, নলছিটি, রাজাপুর ও কাঠালিয়াসহ সমগ্র বাংলাদেশের তরুণদের একত্রিত করে জনকল্যাণ ও সুশাসনের শক্ত ভিত গড়ে তোলাই আমাদের লক্ষ্য।
                </p>
                <div className="pt-3 border-t border-white/15 flex items-center justify-around text-center">
                  <div>
                    <div className="text-xl font-black text-[#F1AD1A]">2026</div>
                    <div className="text-[10px] text-slate-300 uppercase font-semibold">Charter Year</div>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div>
                    <div className="text-xl font-black text-emerald-400">100%</div>
                    <div className="text-[10px] text-slate-300 uppercase font-semibold">Transparent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. REAL-TIME LIVE STATS BAR FROM MONGODB                  */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#B62A35] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Members</p>
              <h3 className="text-2xl font-black text-slate-900">{stats.totalMembers}</h3>
              <span className="text-[11px] text-emerald-600 font-semibold">{stats.activeMembers} Verified Active</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#A6772A] flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Treasury Balance</p>
              <h3 className="text-2xl font-black text-slate-900">৳ {stats.totalLiquidity.toLocaleString()}</h3>
              <span className="text-[11px] text-slate-500 font-medium">100% Audited Fund</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D3557] flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Social Activities</p>
              <h3 className="text-2xl font-black text-slate-900">{stats.totalActivities}</h3>
              <span className="text-[11px] text-blue-600 font-semibold">Health Camps & Drives</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Public Credentials</p>
              <h3 className="text-2xl font-black text-slate-900">Live QR</h3>
              <span className="text-[11px] text-emerald-600 font-semibold">Tamper-Proof ID Cards</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. CORE PRINCIPLES                                        */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full space-y-12" id="about">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            OUR GUIDING PRINCIPLES
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Building a <span className="text-[#B62A35]">Nation</span> on Principles
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            WCC is more than an organization; it’s a promise. A promise to hold power accountable and to build a society where the young generation can lead the future with dignity and justice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#B62A35] text-white flex items-center justify-center mx-auto shadow-md">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Moral Power (নৈতিক শক্তি)</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              সততা ও নীতিবোধের দৃঢ় ভিত্তির ওপর দাঁড়িয়ে সমাজ সংস্কারের প্রত্যয়। ব্যক্তিগত স্বার্থের ঊর্ধ্বে উঠে গণকল্যাণকে সর্বোচ্চ অগ্রাধিকার দেওয়া।
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1D3557] text-white flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Accountability (জবাবদিহিতা)</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              প্রতিটি সিদ্ধান্ত, কার্যক্রম ও আর্থিক হিসাবের উন্মুক্ত স্বচ্ছতা। শতভাগ ডিজিটাল লেজার ও জনসম্মুখে সার্বিক খরচের নিরপেক্ষ হিসাব প্রদান।
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F1AD1A] text-slate-950 flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Youth Leadership (যুব নেতৃত্ব)</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              তরুণদের মেধা, প্রযুক্তিগত দক্ষতা ও সৃষ্টিশীলতাকে দেশের মূল চালিকাশক্তিতে রূপান্তর। নেতৃত্বের অগ্রভাগে সৎ ও সাহসী যুবসমাজ।
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. KEY FOCUS AREAS                                        */}
      {/* ========================================================= */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-20" id="focus-areas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
                OUR AGENDA
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                Key Focus Areas (মূল কর্মক্ষেত্র)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                সমগ্র ঝালকাঠি জেলায় তৃণমূল পর্যায়ে বাস্তবমুখী সমাজকল্যাণ উদ্যোগ
              </p>
            </div>
            <Link
              href="/register?role=volunteer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B62A35] hover:underline"
            >
              <span>Join as a volunteer in these areas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {focusAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div
                  key={area.title}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3"
                >
                  <div className={`w-12 h-12 rounded-2xl ${area.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{area.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{area.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. MEET OUR CHAIRMAN                                      */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full" id="chairman">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-[#1D3557] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#B62A35]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Chairman Photo */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative">
                <div className="w-52 h-64 sm:w-60 sm:h-72 rounded-2xl overflow-hidden border-4 border-[#F1AD1A] shadow-2xl bg-slate-800">
                  <img
                    src="/landing/image4.jpg"
                    alt="Professor Dr SM Khalid Mahmud Shakil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-[#B62A35] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Chairman, WCC
                </div>
              </div>
            </div>

            {/* Chairman Bio & Statement */}
            <div className="lg:col-span-8 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F1AD1A]">
                  LEADERSHIP & VISION
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Professor Dr. SM Khalid Mahmud Shakil
                </h2>
                <div className="text-xs sm:text-sm text-slate-300 space-y-0.5 pt-1">
                  <p className="font-semibold text-[#F1AD1A]">MBBS, MS (Paediatric Surgery)</p>
                  <p>WHO Fellow (China), Advanced Training (India)</p>
                  <p>Professor, Department of Paediatric Surgery, Bangladesh Medical College & Hospital</p>
                </div>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-300 italic border-l-2 border-[#F1AD1A] pl-4 leading-relaxed">
                &ldquo;আমাদের প্রিয় ঝালকাঠি ও এই দেশের যুবসমাজের সততা, সৃজনশীলতা এবং অদম্য ইচ্ছাশক্তিকে কাজে লাগাতে পারলে যেকোনো সংকট দূর করা সম্ভব। আমরা চাই প্রতিটি তরুণকে দক্ষ, শিক্ষিত এবং আত্মপ্রত্যয়ী নাগরিক হিসেবে গড়ে তুলতে। পরিবর্তনের পথে আপনাদের সবাইকে আমাদের সাথে আহ্বান জানাই।&rdquo;
              </blockquote>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/register?role=member"
                  className="px-5 py-2.5 bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  Join Under WCC Leadership
                </Link>
                <Link
                  href="/#about"
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Learn Organization History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. OUR COMMITMENTS TO THE NATION                           */}
      {/* ========================================================= */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
              OUR PLEDGE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Institutional Commitments of WCC
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              সুশাসন, জবাবদিহিতা ও যুব সমাজের স্বতঃস্ফূর্ত অংশগ্রহণে আমাদের অঙ্গীকার
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#B62A35] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Digital Registry & Verification</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                প্রতিটি সদস্য ও ভলান্টিয়ারের তথ্য সরাসরি সেন্ট্রাল ডাটাবেজে সংরক্ষিত। কিউআর কোড স্ক্যানের মাধ্যমে তাৎক্ষণিক পরিচয়পত্র যাচাইয়ের উন্মুক্ত ব্যবস্থা।
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#A6772A] flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Total Financial Transparency</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                তহবিলের প্রতিটি টাকা ডাবল-এন্ট্রি অ্যাকাউন্টিং লেজারে লিপিবদ্ধ। কেন্দ্রীয় অডিট ও রসিদ ছাড়া কোনো লেনদেন অনুমোদিত হয় না।
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D3557] flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Community-Driven Action</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                স্বাস্থ্য, শিক্ষা, বৃক্ষরোপণ ও সমাজকল্যাণে তৃণমূল পর্যায়ে সরাসরি ফিল্ড কর্মসূচি। তরুণদের মেধা ও শ্রম সরাসরি জনকল্যাণে নিয়োজিত।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. WHY JOIN WCC                                           */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
              MEMBERSHIP & COMMUNITY
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Why Join <span className="text-[#B62A35]">We Can Change?</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We provide the platform, you provide the passion. WCC brings together youth, academicians, engineers, doctors, and community builders into a unified engine for social good.
            </p>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Empowerment & Justice:</strong> A platform where honesty beats systematic corruption and youth voices lead.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Learn, Lead, and Grow Together:</strong> Master valuable leadership, organizing, and digital technology skills.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>Official Credentials:</strong> Receive a verified Digital ID card with live QR code and public credibility.</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/register?role=member"
                className="px-6 py-3 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Become a Member
              </Link>
              <Link
                href="/register?role=volunteer"
                className="px-6 py-3 bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Join as Volunteer
              </Link>
            </div>
          </div>

          {/* Side Image Montage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="h-44 sm:h-52 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <img src="/landing/image10.jpg" alt="WCC Community" className="w-full h-full object-cover" />
              </div>
              <div className="h-32 sm:h-36 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <img src="/landing/image8.jpg" alt="WCC Drives" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-4 pt-6">
              <div className="h-32 sm:h-36 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <img src="/landing/image6.jpg" alt="WCC Camps" className="w-full h-full object-cover" />
              </div>
              <div className="h-44 sm:h-52 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <img src="/landing/image3.jpg" alt="WCC Youth" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. CALL TO ACTION SECTION                                 */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-r from-[#B62A35] via-[#8E1A23] to-[#1D3557] text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Enough Talk. Time for Action.
          </h2>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
            আমাদের দেশের প্রয়োজন আপনার মেধা, শক্তি ও দৃষ্টিভঙ্গি। আজই যুক্ত হোন এবং পরিবর্তনের অংশীদার হিসেবে আপনার পদচিহ্ন রাখুন।
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/register?role=member"
              className="px-8 py-3.5 bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold rounded-xl text-sm shadow-xl transition-all hover:scale-105"
            >
              Become a Member Now
            </Link>
            <Link
              href="/register?role=volunteer"
              className="px-8 py-3.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold rounded-xl text-sm backdrop-blur transition-all"
            >
              Join Volunteer Corps
            </Link>
          </div>
          <span className="block text-xs text-slate-300 pt-2">Takes less than 2 minutes to register online.</span>
        </div>
      </section>
    </div>
  );
}
