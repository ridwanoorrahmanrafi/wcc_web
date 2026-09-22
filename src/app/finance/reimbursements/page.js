'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UserCheck,
  Plus,
  CheckCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';

export default function ReimbursementsPage() {
  const [claims, setClaims] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [disburseModal, setDisburseModal] = useState(null);

  const [newClaim, setNewClaim] = useState({
    memberName: '',
    memberId: 'WCC-2026-0001',
    activityName: 'WCC Free Health Camp – Jhalokathi',
    category: 'Transportation',
    description: '',
    amount: '',
    requestDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [paymentDetails, setPaymentDetails] = useState({
    paymentAccountId: '',
    paymentMethod: 'bKash',
    paymentReference: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [reims, accs] = await Promise.all([
        api.getReimbursements(),
        api.getAccounts()
      ]);
      setClaims(reims || []);
      setAccounts(accs || []);
      if (accs.length > 0 && !paymentDetails.paymentAccountId) {
        setPaymentDetails((prev) => ({ ...prev, paymentAccountId: accs[0].accountId }));
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    if (!newClaim.memberName || !newClaim.amount || !newClaim.description) {
      alert('Member name, description, and amount are required.');
      return;
    }

    try {
      await api.createReimbursement({
        ...newClaim,
        amount: Number(newClaim.amount)
      });
      alert('Reimbursement claim submitted successfully!');
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error submitting claim: ' + err.message);
    }
  };

  const handleUpdateStatus = async (claimId, newStatus) => {
    try {
      await api.updateReimbursementStatus(claimId, { approvalStatus: newStatus });
      loadData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDisbursePayout = async (e) => {
    e.preventDefault();
    if (!disburseModal) return;

    try {
      await api.updateReimbursementStatus(disburseModal.reimbursementId, {
        approvalStatus: 'Paid',
        paymentAccountId: paymentDetails.paymentAccountId,
        paymentMethod: paymentDetails.paymentMethod,
        paymentReference: paymentDetails.paymentReference,
        paymentDate: new Date().toISOString().split('T')[0]
      });
      alert('Payout disbursed and recorded!');
      setDisburseModal(null);
      loadData();
    } catch (err) {
      alert('Error disbursing payout: ' + err.message);
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
              Member Reimbursement Claims
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              {claims.length} Claims
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reimbursement liability lifecycle without double-counting organizational expenses.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Claim</span>
        </button>
      </div>

      {/* Claims Table */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading reimbursement claims...</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">No reimbursement claims</h3>
          <p className="text-xs text-slate-400">Submit a claim when a member spends personal money on WCC activities.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Claim ID & Date</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Activity & Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((c) => (
                  <tr key={c.reimbursementId || c._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800">{c.reimbursementId}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.requestDate}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.memberName}</div>
                      <span className="font-mono text-[10px] text-slate-400">{c.memberId}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{c.description}</div>
                      <span className="text-[10px] text-[#B62A35] block">{c.activityName}</span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">{c.category || 'General'}</td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-slate-900">
                      ৳ {(c.amount || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={c.approvalStatus} />
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5">
                      {c.approvalStatus === 'Submitted' && (
                        <button
                          onClick={() => handleUpdateStatus(c.reimbursementId, 'Verified')}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-bold transition-colors"
                        >
                          Verify
                        </button>
                      )}

                      {c.approvalStatus === 'Verified' && (
                        <button
                          onClick={() => handleUpdateStatus(c.reimbursementId, 'Approved')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold transition-colors"
                        >
                          Approve
                        </button>
                      )}

                      {c.approvalStatus === 'Approved' && (
                        <button
                          onClick={() => setDisburseModal(c)}
                          className="px-2.5 py-1 bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded text-[11px] font-bold shadow-xs transition-colors"
                        >
                          Disburse Payout
                        </button>
                      )}

                      {c.approvalStatus === 'Paid' && (
                        <span className="text-[11px] text-slate-400 font-semibold italic">Disbursed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disburse Payout Modal */}
      {disburseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Disburse Reimbursement Payout
            </h3>

            <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
              <p>
                Payee: <strong className="text-slate-900">{disburseModal.memberName}</strong>
              </p>
              <p>
                Amount Due: <strong className="text-[#B62A35] font-mono">৳ {disburseModal.amount.toLocaleString()}</strong>
              </p>
              <p className="text-[11px] text-slate-500">For: {disburseModal.description}</p>
            </div>

            <form onSubmit={handleDisbursePayout} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disburse From Account *</label>
                <select
                  required
                  value={paymentDetails.paymentAccountId}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentAccountId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  {accounts.map((acc) => (
                    <option key={acc.accountId} value={acc.accountId}>
                      {acc.name} (৳ {acc.currentBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentDetails.paymentMethod}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentMethod: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MFS / Ref No</label>
                  <input
                    type="text"
                    value={paymentDetails.paymentReference}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentReference: e.target.value })}
                    placeholder="e.g. TrxID 9921"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDisburseModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-lg shadow-xs"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Claim Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Submit Personal Expense Claim
            </h3>

            <form onSubmit={handleCreateClaim} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Member Name *</label>
                  <input
                    type="text"
                    required
                    value={newClaim.memberName}
                    onChange={(e) => setNewClaim({ ...newClaim, memberName: e.target.value })}
                    placeholder="Claimant Name"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Claim Amount (BDT) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newClaim.amount}
                    onChange={(e) => setNewClaim({ ...newClaim, amount: e.target.value })}
                    placeholder="৳ Amount"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity / Project</label>
                <input
                  type="text"
                  value={newClaim.activityName}
                  onChange={(e) => setNewClaim({ ...newClaim, activityName: e.target.value })}
                  placeholder="e.g. WCC Free Health Camp – Jhalokathi"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Bill Details *</label>
                <textarea
                  rows={2}
                  required
                  value={newClaim.description}
                  onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                  placeholder="What was purchased or spent from personal funds..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={newClaim.category}
                    onChange={(e) => setNewClaim({ ...newClaim, category: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Request Date</label>
                  <input
                    type="date"
                    value={newClaim.requestDate}
                    onChange={(e) => setNewClaim({ ...newClaim, requestDate: e.target.value })}
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
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
