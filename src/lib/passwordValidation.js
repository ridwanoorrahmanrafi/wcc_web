/**
 * Password complexity validation helper for WCC Frontend
 * Enforces:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one numeric character (0-9)
 * - At least one special character (!@#$%^&*...)
 */

export const checkPasswordRequirements = (password = '') => {
  const str = String(password || '');
  return {
    minLength: str.length >= 8,
    hasUpper: /[A-Z]/.test(str),
    hasLower: /[a-z]/.test(str),
    hasNumber: /[0-9]/.test(str),
    hasSpecial: /[^A-Za-z0-9]/.test(str),
    get isValid() {
      return this.minLength && this.hasUpper && this.hasLower && this.hasNumber && this.hasSpecial;
    }
  };
};

export function PasswordRequirementsList({ password = '', isBn = false }) {
  if (!password) return null;

  const reqs = checkPasswordRequirements(password);

  const items = [
    { label: isBn ? 'কমপক্ষে ৮টি অক্ষর' : 'At least 8 characters', met: reqs.minLength },
    { label: isBn ? 'বড় হাতের অক্ষর (A-Z)' : 'Uppercase letter (A-Z)', met: reqs.hasUpper },
    { label: isBn ? 'ছোট হাতের অক্ষর (a-z)' : 'Lowercase letter (a-z)', met: reqs.hasLower },
    { label: isBn ? 'সংখ্যা (0-9)' : 'Numeric digit (0-9)', met: reqs.hasNumber },
    { label: isBn ? 'বিশেষ চিহ্ন (!@#$...)' : 'Special character (!@#$... )', met: reqs.hasSpecial },
  ];

  return (
    <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] transition-all">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700">
          {isBn ? 'পাসওয়ার্ডের নিরাপত্তা শর্তসমূহ:' : 'Password Requirements:'}
        </span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${reqs.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {reqs.isValid ? (isBn ? 'শক্তিশালী ✓' : 'Strong ✓') : (isBn ? 'অসম্পূর্ণ' : 'Incomplete')}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              item.met ? 'text-emerald-700 font-medium' : 'text-slate-500'
            }`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full transition-colors ${
                item.met ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

