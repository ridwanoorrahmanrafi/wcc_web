'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Wallet,
  Receipt
} from 'lucide-react';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const [newTxn, setNewTxn] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Expense',
    category: 'Food & Refreshment',
    description: '',
    amount: '',
    paymentMethod: 'Cash',
    accountId: '',
    accountName: '',
    paidBy: '',
    receivedFrom: '',
    referenceNo: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [txns, accs] = await Promise.all([
        api.getTransactions({ type: typeFilter, category: categoryFilter }),
        api.getAccounts()
      ]);
      setTransactions(txns || []);
      setAccounts(accs || []);
      if (accs.length > 0 && !newTxn.accountId) {
        setNewTxn((prev) => ({
          ...prev,
          accountId: accs[0].accountId,
          accountName: accs[0].name
        }));
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, categoryFilter]);

  const handleCreateTxn = async (e) => {
    e.preventDefault();
    if (!newTxn.description || !newTxn.amount) {
      alert('Description and amount are required.');
      return;
    }

    try {
      await api.createTransaction({
        ...newTxn,
        amount: Number(newTxn.amount)
      });
      alert('Transaction recorded in master ledger!');
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error recording transaction: ' + err.message);
    }
  };

  const filtered = transactions.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (t.description && t.description.toLowerCase().includes(s)) ||
      (t.category && t.category.toLowerCase().includes(s)) ||
      (t.transactionId && t.transactionId.toLowerCase().includes(s)) ||
      (t.paidBy && t.paidBy.toLowerCase().includes(s)) ||
      (t.receivedFrom && t.receivedFrom.toLowerCase().includes(s))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/finance" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Master Central Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B62A35]/10 text-[#B62A35]">
              {filtered.length} Entries
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chronological immutable record of all organizational inflows, outflows, and adjustments.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, payee, donor, or transaction ID..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#B62A35]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Transaction Types</option>
              <option value="Income">Income (Inflow)</option>
              <option value="Expense">Expense (Outflow)</option>
              <option value="Member Reimbursement">Member Reimbursement</option>
              <option value="Member Advance">Member Advance</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Categories</option>
              <option value="Donation">Donation</option>
              <option value="Project Grant">Project Grant</option>
              <option value="Purchase">Purchase / Supplies</option>
              <option value="Medical Supplies">Medical Supplies</option>
              <option value="Transportation">Transportation</option>
              <option value="Food & Refreshment">Food & Refreshment</option>
              <option value="Printing & Stationery">Printing & Stationery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading ledger transactions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">No transactions recorded</h3>
          <p className="text-xs text-slate-400">Record your first entry using the button above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Txn ID / Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description & Party</th>
                  <th className="py-3 px-4">Account / Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => {
                  const isIncome = t.type === 'Income';
                  return (
                    <tr key={t.transactionId || t._id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-800">{t.transactionId}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{t.date}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isIncome ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700">{t.category}</td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 leading-snug">{t.description}</div>
                        {(t.paidBy || t.receivedFrom || t.vendorOrMember) && (
                          <div className="text-[11px] text-slate-500">
                            Party: {t.paidBy || t.receivedFrom || t.vendorOrMember}
                          </div>
                        )}
                        {t.referenceNo && (
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {t.referenceNo}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div>{t.accountName || 'Cash Vault'}</div>
                        <span className="text-[10px] text-slate-400 font-semibold">{t.paymentMethod}</span>
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                          isIncome ? 'text-blue-600' : 'text-[#B62A35]'
                        }`}
                      >
                        {isIncome ? '+' : '-'} ৳ {(t.amount || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={t.status || 'Paid'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Record New Ledger Entry
            </h3>

            <form onSubmit={handleCreateTxn} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Type</label>
                  <select
                    value={newTxn.type}
                    onChange={(e) => setNewTxn({ ...newTxn, type: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Expense">Expense (Outflow)</option>
                    <option value="Income">Income (Inflow)</option>
                    <option value="Member Reimbursement">Member Reimbursement</option>
                    <option value="Member Advance">Member Advance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newTxn.date}
                    onChange={(e) => setNewTxn({ ...newTxn, date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newTxn.category}
                    onChange={(e) => setNewTxn({ ...newTxn, category: e.target.value })}
                    placeholder="e.g. Medical Supplies, Donation..."
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (BDT) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newTxn.amount}
                    onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })}
                    placeholder="৳ Amount"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newTxn.description}
                  onChange={(e) => setNewTxn({ ...newTxn, description: e.target.value })}
                  placeholder="Details of expense, project name, or purpose..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account</label>
                  <select
                    value={newTxn.accountId}
                    onChange={(e) => {
                      const sel = accounts.find((a) => a.accountId === e.target.value);
                      setNewTxn({
                        ...newTxn,
                        accountId: e.target.value,
                        accountName: sel ? sel.name : ''
                      });
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.accountId} value={acc.accountId}>
                        {acc.name} (৳ {acc.currentBalance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={newTxn.paymentMethod}
                    onChange={(e) => setNewTxn({ ...newTxn, paymentMethod: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payee / Donor Name</label>
                  <input
                    type="text"
                    value={newTxn.type === 'Income' ? newTxn.receivedFrom : newTxn.paidBy}
                    onChange={(e) => {
                      if (newTxn.type === 'Income') {
                        setNewTxn({ ...newTxn, receivedFrom: e.target.value });
                      } else {
                        setNewTxn({ ...newTxn, paidBy: e.target.value });
                      }
                    }}
                    placeholder="Person or vendor name"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference / Voucher No</label>
                  <input
                    type="text"
                    value={newTxn.referenceNo}
                    onChange={(e) => setNewTxn({ ...newTxn, referenceNo: e.target.value })}
                    placeholder="e.g. VCH-0012"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
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
                  Save to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
