'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  Plus,
  Wallet,
  CreditCard,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [newAcc, setNewAcc] = useState({
    name: '',
    accountType: 'Bank Account',
    accountNumber: '',
    bankName: '',
    branchName: '',
    openingBalance: '',
    notes: ''
  });

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.getAccounts();
      setAccounts(data || []);
    } catch (err) {
      console.error('Error loading accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!newAcc.name || !newAcc.accountType) {
      alert('Account name and type are required.');
      return;
    }

    try {
      await api.createAccount({
        ...newAcc,
        openingBalance: Number(newAcc.openingBalance) || 0
      });
      alert('Account added successfully!');
      setModalOpen(false);
      loadAccounts();
    } catch (err) {
      alert('Error creating account: ' + err.message);
    }
  };

  const getAccountIcon = (type) => {
    if (type === 'Cash') return Wallet;
    if (type === 'bKash' || type === 'Nagad' || type === 'Rocket') return Smartphone;
    return Building;
  };

  const totalLiquidity = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/finance" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Cash Vaults & Bank Accounts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              ৳ {totalLiquidity.toLocaleString()} Total Liquidity
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central repository of internal petty cash vaults, corporate bank accounts, and merchant wallets.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading accounts...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">No accounts configured</h3>
          <p className="text-xs text-slate-400">Add an internal vault or bank account using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => {
            const Icon = getAccountIcon(acc.accountType);
            return (
              <div
                key={acc.accountId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#B62A35] shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {acc.status || 'Active'}
                    </span>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-slate-400 font-bold block">{acc.accountId}</span>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">{acc.name}</h3>
                    <p className="text-xs text-[#B62A35] font-semibold">{acc.accountType}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                    {acc.bankName && (
                      <div className="text-slate-600">
                        Bank/Institution: <strong className="text-slate-800">{acc.bankName}</strong>
                      </div>
                    )}
                    {acc.accountNumber && (
                      <div className="text-slate-600 font-mono text-[11px]">
                        Account No: <strong className="text-slate-800">{acc.accountNumber}</strong>
                      </div>
                    )}
                    {acc.branchName && (
                      <div className="text-slate-500 text-[11px]">Branch: {acc.branchName}</div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Current Balance</span>
                  <span className="font-mono font-black text-lg text-slate-900">
                    ৳ {(acc.currentBalance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Add Vault or Bank Account
            </h3>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Display Name *</label>
                <input
                  type="text"
                  required
                  value={newAcc.name}
                  onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
                  placeholder="e.g. BRAC Bank Main Operational Account"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Type</label>
                  <select
                    value={newAcc.accountType}
                    onChange={(e) => setNewAcc({ ...newAcc, accountType: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Bank Account">Bank Account</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="bKash">bKash Merchant</option>
                    <option value="Nagad">Nagad Wallet</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opening Balance (BDT)</label>
                  <input
                    type="number"
                    value={newAcc.openingBalance}
                    onChange={(e) => setNewAcc({ ...newAcc, openingBalance: e.target.value })}
                    placeholder="৳ 0"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank / Institution Name</label>
                <input
                  type="text"
                  value={newAcc.bankName}
                  onChange={(e) => setNewAcc({ ...newAcc, bankName: e.target.value })}
                  placeholder="e.g. Corporate Bank PLC"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Number / Wallet ID</label>
                <input
                  type="text"
                  value={newAcc.accountNumber}
                  onChange={(e) => setNewAcc({ ...newAcc, accountNumber: e.target.value })}
                  placeholder="e.g. 1501200000001"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-lg shadow-xs"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
