"use client";

import { UserPlus, Users, ShieldCheck, Mail, Phone } from "lucide-react";

const teamMembers = [
  { name: "John Okello", role: "Head Sommelier & Manager", email: "john@magnumliquors.com", phone: "+256 772 901234", status: "Active On Shift" },
  { name: "Grace Kiconco", role: "Store Inventory Specialist", email: "grace@magnumliquors.com", phone: "+256 701 445566", status: "Active On Shift" },
  { name: "Emmanuel Ssebaana", role: "Dispatch & Express Delivery", email: "emmanuel@magnumliquors.com", phone: "+256 782 112233", status: "On Delivery" },
  { name: "Patricia Nalumansi", role: "Accounts & Cashier", email: "patricia@magnumliquors.com", phone: "+256 774 889900", status: "Off Shift" },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#18181b] tracking-tight">Staff & Team Roster</h1>
          <p className="text-xs text-[#71717a] mt-1">Manage cellar managers, sommeliers, cashiers, and dispatch personnel.</p>
        </div>

        <button className="rounded-full bg-[#b8860b] hover:bg-[#996515] px-5 py-2.5 text-xs font-bold text-white transition shadow-sm flex items-center gap-1.5 self-start sm:self-auto">
          <UserPlus size={16} /> Invite Team Member
        </button>
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member) => (
          <div key={member.name} className="rounded-3xl border border-[#e5e5e4] bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#b8860b]/10 text-[#b8860b] font-bold flex items-center justify-center text-sm">
                  {member.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#18181b]">{member.name}</h3>
                  <p className="text-xs text-[#71717a]">{member.role}</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                member.status.includes("Active") ? "bg-[#fffcf0] text-[#b8860b] border border-[#f3e5b8]" : "bg-neutral-100 text-neutral-600"
              }`}>
                {member.status}
              </span>
            </div>

            <div className="pt-3 border-t border-[#f4f4f3] space-y-1.5 text-xs text-[#71717a]">
              <p className="flex items-center gap-2">
                <Mail size={13} className="text-[#b8860b]" /> {member.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={13} className="text-[#b8860b]" /> {member.phone}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
