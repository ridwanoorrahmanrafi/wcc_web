import Link from 'next/link';
import {
  Heart,
  Mail,
  MapPin,
  ShieldCheck,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1 & 2: Organization Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white p-1 border-2 border-[#F1AD1A] shadow-md shrink-0">
                <img
                  src="/landing/wcc.png"
                  alt="We Can Change (WCC)"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">We Can Change</span>
                <span className="ml-2 text-xs font-bold text-[#F1AD1A] bg-[#F1AD1A]/10 px-2 py-0.5 rounded border border-[#F1AD1A]/20">
                  WCC
                </span>
                <p className="text-xs text-slate-400">আমরাই আনব পরিবর্তন</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              ঝালকাঠি জেলাভিত্তিক একটি অগ্রণী স্বেচ্ছাসেবী ও সামাজিক সংগঠন। তরুণ প্রজন্মের সততা, দক্ষতা ও উদ্ভাবনী শক্তিকে কাজে লাগিয়ে একটি স্বচ্ছ, ন্যায়পরায়ণ ও সমৃদ্ধ ভবিষ্যৎ বিনির্মাণে আমরা অঙ্গীকারবদ্ধ।
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/profile.php?id=61580304526553"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-[#B62A35] border border-slate-800 hover:border-[#B62A35] text-slate-400 hover:text-white flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/we_can_change_wcc/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-[#B62A35] border border-slate-800 hover:border-[#B62A35] text-slate-400 hover:text-white flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/wecanchange-wcc/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-[#B62A35] border border-slate-800 hover:border-[#B62A35] text-slate-400 hover:text-white flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1AD1A]">Quick Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#about" className="hover:text-white transition-colors">
                  About Organization
                </Link>
              </li>
              <li>
                <Link href="/#focus-areas" className="hover:text-white transition-colors">
                  Key Focus Areas
                </Link>
              </li>
              <li>
                <Link href="/#chairman" className="hover:text-white transition-colors">
                  Meet Our Chairman
                </Link>
              </li>
              <li>
                <Link href="/#updates" className="hover:text-white transition-colors">
                  Community Updates
                </Link>
              </li>
              <li>
                <Link href="/verify" className="flex items-center gap-1 hover:text-white transition-colors text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Public QR Verification</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Portals & Access */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1AD1A]">Join & Access</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/register?role=member" className="hover:text-white transition-colors flex items-center gap-1 text-slate-200">
                  <span>Become a Member</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/register?role=volunteer" className="hover:text-white transition-colors flex items-center gap-1 text-[#F1AD1A]">
                  <span>Join as Volunteer</span>
                  <Sparkles className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Executive Portal Login
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  My Role Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Office & Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1AD1A]">Head Office</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B62A35] shrink-0 mt-0.5" />
                <span>20 Kumarpotti Road, Jhalokathi Sadar, Jhalokathi, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B62A35] shrink-0" />
                <a href="mailto:wccjhalokathi@gmail.com" className="hover:text-white transition-colors">
                  wccjhalokathi@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>100% Non-Profit Transparency</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Every donation and membership fee is accounted for in our real-time audit ledger.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} We Can Change (WCC). All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Powered by Youth Leadership</span>
            <span>•</span>
            <span className="text-[#F1AD1A]">Jhalokathi, Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
