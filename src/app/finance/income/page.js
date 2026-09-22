'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  ArrowDownRight,
  HeartHandshake,
  DollarSign
} from 'lucide-react';
import { api } from '@/lib/api';

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const [newInc, setNewInc] = useState({
    date: new Date().toISOString().split('T')[0],
    incomeType: 'Donation',
    sourceOrDonor: '',
    amount: '',
    paymentMethod: 'Bank Transfer',
    accountId: '',
    accountName: '',
    referenceNo: '',
    remarks: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [incList, accs] = await Promise.all([
        api.getIncome(),
        api.getAccounts()
      ]);
      setIncomes(incList || []);
      setAccounts(accs || []);
      if (accs.length > 0 && !newInc.accountId) {
        setNewInc((prev) => ({
          ...prev,
          accountId: accs[0].accountId,
          accountName: accs[0].name
        }));
      }
    } catch (err) {
      console.error('Error fetching income:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateIncome = async (e) => {
    e.preventDefault();
    if (!newInc.sourceOrDonor || !newInc.amount) {
      alert('Donor name and amount are required.');
      return;
    }

    try {
      await api.createIncome({
        ...newInc,
        amount: Number(newInc.amount)
      });
      alert('Inflow recorded successfully!');
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error recording income: ' + err.message);
    }
  };

  const totalInflows = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/finance" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Income & Donations</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              ৳ {totalInflows.toLocaleString()} Total Inflows
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking grants, donor contributions, event sponsorships, and collected membership fees.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Inflow</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading inflows...</p>
        </div>
      ) : incomes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">No income records</h3>
          <p className="text-xs text-slate-400">Record a donation or grant using the button above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Date & ID</th>
                  <th className="py-3 px-4">Inflow Type</th>
                  <th className="py-3 px-4">Source / Donor Name</th>
                  <th className="py-3 px-4">Destination Account</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.map((inc) => (
                  <tr key={inc.incomeId || inc._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800">{inc.incomeId}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{inc.date}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {inc.incomeType}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 leading-snug">{inc.sourceOrDonor}</div>
                      {inc.remarks && <div className="text-[11px] text-slate-400">{inc.remarks}</div>}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div>{inc.accountName || 'Main Bank Account'}</div>
                      {inc.referenceNo && (
                        <div className="text-[10px] text-slate-400 font-mono">Ref: {inc.referenceNo}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">{inc.paymentMethod}</td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-blue-600">
                      + ৳ {(inc.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Inflow Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Record Inflow / Donation
            </h3>

            <form onSubmit={handleCreateIncome} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newInc.date}
                    onChange={(e) => setNewInc({ ...newInc, date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inflow Type</label>
                  <select
                    value={newInc.incomeType}
                    onChange={(e) => setNewInc({ ...newInc, incomeType: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Donation">Donation</option>
                    <option value="Project Grant">Project Grant</option>
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="Membership Fee">Membership Fee</option>
                    <option value="Event Contribution">Event Contribution</option>
                    <option value="Other Income">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source / Donor Name *</label>
                <input
                  type="text"
                  required
                  value={newInc.sourceOrDonor}
                  onChange={(e) => setNewInc({ ...newInc, sourceOrDonor: e.target.value })}
                  placeholder="Donor Name, Organization, or Foundation"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (BDT) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newInc.amount}
                  onChange={(e) => setNewInc({ ...newInc, amount: e.target.value })}
                  placeholder="৳ Amount in BDT"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deposit To Account</label>
                  <select
                    value={newInc.accountId}
                    onChange={(e) => {
                      const sel = accounts.find((a) => a.accountId === e.target.value);
                      setNewInc({
                        ...newInc,
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
                    value={newInc.paymentMethod}
                    onChange={(e) => setNewInc({ ...newInc, paymentMethod: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cash">Cash in Hand</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  value={newInc.remarks}
                  onChange={(e) => setNewInc({ ...newInc, remarks: e.target.value })}
                  placeholder="e.g. For Winter Drive 2026"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
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
                  Save Inflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
