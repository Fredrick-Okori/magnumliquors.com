import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Login | Magnum Cellar Ops",
  description: "Sign in to access Magnum Fine Wine & Spirits Store Operations.",
};

export default function DashboardLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-white font-sans text-[#18181b] antialiased">
      {children}
    </div>
  );
}

