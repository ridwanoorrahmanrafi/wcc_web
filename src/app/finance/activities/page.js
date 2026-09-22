'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Activity,
  Plus,
  FileText,
  Calendar,
  MapPin,
  User,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
  Printer
} from 'lucide-react';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statement, setStatement] = useState(null);
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newAct, setNewAct] = useState({
    name: '',
    type: 'Health Camp',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    location: 'ঝালকাঠি',
    description: '',
    budget: '',
    responsiblePerson: '',
    notes: ''
  });

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await api.getActivities();
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleOpenStatement = async (activityId) => {
    try {
      const stmt = await api.getActivityStatement(activityId);
      setStatement(stmt);
      setStatementModalOpen(true);
    } catch (err) {
      alert('Error compiling financial statement: ' + err.message);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!newAct.name) {
      alert('Activity name is required');
      return;
    }

    try {
      await api.createActivity({
        ...newAct,
        budget: Number(newAct.budget) || 0
      });
      alert('New activity created successfully!');
      setCreateModalOpen(false);
      loadActivities();
    } catch (err) {
      alert('Error creating activity: ' + err.message);
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Activity-Based Accounting</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B62A35]/10 text-[#B62A35]">
              {activities.length} Activities
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking dedicated project budgets, actual field expenses, and comprehensive financial statements.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Activity</span>
        </button>
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading organizational activities...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">No activities found</h3>
          <p className="text-xs text-slate-400">Create your first activity container.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((act) => {
            const budget = act.budget || 0;
            const spent = act.actualExpense || 0;
            const variance = budget - spent;
            const isUnderBudget = variance >= 0;

            return (
              <div
                key={act.activityId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 font-bold block">
                        {act.activityId}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">{act.name}</h3>
                      <span className="text-[11px] font-semibold text-[#B62A35]">{act.type}</span>
                    </div>
                    <StatusBadge status={act.status} />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {act.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Responsible Lead</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {act.responsiblePerson || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Location</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {act.location || 'ঝালকাঠি'}
                      </span>
                    </div>
                  </div>

                  {/* Budget and Spent comparison */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Allocated Budget: <strong className="text-slate-800">৳ {budget.toLocaleString()}</strong>
                      </span>
                      <span className="text-slate-500">
                        Spent: <strong className="text-slate-800">৳ {spent.toLocaleString()}</strong>
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          spent > budget ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400 font-mono">
                        {act.startDate} {act.endDate ? `to ${act.endDate}` : ''}
                      </span>
                      <span
                        className={`font-semibold ${
                          isUnderBudget ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isUnderBudget ? `Surplus: ৳ ${variance.toLocaleString()}` : `Deficit: ৳ ${Math.abs(variance).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleOpenStatement(act.activityId)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-[#B62A35] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Financial Statement</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Financial Statement Modal */}
      {statementModalOpen && statement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#F1AD1A] bg-white p-0.5 shrink-0">
                  <img src="/wcc_logo.png" alt="WCC" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Official Activity Financial Statement
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    We Can Change • Activity Cost Accounting
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatementModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Statement Overview Strip */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{statement.activity.name}</h4>
                  <span className="font-mono text-xs text-slate-400 font-semibold">
                    {statement.activity.activityId} • {statement.activity.location}
                  </span>
                </div>
                <StatusBadge status={statement.activity.status} />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Allocated Budget</span>
                  <span className="font-black text-sm text-slate-900 font-mono">
                    ৳ {statement.totalBudget.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Actual Expenses</span>
                  <span className="font-black text-sm text-[#B62A35] font-mono">
                    ৳ {statement.totalSpent.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Final Variance</span>
                  <span
                    className={`font-black text-sm font-mono ${
                      statement.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    ৳ {statement.variance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Spend Distribution */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Category Expenditure Breakdown
              </h5>
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {Object.entries(statement.categoryBreakdown || {}).map(([cat, amt]) => {
                  const percent = statement.totalSpent > 0 ? Math.round((amt / statement.totalSpent) * 100) : 0;
                  return (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="font-mono font-bold text-slate-900">
                        ৳ {amt.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Itemized Expenses Ledger */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Itemized Expense Vouchers ({statement.itemizedExpenses.length})
              </h5>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Voucher / ID</th>
                      <th className="py-2.5 px-3">Category & Details</th>
                      <th className="py-2.5 px-3">Paid By / Vendor</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statement.itemizedExpenses.map((e) => (
                      <tr key={e.expenseId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{e.date}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{e.expenseId}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{e.description}</div>
                          <span className="text-[10px] text-slate-400">{e.category}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{e.paidBy || e.vendorOrMember}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ৳ {e.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-[11px] text-slate-400">Statement compiled: {statement.statementDate}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Statement</span>
                </button>
                <button
                  onClick={() => setStatementModalOpen(false)}
                  className="px-4 py-2 bg-[#B62A35] text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Activity Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Create New Activity Container
            </h3>

            <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity / Event Name *</label>
                <input
                  type="text"
                  required
                  value={newAct.name}
                  onChange={(e) => setNewAct({ ...newAct, name: e.target.value })}
                  placeholder="e.g. WCC Free Health Camp – Jhalokathi"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Activity Type</label>
                  <select
                    value={newAct.type}
                    onChange={(e) => setNewAct({ ...newAct, type: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="Health Camp">Health Camp</option>
                    <option value="Campaign">Campaign</option>
                    <option value="Training">Training / Workshop</option>
                    <option value="Meeting">Meeting / AGM</option>
                    <option value="Project">Project</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Allocated Budget (BDT)</label>
                  <input
                    type="number"
                    value={newAct.budget}
                    onChange={(e) => setNewAct({ ...newAct, budget: e.target.value })}
                    placeholder="৳ 150000"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newAct.startDate}
                    onChange={(e) => setNewAct({ ...newAct, startDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsible Person</label>
                  <input
                    type="text"
                    value={newAct.responsiblePerson}
                    onChange={(e) => setNewAct({ ...newAct, responsiblePerson: e.target.value })}
                    placeholder="Team Lead Name"
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newAct.location}
                  onChange={(e) => setNewAct({ ...newAct, location: e.target.value })}
                  placeholder="Venue or Upazila"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Goals</label>
                <textarea
                  rows={2}
                  value={newAct.description}
                  onChange={(e) => setNewAct({ ...newAct, description: e.target.value })}
                  placeholder="Summary of targets, beneficiary count..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-lg shadow-xs"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
