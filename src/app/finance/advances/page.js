'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  Plus,
  Scale,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';

export default function AdvancesPage() {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [settleModal, setSettleModal] = useState(null);

  const [newAdv, setNewAdv] = useState({
    memberName: '',
    memberId: 'WCC-2026-0001',
    activityName: 'Youth IT Skills & Freelancing Bootcamp 2026',
    activityId: 'WCC-ACT-2026-000018',
    purpose: '',
    advanceAmount: '',
    disbursementDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bKash',
    notes: ''
  });

  const [settleData, setSettleData] = useState({
    actualExpenseSubmitted: '',
    notes: ''
  });

  const loadAdvances = async () => {
    setLoading(true);
    try {
      const data = await api.getAdvances();
      setAdvances(data || []);
    } catch (err) {
      console.error('Error fetching advances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvances();
  }, []);

  const handleCreateAdvance = async (e) => {
    e.preventDefault();
    if (!newAdv.memberName || !newAdv.purpose || !newAdv.advanceAmount) {
      alert('Member name, purpose, and advance amount are required.');
      return;
    }

    try {
      await api.createAdvance({
        ...newAdv,
        advanceAmount: Number(newAdv.advanceAmount)
      });
      alert('Operational advance issued successfully!');
      setModalOpen(false);
      loadAdvances();
    } catch (err) {
      alert('Error creating advance: ' + err.message);
    }
  };

  const handleSettleSubmit = async (e) => {
    e.preventDefault();
    if (!settleModal || !settleData.actualExpenseSubmitted) return;

    try {
      await api.settleAdvance(settleModal.advanceId, {
        actualExpenseSubmitted: Number(settleData.actualExpenseSubmitted),
        notes: settleData.notes
      });
      alert('Advance settled and reconciled successfully!');
      setSettleModal(null);
      loadAdvances();
    } catch (err) {
      alert('Error settling advance: ' + err.message);
    }
  };

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
              Operational Field Advances & Settlement
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {advances.length} Requisitions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking field operational funds and automatically computing refund balances or additional reimbursements.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Advance</span>
        </button>
      </div>

      {/* Advances Table */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading field advances...</p>
        </div>
      ) : advances.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">No operational advances issued</h3>
          <p className="text-xs text-slate-400">Issue an advance for field activities using the button above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Advance ID</th>
                  <th className="py-3 px-4">Member Lead</th>
                  <th className="py-3 px-4">Activity & Purpose</th>
                  <th className="py-3 px-4 text-right">Advance Amount</th>
                  <th className="py-3 px-4 text-right">Actual Spent</th>
                  <th className="py-3 px-4 text-center">Settlement Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {advances.map((a) => (
                  <tr key={a.advanceId || a._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800">{a.advanceId}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{a.disbursementDate}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{a.memberName}</div>
                      <span className="font-mono text-[10px] text-slate-400">{a.memberId}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{a.purpose}</div>
                      <span className="text-[10px] text-[#B62A35] block">{a.activityName}</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ৳ {(a.advanceAmount || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-600">
                      {a.actualExpenseSubmitted ? `৳ ${a.actualExpenseSubmitted.toLocaleString()}` : 'Pending'}
                    </td>

                    <td className="py-3 px-4 text-center space-y-0.5">
                      <StatusBadge status={a.status} />
                      {a.settlementType && a.settlementType !== 'Pending' && (
                        <div className="text-[10px] text-slate-500 font-semibold">{a.settlementType}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {a.status === 'Issued' ? (
                        <button
                          onClick={() => {
                            setSettleModal(a);
                            setSettleData({ actualExpenseSubmitted: '', notes: '' });
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-[11px] shadow-xs transition-colors ml-auto"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>Reconcile</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settle Modal */}
      {settleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Advance Settlement & Reconciliation
            </h3>

            <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs">
              <p>
                Lead: <strong className="text-slate-800">{settleModal.memberName}</strong>
              </p>
              <p>
                Advance Given: <strong className="text-slate-900 font-mono">৳ {settleModal.advanceAmount.toLocaleString()}</strong>
              </p>
              <p className="text-[11px] text-slate-500">Activity: {settleModal.activityName}</p>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Actual Expense Submitted (With Receipts) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={settleData.actualExpenseSubmitted}
                  onChange={(e) => setSettleData({ ...settleData, actualExpenseSubmitted: e.target.value })}
                  placeholder="৳ Enter verified total"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono text-sm"
                />
              </div>

              {/* Automatic Variance Feedback */}
              {settleData.actualExpenseSubmitted !== '' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  {Number(settleData.actualExpenseSubmitted) <= settleModal.advanceAmount ? (
                    <p className="text-blue-800 font-semibold">
                      Refund Due to WCC:{' '}
                      <strong className="text-emerald-700 font-mono">
                        ৳ {(settleModal.advanceAmount - Number(settleData.actualExpenseSubmitted)).toLocaleString()}
                      </strong>
                    </p>
                  ) : (
                    <p className="text-rose-800 font-semibold">
                      Additional Reimbursement Due to Member:{' '}
                      <strong className="text-rose-700 font-mono">
                        ৳ {(Number(settleData.actualExpenseSubmitted) - settleModal.advanceAmount).toLocaleString()}
                      </strong>
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Settlement Notes</label>
                <textarea
                  rows={2}
                  value={settleData.notes}
                  onChange={(e) => setSettleData({ ...settleData, notes: e.target.value })}
                  placeholder="Vouchers verified by finance officer..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettleModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-lg shadow-xs"
                >
                  Complete Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Advance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Issue Field Operational Advance
            </h3>

            <form onSubmit={handleCreateAdvance} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Member Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={newAdv.memberName}
                    onChange={(e) => setNewAdv({ ...newAdv, memberName: e.target.value })}
                    placeholder="Field Lead Name"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Advance Amount (BDT) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newAdv.advanceAmount}
                    onChange={(e) => setNewAdv({ ...newAdv, advanceAmount: e.target.value })}
                    placeholder="৳ Requisition amount"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity Name</label>
                <input
                  type="text"
                  value={newAdv.activityName}
                  onChange={(e) => setNewAdv({ ...newAdv, activityName: e.target.value })}
                  placeholder="e.g. Winter Clothes Distribution Drive"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Purpose *</label>
                <textarea
                  rows={2}
                  required
                  value={newAdv.purpose}
                  onChange={(e) => setNewAdv({ ...newAdv, purpose: e.target.value })}
                  placeholder="Reason for advance (venue rent, volunteer food, transportation)..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={newAdv.paymentMethod}
                    onChange={(e) => setNewAdv({ ...newAdv, paymentMethod: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disbursement Date</label>
                  <input
                    type="date"
                    value={newAdv.disbursementDate}
                    onChange={(e) => setNewAdv({ ...newAdv, disbursementDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
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
                  Issue Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
