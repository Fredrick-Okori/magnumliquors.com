"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, MapPin } from "lucide-react";
import { signInManagerWithSupabase } from "@/lib/supabase";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState("manager@magnum.com");
  const [loginPassword, setLoginPassword] = useState("••••••••");
  const [loginError, setLoginError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter email and password.");
      return;
    }
    setLoginError("");
    setIsAuthenticating(true);

    const { user, error } = await signInManagerWithSupabase(loginEmail, loginPassword);
    setIsAuthenticating(false);

    if (error) {
      setLoginError(error);
      return;
    }

    if (user) {
      const email = user.email || loginEmail;
      localStorage.setItem("magnum_dashboard_authenticated", "true");
      localStorage.setItem("magnum_user_email", email);
      router.push("/dashboard");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full bg-white text-[#18181b] font-sans antialiased">
      
      {/* LEFT SIDE: USER'S IMAGE BANNER */}
      <div className="hidden lg:block relative w-full h-full min-h-screen overflow-hidden bg-neutral-900">
        <img
          src="/Screenshot 2026-08-22 at 22.19.56.png"
          alt="Magnum Cellar"
          className="h-full w-full object-cover object-center"
        />
     
      </div>

      {/* RIGHT SIDE: CLEAN MINIMALIST WHITE LOGIN FORM (Matching Reference Image) */}
      <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-20 max-w-lg mx-auto w-full min-h-screen">
        
      

        {/* Center Form Area */}
        <div className="my-auto py-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold text-[#18181b] tracking-tight">
              Login
            </h2>
            <p className="text-sm text-[#52525b] font-medium">
              Log in to access store operations dashboard
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            
           

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#18181b] block">
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full h-12 rounded-xl border border-neutral-300 bg-white px-4 text-xs text-[#18181b] placeholder:text-neutral-400 outline-none focus:border-[#b8860b] focus:ring-1 focus:ring-[#b8860b] transition"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#18181b] block">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-neutral-400 font-medium hover:underline"
                >
                  Forgot password
                </button>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-12 rounded-xl border border-neutral-300 bg-white px-4 text-xs text-[#18181b] placeholder:text-neutral-400 outline-none focus:border-[#b8860b] focus:ring-1 focus:ring-[#b8860b] transition"
              />
            </div>

            {loginError && (
              <p className="text-xs font-semibold text-red-600">{loginError}</p>
            )}

            {/* Log in Primary Action Button */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full rounded-xl bg-[#b8860b] hover:bg-[#996515] py-3.5 text-xs font-bold uppercase tracking-wider text-white transition shadow-sm flex items-center justify-center gap-2 mt-4"
            >
              {isAuthenticating ? "Waiting..." : "Log in"}
            </button>
          </form>
        </div>

        {/* Bottom Footer Navigation */}
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs">
          <Link
            href="/"
            className="font-semibold text-neutral-500 hover:text-[#18181b] transition inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back to Storefront
          </Link>
          <span className="text-neutral-400 font-medium">Supabase Auth</span>
        </div>

      </div>

    </div>
  );
}

