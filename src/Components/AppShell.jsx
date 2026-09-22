'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, ExternalLink } from 'lucide-react';
import Navbar from '@/Components/navbar';
import Footer from '@/Components/footer';
import Sidebar from '@/Components/Sidebar';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkUser = () => {
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
    };

    checkUser();
    // Close mobile drawer on route change
    setMobileOpen(false);
  }, [pathname]);

  // Prevent flash before hydration
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        {children}
      </div>
    );
  }

  const isGuestSite = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPublicVerify = pathname === '/verify' && !user;

  // 1. GUEST LANDING PAGE: Only top Navbar & public Footer (NO Sidebar!)
  if (isGuestSite || isPublicVerify) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // 2. AUTH PAGES (Login & Register): Clean standalone interface (NO Sidebar!)
  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </div>
    );
  }

  // 3. PORTAL PAGES (Admin, Volunteer, Member)
  // If user is not logged in on a protected portal page, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-[#B62A35] rounded-2xl flex items-center justify-center mx-auto">
              <span className="font-black text-xl">!</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">Portal Access Restricted</h2>
            <p className="text-xs text-slate-500">
              Please sign in with your verified Member, Volunteer, or Admin credentials to access this system.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Go to Portal Login
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Logged-in user in the Portal: Render exclusive Aside Bar (Sidebar) with NO top navbar
  return (
    <div className="flex min-h-screen bg-slate-100/70 text-slate-900">
      {/* Desktop Sticky Aside Bar */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-40">
        <Sidebar
          user={user}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* Mobile Drawer (Clean Modal with Backdrop) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />
          {/* Aside Drawer */}
          <div className="relative z-50 h-screen shrink-0 animate-in slide-in-from-left duration-200">
            <Sidebar
              user={user}
              collapsed={false}
              setCollapsed={() => {}}
              onClose={() => setMobileOpen(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Main Portal Workspace */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top Header Bar (With Drawer Toggle) */}
        <div className="lg:hidden sticky top-0 z-30 bg-slate-950 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 focus:outline-hidden transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-[#F1AD1A]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white p-0.5 border border-[#F1AD1A] shrink-0">
                <img src="/landing/wcc.png" alt="WCC" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-xs text-white tracking-tight">WCC PORTAL</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#F1AD1A]/20 text-[#F1AD1A] border border-[#F1AD1A]/30">
              {user.role}
            </span>
            <Link
              href="/"
              className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              <span>Guest Site</span>
              <ExternalLink className="w-3 h-3 text-[#F1AD1A]" />
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
