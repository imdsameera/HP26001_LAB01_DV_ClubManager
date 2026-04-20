"use client";

import { useState, type FormEvent } from "react";
import { useRouter }                from "next/navigation";
import { Eye, EyeOff, UserPlus, ArrowRight, CheckCircle2, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [clubName, setClubName] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !clubName) { 
      setError("Please fill in all fields."); 
      return; 
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, clubName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[400px]">
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1F2332] p-10 text-center shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Registration Successful!</h1>
              <p className="mt-2 text-sm text-gray-400">
                Your club <span className="text-white font-medium">"{clubName}"</span> has been created.
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Redirecting you to the login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle existing session to prevent confusion during multi-tenant testing
  if (sessionStatus === "authenticated" && session?.user) {
    return (
      <div className="w-full max-w-[400px]">
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1F2332] p-10 text-center shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
              <LogOut size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Already Logged In</h1>
              <p className="mt-2 text-sm text-gray-400">
                You are currently signed in as <span className="text-white font-medium">{session.user.name}</span>.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Please sign out before creating a new club.
              </p>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: "/register" })}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 py-2.5 text-sm font-semibold text-red-500 border border-red-500/20 transition hover:bg-red-500/20"
            >
              Sign Out & Create New Club
            </button>
            
            <Link 
              href="/dashboard"
              className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-[#3B82F6] transition"
            >
              Go to Dashboard instead
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1F2332] shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        
        <div className="p-8">
          {/* Header/Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Cloud Manager</p>
              <p className="text-[11px] text-gray-400">Organisation SaaS</p>
            </div>
          </div>

          <h1 className="text-xl font-bold text-white">Get Started</h1>
          <p className="mt-1 text-sm text-gray-400">Create your admin account and club in minutes.</p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Club Name</label>
              <input
                type="text"
                value={clubName}
                onChange={e => setClubName(e.target.value)}
                placeholder="e.g. Skyline Youth Club"
                required
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-gray-500">Min. 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <UserPlus size={15} />
              )}
              {loading ? "Creating Club…" : "Create Club"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By joining, you agree to our Terms and Conditions.
            </p>
            <Link 
              href="/login" 
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#3B82F6] hover:text-blue-400"
            >
              Already have an account? Sign in
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
