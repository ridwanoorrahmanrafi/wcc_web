'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  PlusCircle,
  FileText,
  Activity,
  CreditCard,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Receipt,
  UserCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';

export default function FinanceDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinance() {
      try {
        const res = await api.getFinanceDashboard();
        setData(res);
      } catch (err) {
        console.error('Error fetching finance dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFinance();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-500">Loading financial intelligence dashboard...</p>
      </div>
    );
  }

  const navCards = [
    {
      title: 'Central Ledger',
      desc: 'Master chronological double-entry transaction record.',
      href: '/finance/transactions',
      icon: FileText,
      color: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Activity Accounts',
      desc: 'Event & health camp budgets and statements.',
      href: '/finance/activities',
      icon: Activity,
      color: 'bg-emerald-50 text-emerald-700'
    },
    {
      title: 'Member Claims',
      desc: 'Reimbursement workflows with zero double-counting.',
      href: '/finance/reimbursements',
      icon: UserCheck,
      color: 'bg-purple-50 text-purple-700'
    },
    {
      title: 'Field Advances',
      desc: 'Operational requisitions & settlement reconciler.',
      href: '/finance/advances',
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-700'
    },
    {
      title: 'Vaults & Banks',
      desc: 'Cash in hand, BRAC, DBBL, bKash & Nagad accounts.',
      href: '/finance/accounts',
      icon: Building,
      color: 'bg-rose-50 text-rose-700'
    },
    {
      title: 'Expenses & Bills',
      desc: 'Itemized operational and activity outflows.',
      href: '/finance/expenses',
      icon: Receipt,
      color: 'bg-slate-100 text-slate-700'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finance & Accounting</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#A6772A]/15 text-[#A6772A]">
              Live Double-Entry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            We Can Change (WCC) Executive Treasury & Activity-Based Cost Accounting System.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/finance/transactions"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Transaction</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Liquidity</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            ৳ {(data?.totalLiquidity || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400">Available across all cash vaults & bank accounts</p>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inflows</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-blue-600">
            ৳ {(data?.totalIncome || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400">Grants, donor support & membership fees</p>
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incurred Outflows</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#B62A35] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#B62A35]">
            ৳ {(data?.totalExpense || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400">Field camps, materials & operational expenses</p>
        </div>

        {/* Pending Claims */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Claims</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-600">
            ৳ {(data?.pendingClaims || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400">Unsettled personal member expense claims</p>
        </div>
      </div>

      {/* Sub-module Navigation Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Financial Sub-Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-[#B62A35]/30 transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#B62A35] group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#B62A35] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Accounts Liquidity & Category Spend Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Accounts Summary */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Vaults & Bank Balances</h3>
            <Link href="/finance/accounts" className="text-xs font-bold text-[#B62A35] hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.accountsSummary || []).map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{acc.name}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{acc.type}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-slate-900">৳ {acc.balance.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Spend Distribution */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Expense Allocation by Category</h3>
            <span className="text-xs text-slate-400 font-medium">Categorized Outflows</span>
          </div>

          <div className="space-y-3">
            {Object.entries(data?.categorySpend || {}).map(([cat, amount]) => {
              const totalExp = data?.totalExpense || 1;
              const percent = Math.round((amount / totalExp) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{cat}</span>
                    <span className="text-slate-900 font-mono">
                      ৳ {amount.toLocaleString()} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#B62A35] to-[#E08A00] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Chronological Ledger Strip */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Double-Entry Transactions</h3>
            <p className="text-xs text-slate-400">Master chronological ledger activity</p>
          </div>
          <Link href="/finance/transactions" className="text-xs font-bold text-[#B62A35] hover:underline">
            View Full Ledger →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.recentTransactions || []).map((txn) => {
                const isIncome = txn.type === 'Income';
                return (
                  <tr key={txn.transactionId || txn._id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{txn.date}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isIncome ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{txn.description}</div>
                      <div className="text-[10px] text-slate-400">{txn.category}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{txn.accountName || 'Cash Vault'}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-bold ${
                        isIncome ? 'text-blue-600' : 'text-[#B62A35]'
                      }`}
                    >
                      {isIncome ? '+' : '-'} ৳ {txn.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={txn.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
