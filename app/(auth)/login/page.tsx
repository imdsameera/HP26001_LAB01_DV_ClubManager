"use client";

import { useState, type FormEvent } from "react";
import { signIn }                   from "next-auth/react";
import { useRouter }                from "next/navigation";
import { Eye, EyeOff, LogIn }      from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      // NextAuth session will contain the role; middleware will handle redirect
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-2xl backdrop-blur-xl">
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />

        <div className="p-8">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0066FF] shadow-lg shadow-blue-900/40">
              <span className="text-base font-black text-white">H</span>
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-white">Hyke Youth Club</p>
              <p className="mt-0.5 text-[11px] text-gray-500">Management System</p>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-xl font-bold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-gray-500">Enter your credentials to continue.</p>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@hyke.lk"
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 pr-10 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  tabIndex={-1}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0066FF] py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-600 active:scale-[0.98] disabled:opacity-60"
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

      <p className="mt-6 text-center text-xs text-gray-600">
        For member access, use the credentials from your approval email.
      </p>
    </div>
  );
}
