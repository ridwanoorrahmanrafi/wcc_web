'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  Wallet,
  CreditCard,
  ArrowDownUp,
  Receipt,
  PieChart,
  ShieldCheck,
  Award,
  Calendar,
  Sparkles,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  FileText,
  HeartHandshake
} from 'lucide-react';

function SidebarInner({ user, collapsed, setCollapsed, onClose, isMobile }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') || '' : '';

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('wcc_token');
    localStorage.removeItem('wcc_user');
    window.location.href = '/';
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { text: 'Admin', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'volunteer':
        return { text: 'Volunteer', color: 'bg-amber-500/20 text-[#F1AD1A] border-amber-500/30' };
      case 'finance_officer':
        return { text: 'Finance', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default:
        return { text: 'Member', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
  };

  // Nav menus grouped per role
  const getNavSections = () => {
    if (user.role === 'admin' || user.role === 'finance_officer') {
      return [
        {
          title: 'CORE OVERSIGHT',
          items: [
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, href: '/dashboard' },
            { id: 'members', label: 'Member Directory', icon: Users, href: '/members' },
            { id: 'add-member', label: 'Register Member', icon: UserPlus, href: '/members/new' },
            { id: 'approvals', label: 'Pending Approvals', icon: Clock, href: '/members?status=Pending' }
          ]
        },
        {
          title: 'FINANCE & AUDIT',
          items: [
            { id: 'finance', label: 'Finance Hub', icon: Wallet, href: '/finance' },
            { id: 'accounts', label: 'Accounts & Vaults', icon: CreditCard, href: '/finance/accounts' },
            { id: 'transactions', label: 'Master Transactions', icon: ArrowDownUp, href: '/finance/transactions' },
            { id: 'reimbursements', label: 'Expense Claims', icon: Receipt, href: '/finance/reimbursements' }
          ]
        },
        {
          title: 'INTELLIGENCE & PUBLIC',
          items: [
            { id: 'analytics', label: 'Demographic Analytics', icon: PieChart, href: '/analytics' },
            { id: 'verify', label: 'Public QR Verification', icon: ShieldCheck, href: '/verify' }
          ]
        }
      ];
    }

    if (user.role === 'volunteer') {
      return [
        {
          title: 'VOLUNTEER CORPS',
          items: [
            { id: 'hub', label: 'Volunteer Hub', icon: LayoutDashboard, href: '/dashboard?tab=hub' },
            { id: 'badge', label: 'My Digital Badge', icon: Award, href: '/dashboard?tab=badge' },
            { id: 'log', label: 'Log Service Hours', icon: Clock, href: '/dashboard?tab=log' },
            { id: 'history', label: 'Service Log History', icon: FileText, href: '/dashboard?tab=history' }
          ]
        },
        {
          title: 'COMMUNITY ACTION',
          items: [
            { id: 'drives', label: 'Upcoming Drives', icon: Calendar, href: '/dashboard?tab=drives' },
            { id: 'verify', label: 'Verify Credentials', icon: ShieldCheck, href: '/verify' }
          ]
        }
      ];
    }

    // Default: Member
    return [
      {
        title: 'MY MEMBERSHIP',
        items: [
          { id: 'hub', label: 'Member Portal', icon: LayoutDashboard, href: '/dashboard?tab=hub' },
          { id: 'id-card', label: 'Official Digital ID', icon: Award, href: '/dashboard?tab=id-card' },
          { id: 'profile', label: 'Membership Profile', icon: User, href: '/dashboard?tab=profile' }
        ]
      },
      {
        title: 'SERVICES & DIRECTORY',
        items: [
          { id: 'directory', label: 'Member Directory', icon: Users, href: '/members' },
          { id: 'reimbursement', label: 'Claim Reimbursement', icon: Receipt, href: '/finance/reimbursements' },
          { id: 'verify', label: 'Verify Member ID', icon: ShieldCheck, href: '/verify' }
        ]
      }
    ];
  };

  const navSections = getNavSections();

  return (
    <aside
      className={`h-screen bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col justify-between select-none transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Navigation Container */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Branding Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 h-16">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="w-10 h-10 rounded-full bg-white p-1 border-2 border-[#F1AD1A] shrink-0 shadow-md">
              <img
                src="/landing/wcc.png"
                alt="WCC"
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-white tracking-tight">WCC PORTAL</span>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getRoleBadge(user.role).color}`}>
                    {getRoleBadge(user.role).text}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">আমরাই আনব পরিবর্তন</p>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar Collapse"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="p-3 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const itemTab = item.href.includes('tab=') ? item.href.split('tab=')[1] : '';
                const itemBase = item.href.split('?')[0];

                // Determine active state cleanly
                let isCurrent = false;
                if (itemTab) {
                  isCurrent = pathname === itemBase && currentTab === itemTab;
                } else if (item.href.includes('status=Pending')) {
                  isCurrent = pathname === '/members' && searchParams.get('status') === 'Pending';
                } else if (itemBase === '/dashboard') {
                  isCurrent = pathname === '/dashboard' && (!currentTab || currentTab === 'hub' || currentTab === 'overview') && (item.id === 'overview' || item.id === 'hub');
                } else {
                  isCurrent = pathname === itemBase;
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#B62A35] to-[#8E1A23] text-white shadow-md font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile & Actions Container */}
      <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950 shrink-0">
        {/* Quick link to Guest Site */}
        <Link
          href="/"
          onClick={onClose}
          title="View Public Guest Site"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors w-full"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#F1AD1A] shrink-0" />
          {!collapsed && <span className="truncate">Public Guest Site</span>}
        </Link>

        {/* User Profile Snippet & Logout */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#B62A35]/20 text-[#F1AD1A] border border-[#F1AD1A]/40 flex items-center justify-center shrink-0 font-bold text-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{user.name || 'User'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar(props) {
  return (
    <Suspense fallback={<div className="w-64 h-screen bg-slate-950 shrink-0" />}>
      <SidebarInner {...props} />
    </Suspense>
  );
}
