'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewMemberPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [wings, setWings] = useState([]);

  useEffect(() => {
    async function loadWings() {
      try {
        const data = await api.getWings();
        if (Array.isArray(data) && data.length > 0) {
          const names = data.map((w) => w.nameBn);
          setWings(names);
          setFormData((prev) => ({ ...prev, wing: names[0] || 'শিক্ষা উইং' }));
        }
      } catch (err) {
        console.error('Failed to load wings for new member:', err);
      }
    }
    loadWings();
  }, []);

  const [formData, setFormData] = useState({
    nameBn: '',
    nameEn: '',
    dob: '',
    father: '',
    mother: '',
    nidBrn: '',
    blood: 'B+',
    mobile: '',
    email: '',
    presentAddress: '',
    permanentAddress: '',
    district: 'ঝালকাঠি',
    upazila: 'ঝালকাঠি সদর',
    currentlyStudying: 'না',
    classYear: '',
    currentInstitution: '',
    lastPublicExam: 'HSC / সমমান',
    publicExamResult: '',
    lastQualification: '',
    lastResult: '',
    lastInstitution: '',
    profession: '',
    workplace: '',
    membership: 'General',
    wing: 'শিক্ষা উইং',
    reason: '',
    photoUrl: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nameBn || !formData.nameEn || !formData.mobile) {
      setError('দয়া করে নাম (বাংলা ও ইংরেজি) এবং মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createMember(formData);
      alert('সদস্য আবেদন সফলভাবে গ্রহণ করা হয়েছে!');
      router.push(`/members/${res.member.memberId}`);
    } catch (err) {
      setError(err.message || 'Error submitting membership application');
    } finally {
      setSubmitting(false);
    }
  };


  const upazilas = ['ঝালকাঠি সদর', 'নলছিটি', 'রাজাপুর', 'কাঠালিয়া'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#B62A35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-[#B62A35]">
            <UserPlus className="w-6 h-6" />
            <h1 className="text-xl font-black text-slate-900">Member Registration Form</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            উই ক্যান চেঞ্জ (WCC) সদস্যপদ নিবন্ধন ফরম (ঝালকাঠি জেলা)
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              ১. ব্যক্তিগত তথ্য (Personal Information)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পূর্ণ নাম (বাংলায়) *
                </label>
                <input
                  type="text"
                  name="nameBn"
                  required
                  value={formData.nameBn}
                  onChange={handleChange}
                  placeholder="যেমন: তানভীর আহমেদ চৌধুরী"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (English in Capital) *
                </label>
                <input
                  type="text"
                  name="nameEn"
                  required
                  value={formData.nameEn}
                  onChange={handleChange}
                  placeholder="e.g. TANVIR AHMED CHOWDHURY"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  জন্ম তারিখ (Date of Birth)
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  রক্তের গ্রুপ (Blood Group)
                </label>
                <select
                  name="blood"
                  value={formData.blood}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পিতার নাম (Father's Name)
                </label>
                <input
                  type="text"
                  name="father"
                  value={formData.father}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মাতার নাম (Mother's Name)
                </label>
                <input
                  type="text"
                  name="mother"
                  value={formData.mother}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নম্বর (NID / BRN)
                </label>
                <input
                  type="text"
                  name="nidBrn"
                  value={formData.nidBrn}
                  onChange={handleChange}
                  placeholder="NID or Birth Certificate No"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মোবাইল নম্বর (Mobile Number) *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="017xxxxxxxx"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ইমেইল ঠিকানা (Email Address)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              ২. ঠিকানার বিবরণ (Address Details)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বর্তমান ঠিকানা (Present Address)
                </label>
                <textarea
                  name="presentAddress"
                  rows={2}
                  value={formData.presentAddress}
                  onChange={handleChange}
                  placeholder="বাসা নং, রোড, এলাকা/গ্রাম..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  স্থায়ী ঠিকানা (Permanent Address)
                </label>
                <textarea
                  name="permanentAddress"
                  rows={2}
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  উপজেলা (Upazila)
                </label>
                <select
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                >
                  {upazilas.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  জেলা (District)
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Education & Career */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              ৩. শিক্ষা ও পেশা (Education & Profession)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বর্তমানে কি শিক্ষার্থী?
                </label>
                <select
                  name="currentlyStudying"
                  value={formData.currentlyStudying}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                >
                  <option value="হ্যাঁ">হ্যাঁ (Yes)</option>
                  <option value="না">না (No)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  শ্রেণি / বর্ষ (Class / Year)
                </label>
                <input
                  type="text"
                  name="classYear"
                  value={formData.classYear}
                  onChange={handleChange}
                  placeholder="e.g. 3rd Year (BBA)"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বর্তমান শিক্ষা প্রতিষ্ঠান
                </label>
                <input
                  type="text"
                  name="currentInstitution"
                  value={formData.currentInstitution}
                  onChange={handleChange}
                  placeholder="College / University"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পেশা (Profession)
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="e.g. সফটওয়্যার ইঞ্জিনিয়ার"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  কর্মস্থল / প্রতিষ্ঠান (Workplace)
                </label>
                <input
                  type="text"
                  name="workplace"
                  value={formData.workplace}
                  onChange={handleChange}
                  placeholder="Company / Institution Name"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 4: WCC Affiliation */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              ৪. উই ক্যান চেঞ্জ (WCC) সংশ্লিষ্টতা
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পছন্দের উইং (Preferred Wing)
                </label>
                <select
                  name="wing"
                  value={formData.wing}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                >
                  {wings.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সদস্যপদের ধরন (Membership Category)
                </label>
                <select
                  name="membership"
                  value={formData.membership}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                >
                  <option value="General">General Member</option>
                  <option value="Lifetime">Lifetime Member</option>
                  <option value="Donor">Donor Member</option>
                  <option value="Executive">Executive Member</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সংগঠনে যুক্ত হওয়ার কারণ / উদ্দেশ্য (Reason for Joining)
                </label>
                <textarea
                  name="reason"
                  rows={3}
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="আপনি কীভাবে WCC-এর মাধ্যমে সমাজে ভূমিকা রাখতে চান..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  প্রোফাইল ছবির লিংক (Photo URL)
                </label>
                <input
                  type="url"
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleChange}
                  placeholder="https://... (Leave blank for default avatar)"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/members"
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting Application...' : 'Submit Application (নিবন্ধন সম্পন্ন করুন)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
