'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Compass,
  Target,
  Award,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  HeartHandshake,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function VisionMissionPage() {
  const [wings, setWings] = useState([]);
  const [loadingWings, setLoadingWings] = useState(true);

  useEffect(() => {
    async function loadWings() {
      try {
        const data = await api.getWings();
        setWings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading wings for vision-mission:', err);
      } finally {
        setLoadingWings(false);
      }
    }
    loadWings();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#B62A35_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F1AD1A]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <span className="text-[#F1AD1A]">Vision & Mission</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur text-xs font-bold text-[#F1AD1A]">
              <Compass className="w-4 h-4 text-[#F1AD1A]" />
              <span>ORGANIZATIONAL CHARTER</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Our Vision, Mission & <br />
              <span className="text-[#F1AD1A]">Guiding Principles</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              উই ক্যান চেঞ্জ (WCC) কেবল একটি সংগঠন নয়, এটি একটি প্রতিশ্রুতি—সততা, স্বচ্ছতা ও তরুণ প্রজন্মের সম্মিলিত ক্ষমতায়নে এক বৈষম্যহীন ও স্বনির্ভর বাংলাদেশ গড়ার প্রত্যয়।
            </p>
          </div>
        </div>
      </section>

      {/* 2. CORE VISION STATEMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              OUR OVERARCHING VISION (আমাদের মূল লক্ষ্য)
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              &ldquo;The Power of Youth & Good Governance Can Build the Bangladesh of Tomorrow.&rdquo;
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              ঝালকাঠি জেলাকে একটি মডেল ও ইতিবাচক পরিবর্তনের উদাহরণ হিসেবে গড়ে তুলে, পরবর্তী সময়ে সারাদেশে যুবসমাজের সততা, স্বচ্ছতা ও আধুনিক প্রযুক্তিগত দক্ষতাকে কাজে লাগিয়ে দারিদ্র্য, দুর্নীতি ও বৈষম্যমুক্ত সমাজ প্রতিষ্ঠা করা।
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Non-Profit Commitment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Real-Time Audit Transparency</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Grassroots Youth Leadership</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE GUIDING PRINCIPLES (Source from project) */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
              CORE ETHICAL VALUES
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our 3 Founding Principles
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              যে ৩টি মৌলিক স্তম্ভের ওপর ভিত্তি করে ডব্লিউসিসি-র প্রতিটি সিদ্ধান্ত ও কার্যক্রম পরিচালিত হয়।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Moral Power */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#B62A35] text-white flex items-center justify-center mx-auto shadow-md">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Moral Power (নৈতিক শক্তি)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                সততা ও নীতিবোধের দৃঢ় ভিত্তির ওপর দাঁড়িয়ে সমাজ সংস্কারের প্রত্যয়। ব্যক্তিগত স্বার্থের ঊর্ধ্বে উঠে গণকল্যাণ ও ন্যায়বিচারকে সর্বোচ্চ অগ্রাধিকার দেওয়া।
              </p>
            </div>

            {/* Accountability */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1D3557] text-white flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Accountability (জবাবদিহিতা)</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                প্রতিটি সিদ্ধান্ত, কার্যক্রম ও আর্থিক হিসাবের উন্মুক্ত স্বচ্ছতা। শতভাগ ডিজিটাল লেজার ও জনসম্মুখে সার্বিক খরচের নিরপেক্ষ হিসাব প্রদান।
              </p>
            </div>

            {/* Youth Leadership */}
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
        </div>
      </section>

      {/* 4. CHAIRMAN'S VISION STATEMENT (Source from project) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-[#1D3557] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F1AD1A]">
              LEADERSHIP & CIVIC VISION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Professor Dr. SM Khalid Mahmud Shakil
            </h2>
            <div className="text-xs sm:text-sm text-slate-300 space-y-0.5">
              <p className="font-semibold text-[#F1AD1A]">MBBS, MS (Paediatric Surgery)</p>
              <p>WHO Fellow (China), Advanced Training (India)</p>
              <p>Professor, Department of Paediatric Surgery, Bangladesh Medical College & Hospital</p>
            </div>

            <blockquote className="text-xs sm:text-sm text-slate-200 italic border-l-2 border-[#F1AD1A] pl-4 leading-relaxed">
              &ldquo;আমাদের প্রিয় ঝালকাঠি ও এই দেশের যুবসমাজের সততা, সৃজনশীলতা এবং অদম্য ইচ্ছাশক্তিকে কাজে লাগাতে পারলে যেকোনো সংকট দূর করা সম্ভব। আমরা চাই প্রতিটি তরুণকে দক্ষ, শিক্ষিত এবং আত্মপ্রত্যয়ী নাগরিক হিসেবে গড়ে তুলতে। পরিবর্তনের পথে আপনাদের সবাইকে আমাদের সাথে আহ্বান জানাই।&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* 5. STRATEGIC WINGS MISSION REUSE (Dynamic from Wings API) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
            PILLAR GOALS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            Mission Commitments by Wing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            প্রতিটি উইংয়ের সুনির্দিষ্ট লক্ষ্য ও বাস্তবায়নযোগ্য কর্মসূচি সরাসরি আমাদের ডেটাবেজ ও পরিচালনা পর্ষদ কর্তৃক নির্ধারিত।
          </p>
        </div>

        {loadingWings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 h-48"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wings.map((wing) => (
              <div
                key={wing._id || wing.slug}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg uppercase">
                      {wing.slug}
                    </span>
                    <span className="text-xs font-semibold text-[#B62A35]">{wing.nameBn}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {wing.nameEn} Wing
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                    {wing.description}
                  </p>

                  {/* Mission Points */}
                  {Array.isArray(wing.missionPoints) && wing.missionPoints.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-[#B62A35]" />
                        <span>Action Milestones</span>
                      </span>
                      <ul className="space-y-1">
                        {wing.missionPoints.map((point, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-[#B62A35] font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    href={`/wings/${wing.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B62A35] hover:underline"
                  >
                    <span>View {wing.nameEn} Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Callout */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 bg-rose-50 border border-rose-200 rounded-3xl p-8">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Want to support or volunteer for our mission?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Join We Can Change as a registered member or community volunteer today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="px-5 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Join We Can Change
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-xs"
            >
              Member Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
