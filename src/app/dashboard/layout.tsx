import React from "react";

export const metadata = {
  title: "Cellar Dashboard | Magnum Liquors",
  description: "Executive Store Operations & Orders Management Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f7f6] text-[#18181b] font-dashboard antialiased selection:bg-[#006039] selection:text-white">
      {children}
    </div>
  );
}
