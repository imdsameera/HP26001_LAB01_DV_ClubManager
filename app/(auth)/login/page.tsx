"use client";

import { useState, type FormEvent } from "react";
import { signIn }                   from "next-auth/react";
import { useRouter }                from "next/navigation";
import { Eye, EyeOff, LogIn }       from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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
        router.push("/dashboard");
      }
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-[380px]">
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1F2332] shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        
        <div className="p-8">
          {/* Header/Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <span className="text-lg font-bold text-white">H</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Hyke Youth Club</p>
              <p className="text-[11px] text-gray-400">Management System</p>
            </div>
          </div>

          <h1 className="text-xl font-bold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-gray-400">Enter your credentials to continue.</p>

          {/* Tabs */}
          <div className="mt-6 flex rounded-lg bg-black/20 p-1">
            <button
              type="button"
              onClick={() => { setTab("MEMBER"); setError(""); setIdentifier(""); setPassword(""); }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                tab === "MEMBER" ? "bg-[#3B82F6] text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              Member
            </button>
            <button
              type="button"
              onClick={() => { setTab("STAFF"); setError(""); setIdentifier(""); setPassword(""); }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                tab === "STAFF" ? "bg-[#3B82F6] text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              Staff
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                {tab === "MEMBER" ? "Member ID" : "Email Address"}
              </label>
              <input
                type={tab === "MEMBER" ? "text" : "email"}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={tab === "MEMBER" ? "e.g. HYKE-0001" : "admin@hyke.lk"}
                autoComplete={tab === "MEMBER" ? "username" : "email"}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <LogIn size={15} />
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        For member access, use the credentials from your approval email.
      </p>
    </div>
  );
}
