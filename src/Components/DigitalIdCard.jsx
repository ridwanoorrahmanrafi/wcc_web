'use client';

import { Printer, ShieldCheck, QrCode } from 'lucide-react';

export default function DigitalIdCard({ member }) {
  if (!member) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://wecanchange.org';
  const verifyUrl = `${origin}/verify?id=${encodeURIComponent(member.memberId)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}&margin=4`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Printable ID Card Container */}
      <div className="printable-card w-full max-w-[420px] rounded-2xl overflow-hidden shadow-xl border-2 border-[#F1AD1A] bg-[#191D24] text-white relative">
        {/* Card Header Strip */}
        <div className="bg-gradient-to-r from-[#B62A35] via-[#8B1E27] to-[#1D3557] px-5 py-3.5 flex items-center justify-between border-b border-[#F1AD1A]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow-xs shrink-0 overflow-hidden border border-[#F1AD1A]">
              <img
                src="/wcc_logo.png"
                alt="WCC Emblem"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-black text-sm tracking-tight text-white leading-tight">
                WE CAN CHANGE (WCC)
              </h4>
              <p className="text-[10px] text-[#F1AD1A] font-semibold tracking-wider">
                MEMBERSHIP IDENTITY CARD
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black px-2 py-0.5 rounded bg-[#F1AD1A] text-slate-950 uppercase tracking-wider">
            {member.membership || 'General'}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col items-center text-center relative">
          {/* Watermark Logo Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <img src="/wcc_logo.png" alt="watermark" className="w-48 h-48 object-contain" />
          </div>

          {/* Member Photo with verified check */}
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#F1AD1A] shadow-md bg-slate-800">
              <img
                src={member.photoUrl || '/default-avatar.svg'}
                alt={member.nameEn}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/default-avatar.svg';
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full p-1 border-2 border-[#191D24] shadow">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Member Name */}
          <h3 className="font-bold text-lg text-white leading-snug">
            {member.nameEn}
          </h3>
          <p className="text-sm font-medium text-[#F1AD1A] mb-1">
            {member.nameBn}
          </p>

          {/* Member ID Badge */}
          <div className="inline-block bg-[#2A303C] border border-[#F1AD1A]/40 rounded-md px-3 py-1 mb-4">
            <span className="text-xs font-mono font-bold tracking-wider text-white">
              ID: {member.memberId}
            </span>
          </div>

          {/* Key Attributes Grid */}
          <div className="w-full grid grid-cols-2 gap-2 text-left bg-[#202530] p-3 rounded-lg border border-slate-800 text-xs mb-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Wing</span>
              <span className="font-semibold text-slate-200 truncate block">{member.wing || 'সাধারণ উইং'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Blood Group</span>
              <span className="font-bold text-rose-400 block">{member.blood || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Profession</span>
              <span className="font-semibold text-slate-200 truncate block">{member.profession || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status</span>
              <span className="font-bold text-emerald-400 block">{member.status || 'Active'}</span>
            </div>
          </div>

          {/* Bottom QR Code & Verification Note */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="text-left">
              <p className="text-[10px] text-slate-400 leading-tight">Official Verification QR</p>
              <p className="text-[9px] text-slate-500">Scan to verify legitimacy</p>
              <p className="text-[9px] text-[#F1AD1A] font-semibold mt-1">Jhalokathi, Bangladesh</p>
            </div>
            <div className="w-14 h-14 bg-white p-1 rounded-md shadow shrink-0">
              <img
                src={qrUrl}
                alt="Verification QR"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print flex items-center gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save ID Card (PDF)</span>
        </button>
        <a
          href={verifyUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
        >
          <QrCode className="w-4 h-4" />
          <span>Test QR Link</span>
        </a>
      </div>
    </div>
  );
}
