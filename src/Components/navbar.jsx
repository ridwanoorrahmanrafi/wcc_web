'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Wallet,
  PieChart,
  ShieldCheck,
  UserPlus,
  Home,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  HeartHandshake,
  Sparkles,
  LayoutDashboard,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [joinDropdownOpen, setJoinDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
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
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('wcc_token');
    localStorage.removeItem('wcc_user');
    setUser(null);
    router.push('/');
  };

  // Nav items based on role or guest
  const getNavLinks = () => {
    if (!user) {
      // Guest navigation
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'About Us', href: '/#about', icon: null },
        { name: 'Focus Areas', href: '/#focus-areas', icon: null },
        { name: 'Chairman', href: '/#chairman', icon: null },
        { name: 'Verify ID', href: '/verify', icon: ShieldCheck }
      ];
    }

    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Members', href: '/members', icon: Users },
        { name: 'Finance Hub', href: '/finance', icon: Wallet },
        { name: 'Analytics', href: '/analytics', icon: PieChart },
        { name: 'Verify', href: '/verify', icon: ShieldCheck }
      ];
    }

    if (user.role === 'volunteer') {
      return [
        { name: 'Volunteer Hub', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Badge', href: '/dashboard#badge', icon: Sparkles },
        { name: 'Community Drives', href: '/dashboard#drives', icon: HeartHandshake },
        { name: 'Verify ID', href: '/verify', icon: ShieldCheck }
      ];
    }

    // Default Member role
    return [
      { name: 'Member Portal', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Digital ID', href: '/dashboard#id-card', icon: ShieldCheck },
      { name: 'Member Directory', href: '/members', icon: Users },
      { name: 'Reimbursements', href: '/finance/reimbursements', icon: Wallet },
      { name: 'Verify ID', href: '/verify', icon: ShieldCheck }
    ];
  };

  const navLinks = getNavLinks();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { text: 'Admin', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'volunteer':
        return { text: 'Volunteer', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'finance_officer':
        return { text: 'Finance', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { text: 'Member', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#F1AD1A] bg-white p-0.5 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/landing/wcc.png"
                alt="We Can Change Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-[#B62A35] tracking-tight">WCC</span>
                <span className="text-[10px] bg-[#F1AD1A]/20 text-[#A6772A] font-extrabold px-1.5 py-0.5 rounded">
                  {user ? `${user.role.toUpperCase()} PORTAL` : 'OFFICIAL'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                We Can Change • আমরাই আনব পরিবর্তন
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#B62A35] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#B62A35] hover:bg-slate-100'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Switch to Guest Landing Page link */}
                <Link
                  href="/"
                  title="View Public Landing Page"
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Public Site</span>
                </Link>

                <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <div className="flex items-center justify-end">
                      <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-bold ${getRoleBadge(user.role).color}`}>
                        {getRoleBadge(user.role).text}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="p-1.5 text-slate-500 hover:text-[#B62A35] hover:bg-rose-50 rounded-lg transition-colors"
                    title="My Dashboard"
                  >
                    <User className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Log out"
                    className="p-1.5 text-slate-400 hover:text-[#B62A35] hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Join WCC Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setJoinDropdownOpen(!joinDropdownOpen)}
                    onBlur={() => setTimeout(() => setJoinDropdownOpen(false), 200)}
                    className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 transition-all shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Join WCC</span>
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>

                  {joinDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                      <Link
                        href="/register?role=member"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#B62A35]"
                      >
                        <Users className="w-3.5 h-3.5 text-[#B62A35]" />
                        <span>Become a Member</span>
                      </Link>
                      <Link
                        href="/register?role=volunteer"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#A6772A]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#A6772A]" />
                        <span>Join as Volunteer</span>
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg border border-[#B62A35] text-[#B62A35] hover:bg-[#B62A35] hover:text-white transition-all shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Portal Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive ? 'bg-[#B62A35] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{user.name}</div>
                      <span className={`text-[9px] uppercase px-1 rounded font-bold ${getRoleBadge(user.role).color}`}>
                        {getRoleBadge(user.role).text}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Log out
                  </button>
                </div>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-xs text-slate-600 font-semibold py-1.5 border border-slate-200 rounded-lg hover:bg-white"
                >
                  View Public Guest Site
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/register?role=member"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1 py-2 text-center text-xs font-bold bg-[#F1AD1A] text-slate-950 rounded-lg shadow-xs"
                  >
                    <Users className="w-3 h-3" />
                    <span>Be a Member</span>
                  </Link>
                  <Link
                    href="/register?role=volunteer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1 py-2 text-center text-xs font-bold bg-amber-500 text-white rounded-lg shadow-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Join Volunteer</span>
                  </Link>
                </div>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-center text-xs font-bold bg-[#B62A35] text-white rounded-lg shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Portal Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
