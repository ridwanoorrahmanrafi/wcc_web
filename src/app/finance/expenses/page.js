'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Receipt,
  Plus,
  Search,
  Calendar,
  DollarSign
} from 'lucide-react';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const [newExp, setNewExp] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food & Refreshment',
    description: '',
    amount: '',
    paymentMethod: 'Cash',
    accountId: '',
    accountName: '',
    paidBy: '',
    vendorOrMember: '',
    isPersonalExpense: false,
    remarks: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [expList, accs] = await Promise.all([
        api.getExpenses(),
        api.getAccounts()
      ]);
      setExpenses(expList || []);
      setAccounts(accs || []);
      if (accs.length > 0 && !newExp.accountId) {
        setNewExp((prev) => ({
          ...prev,
          accountId: accs[0].accountId,
          accountName: accs[0].name
        }));
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!newExp.description || !newExp.amount) {
      alert('Description and amount are required.');
      return;
    }

    try {
      await api.createExpense({
        ...newExp,
        amount: Number(newExp.amount)
      });
      alert('Expense recorded successfully!');
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error recording expense: ' + err.message);
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/finance" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Expense Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              ৳ {totalExpenseAmount.toLocaleString()} Total Outflows
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Itemized records of all operational, event, and administrative disbursements.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading expenses...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">No expenses recorded</h3>
          <p className="text-xs text-slate-400">Record an expense using the button above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Date & ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description & Activity</th>
                  <th className="py-3 px-4">Paid By / Vendor</th>
                  <th className="py-3 px-4">Account / Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.expenseId || e._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800">{e.expenseId}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{e.date}</div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">{e.category}</td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 leading-snug">{e.description}</div>
                      {e.activityName && (
                        <span className="text-[10px] text-[#B62A35] block">{e.activityName}</span>
                      )}
                      {e.isPersonalExpense && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200">
                          Personal Expense Claim
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{e.paidBy || e.vendorOrMember || 'General'}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{e.accountName || 'Cash Vault'}</div>
                      <span className="text-[10px] text-slate-400 font-semibold">{e.paymentMethod}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-[#B62A35]">
                      ৳ {(e.amount || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={e.status || 'Paid'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Record Operational Expense
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newExp.date}
                    onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (BDT) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newExp.amount}
                    onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                    placeholder="৳ Amount"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newExp.category}
                  onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="Food & Refreshment">Food & Refreshment</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Purchase">Purchase / Materials</option>
                  <option value="Medical Supplies">Medical Supplies</option>
                  <option value="Printing & Stationery">Printing & Stationery</option>
                  <option value="Venue">Venue</option>
                  <option value="Honorarium">Honorarium</option>
                  <option value="Logistics">Logistics</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Bill Details *</label>
                <textarea
                  rows={2}
                  required
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  placeholder="Items purchased, invoice number, or vendor details..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid From Account</label>
                  <select
                    value={newExp.accountId}
                    onChange={(e) => {
                      const sel = accounts.find((a) => a.accountId === e.target.value);
                      setNewExp({
                        ...newExp,
                        accountId: e.target.value,
                        accountName: sel ? sel.name : ''
                      });
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.accountId} value={acc.accountId}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={newExp.paymentMethod}
                    onChange={(e) => setNewExp({ ...newExp, paymentMethod: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPersonal"
                  checked={newExp.isPersonalExpense}
                  onChange={(e) => setNewExp({ ...newExp, isPersonalExpense: e.target.checked })}
                  className="w-4 h-4 rounded text-[#B62A35]"
                />
                <label htmlFor="isPersonal" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Spent from Member's Personal Money (Create Reimbursement Claim)
                </label>
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
