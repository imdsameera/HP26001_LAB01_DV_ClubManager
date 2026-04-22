"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Eye, EyeOff, LogIn, LogOut, ArrowRight } from "lucide-react";
import { useRouter }                from "next/navigation";
import Link                       from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [tab, setTab]               = useState<"MEMBER" | "STAFF">("MEMBER");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [showPwd,  setShowPwd]      = useState(false);
  const [loading,  setLoading]      = useState(false);
  const [error,    setError]        = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials. Please try again.");
    } else {
      if (tab === "MEMBER") {
        router.push("/portal");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  };

  // Automatic sign-out if session user doesn't exist in DB (e.g. after a flush)
  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.email) {
      const verifySession = async () => {
        try {
          const res = await fetch("/api/auth/profile");
          if (res.status === 404) {
            // User record is gone, clear the stale session
            console.warn("Session user not found in database. Signing out...");
            await signOut({ redirect: false });
            router.refresh();
          }
        } catch (error) {
          console.error("Session verification failed", error);
        }
      };
      verifySession();
    }
  }, [sessionStatus, session, router]);

  // Automatic Redirection for Authenticated Users
  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user && !loading) {
      const userSlug = (session.user as any).slug;
      if (session.user.role === "MEMBER") {
        router.push(userSlug ? `/${userSlug}/portal` : "/portal");
      } else {
        router.push(userSlug ? `/${userSlug}` : "/register?setup=true");
      }
    }
  }, [sessionStatus, session, router, loading]);

  if (sessionStatus === "authenticated" && session?.user) {
    return (
      <div className="flex flex-col items-center gap-6 p-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>
        <p className="text-lg font-bold text-slate-900">Redirecting to Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        <div className="p-10">
          {/* Header/Logo */}
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-xl shadow-blue-600/20">
              <span className="text-xl font-black text-white">T</span>
            </div>
            <div>
              <p className="text-[17px] font-bold text-slate-900 leading-tight">Teamnode</p>
              <p className="text-xs font-medium text-slate-400">Management System</p>
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sign in</h1>
          <p className="mt-2 text-[15px] font-medium text-slate-500">Enter your credentials to continue access.</p>

          {/* Tabs */}
          <div className="mt-8 flex rounded-xl bg-slate-50 p-1.5 border border-slate-100">
            <button
              type="button"
              onClick={() => { setTab("MEMBER"); setError(""); setIdentifier(""); setPassword(""); }}
              className={`flex-1 rounded-lg py-2.5 text-[13px] font-bold tracking-wide uppercase transition-all ${
                tab === "MEMBER" ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Member
            </button>
            <button
              type="button"
              onClick={() => { setTab("STAFF"); setError(""); setIdentifier(""); setPassword(""); }}
              className={`flex-1 rounded-lg py-2.5 text-[13px] font-bold tracking-wide uppercase transition-all ${
                tab === "STAFF" ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Staff
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-center text-xs font-semibold text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">
                {tab === "MEMBER" ? "Member ID" : "Email Address"}
              </label>
              <input
                type={tab === "MEMBER" ? "text" : "email"}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={tab === "MEMBER" ? "e.g. M001" : "admin@teamnode.app"}
                autoComplete={tab === "MEMBER" ? "username" : "email"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 pr-12 text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 py-4.5 text-[15px] font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? "Verifying..." : "Sign In to Workspace"}
              <div className="absolute inset-0 rounded-xl transition group-hover:bg-white/5 pointer-events-none" />
            </button>
          </form>

          <div className="mt-10 text-center border-t border-slate-50 pt-8">
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Establishing a new club? Register
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs font-medium text-slate-400">
        Member access requires credentials provided during registration approval.
      </p>
    </div>
  );
}
