'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Calendar,
  Phone,
  Mail,
  Edit,
  ShieldCheck,
  Printer,
  CheckCircle,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';
import DigitalIdCard from '@/Components/DigitalIdCard';

export default function MemberProfilePage({ params }) {
  const unwrappedParams = use(params);
  const memberId = unwrappedParams.id;
  const router = useRouter();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'idcard' | 'education' | 'address'
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadMember() {
      setLoading(true);
      try {
        const data = await api.getMember(memberId);
        setMember(data);
        if (data && data.status) setSelectedStatus(data.status);
      } catch (err) {
        console.error('Failed to load member:', err);
      } finally {
        setLoading(false);
      }
    }
    if (memberId) loadMember();
  }, [memberId]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const updated = await api.updateMemberStatus(memberId, selectedStatus);
      setMember((prev) => ({ ...prev, status: selectedStatus }));
      setStatusModalOpen(false);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-500">Loading member profile...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Member not found</h2>
        <p className="text-xs text-slate-500">No member record exists for ID: {memberId}</p>
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] text-white text-xs font-bold rounded-lg shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb / Back button */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#B62A35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span>Change Status</span>
          </button>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#B62A35] via-[#8E1A23] to-[#1D3557]"></div>

        <div className="relative pt-8 flex flex-col sm:flex-row items-center sm:items-end gap-5">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 shrink-0">
            <img
              src={member.photoUrl || '/default-avatar.svg'}
              alt={member.nameEn}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/default-avatar.svg';
              }}
            />
          </div>

          {/* Profile Identity info */}
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{member.nameEn}</h1>
              <StatusBadge status={member.status} />
            </div>
            <p className="text-sm font-semibold text-[#B62A35]">{member.nameBn}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 pt-1">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                {member.memberId}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{member.wing || 'সাধারণ উইং'}</span>
              <span>•</span>
              <span>{member.membership || 'General'} Member</span>
            </div>
          </div>

          {/* Quick Contact & Blood badge */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <div className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-black">
              Blood: {member.blood || 'Unknown'}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{member.mobile}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold no-print overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 border-b-2 transition-colors shrink-0 ${
            activeTab === 'overview'
              ? 'border-[#B62A35] text-[#B62A35]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          General & Personal Details
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`pb-3 px-3 border-b-2 transition-colors shrink-0 ${
            activeTab === 'education'
              ? 'border-[#B62A35] text-[#B62A35]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Education & Address
        </button>
        <button
          onClick={() => setActiveTab('idcard')}
          className={`pb-3 px-3 border-b-2 transition-colors shrink-0 ${
            activeTab === 'idcard'
              ? 'border-[#B62A35] text-[#B62A35]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Digital ID Card & QR
        </button>
      </div>

      {/* Tab 1: Overview & Personal Details */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Identity & Personal details */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-[#B62A35]" />
              <span>Personal Information</span>
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400">Date of Birth</dt>
                <dd className="font-semibold text-slate-800 font-mono mt-0.5">{member.dob || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">NID / Birth Registration</dt>
                <dd className="font-semibold text-slate-800 font-mono mt-0.5">{member.nidBrn || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Father's Name</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{member.father || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Mother's Name</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{member.mother || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Primary Mobile</dt>
                <dd className="font-semibold text-slate-800 font-mono mt-0.5">{member.mobile}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Email Address</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{member.email || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          {/* Professional & Wing */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Briefcase className="w-4 h-4 text-[#B62A35]" />
              <span>WCC Affiliation & Career</span>
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400">Designated Wing</dt>
                <dd className="font-bold text-[#B62A35] mt-0.5">{member.wing || 'সাধারণ উইং'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Membership Tier</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{member.membership || 'General'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Profession</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{member.profession || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Workplace / Organization</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{member.workplace || 'N/A'}</dd>
              </div>
            </dl>

            {member.reason && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Reason for Joining WCC
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic">
                  "{member.reason}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Education & Address Details */}
      {activeTab === 'education' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Education Details */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <GraduationCap className="w-4 h-4 text-[#B62A35]" />
              <span>Educational Qualifications</span>
            </h3>

            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-slate-400">Currently Studying?</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">
                  {member.currentlyStudying || 'না'}
                  {member.classYear ? ` (${member.classYear})` : ''}
                </dd>
              </div>

              {member.currentInstitution && (
                <div>
                  <dt className="text-slate-400">Current Institution</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{member.currentInstitution}</dd>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <dt className="text-slate-400">Last Public Exam</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{member.lastPublicExam || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Exam Result / GPA</dt>
                  <dd className="font-bold text-slate-900 mt-0.5">{member.publicExamResult || 'N/A'}</dd>
                </div>
              </div>

              {member.lastQualification && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <dt className="text-slate-400">Higher Degree</dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">{member.lastQualification}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Degree Result / CGPA</dt>
                    <dd className="font-bold text-slate-900 mt-0.5">{member.lastResult || 'N/A'}</dd>
                  </div>
                </div>
              )}

              {member.lastInstitution && (
                <div>
                  <dt className="text-slate-400">Passing Institution</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{member.lastInstitution}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Address Details */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-[#B62A35]" />
              <span>Residential & Permanent Address</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Present Address
                </span>
                <p className="font-medium text-slate-800 leading-relaxed">
                  {member.presentAddress || 'N/A'}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Permanent Address
                </span>
                <p className="font-medium text-slate-800 leading-relaxed">
                  {member.permanentAddress || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">District</span>
                  <span className="font-bold text-slate-800">{member.district || 'ঝালকাঠি'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Upazila</span>
                  <span className="font-bold text-slate-800">{member.upazila || 'ঝালকাঠি সদর'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Digital Membership ID Card */}
      {activeTab === 'idcard' && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs flex flex-col items-center">
          <DigitalIdCard member={member} />
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900">Update Member Status</h3>
            <p className="text-xs text-slate-500">
              Change official status for <span className="font-bold text-slate-800">{member.nameEn}</span> ({member.memberId}).
            </p>

            <div className="space-y-2">
              {['Active', 'Pending', 'Inactive', 'Suspended'].map((st) => (
                <label
                  key={st}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    selectedStatus === st
                      ? 'border-[#B62A35] bg-rose-50 text-[#B62A35]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{st}</span>
                  <input
                    type="radio"
                    name="status"
                    value={st}
                    checked={selectedStatus === st}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="accent-[#B62A35]"
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={updating}
                className="px-4 py-2 text-xs font-bold bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
