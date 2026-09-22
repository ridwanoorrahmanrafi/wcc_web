export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();

  let colorClasses = 'bg-gray-100 text-gray-700 border-gray-200';

  if (normalized === 'active' || normalized === 'paid' || normalized === 'completed' || normalized === 'verified') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'pending' || normalized === 'submitted' || normalized === 'pending reimbursement') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized === 'approved') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (normalized === 'inactive' || normalized === 'closed' || normalized === 'cancelled' || normalized === 'rejected') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (normalized === 'issued') {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status || 'Unknown'}
    </span>
  );
}
