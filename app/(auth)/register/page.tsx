"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { 
  UserCircle2, 
  Building2, 
  Rocket, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Eye, 
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  X
} from "lucide-react";
import Link from "next/link";

function RegisterPageContent() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const searchParams = useSearchParams();
  const isSetupMode = searchParams.get("setup") === "true";
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { update } = useSession();

  // (rest of the current RegisterPage logic converted to content component...)
  // [Note: I am moving the logic into the Inner component for Suspense]

  // Step 1: Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Step 2: Club Identity
  const [clubName, setClubName] = useState("");
  const [clubHandle, setClubHandle] = useState("");
  const [tagline, setTagline] = useState("");
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);

  // Step 3: Launch Details
  const [headquarters, setHeadquarters] = useState("");
  const [publicEmail, setPublicEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Setup mode check & Session Repair
  useEffect(() => {
    const repairSession = async () => {
      if (isSetupMode && session?.user && !(session.user as any).slug) {
        setLoading(true);
        try {
          const res = await fetch("/api/auth/repair-handle");
          const data = await res.json();
          if (data.ok && data.slug) {
            // Found a club! Repair and redirect
            await update({ slug: data.slug, status: "active" });
            router.push(`/${data.slug}`);
            router.refresh();
            return;
          }
        } catch (e) {
          console.error("Session repair failed:", e);
        } finally {
          setLoading(false);
        }
        
        // If repair failed, proceed to Step 2
        setStep(2);
        setName(session.user.name || "");
        setEmail(session.user.email || "");
      }
    };

    repairSession();
  }, [isSetupMode, session, update, router]);

  // Email availability check
  useEffect(() => {
    const checkEmail = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setEmailAvailable(null);
        return;
      }
      setCheckingEmail(true);
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        setEmailAvailable(data.available);
      } catch {
        setEmailAvailable(false);
      } finally {
        setCheckingEmail(false);
      }
    };

    const timer = setTimeout(checkEmail, 600);
    return () => clearTimeout(timer);
  }, [email]);

  // Handle availability check
  useEffect(() => {
    const checkHandle = async () => {
      if (!clubHandle || clubHandle.length < 3) {
        setHandleAvailable(null);
        return;
      }
      setCheckingHandle(true);
      try {
        const res = await fetch(`/api/clubs/check-handle?handle=${clubHandle}`);
        const data = await res.json();
        setHandleAvailable(data.available);
      } catch {
        setHandleAvailable(false);
      } finally {
        setCheckingHandle(false);
      }
    };

    const timer = setTimeout(checkHandle, 500);
    return () => clearTimeout(timer);
  }, [clubHandle]);

  const validateStep = (s: number) => {
    if (s === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return (
        name.length >= 2 &&
        emailRegex.test(email) &&
        emailAvailable === true &&
        password.length >= 8 &&
        password === confirmPassword
      );
    }
    if (s === 2) return clubName.length >= 2 && clubHandle.length >= 3 && handleAvailable === true;
    if (s === 3) return headquarters.length >= 5 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publicEmail);
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError("Please ensure all fields are correctly filled.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      if (isSetupMode) {
        // Migration setup
        const setupRes = await fetch("/api/auth/setup-handle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clubName, handle: clubHandle, tagline,
            headquarters, publicEmail, phoneNumber
          }),
        });
        const setupData = await setupRes.json();
        if (!setupRes.ok) throw new Error(setupData.error || "Setup failed");

        // Refresh session
        await update({ slug: clubHandle, status: "active" });
        
        router.push(`/${clubHandle}`);
        router.refresh();
      } else {
        // Normal registration
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name, email, password,
            clubName, handle: clubHandle, tagline,
            headquarters, publicEmail, phoneNumber
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.error || "Registration failed");

        const loginRes = await signIn("credentials", {
          identifier: email,
          password,
          redirect: false,
        });

        if (loginRes?.error) {
          router.push("/login?error=auto_login_failed");
        } else {
          router.push(`/${clubHandle}`);
          router.refresh();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: "Account", icon: UserCircle2 },
    { id: 2, label: "Establish", icon: Building2 },
    { id: 3, label: "Launch", icon: Rocket },
  ];

  return (
    <div className="w-full max-w-[480px] py-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Stepper Header */}
      <div className="mb-10 flex items-center justify-between px-4">
        {steps.map((s, idx) => (
          <div key={s.id} className="relative flex flex-col items-center gap-3">
            <div 
              className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all duration-500 z-10 ${
                step === s.id 
                  ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105" 
                  : step > s.id 
                    ? "border-emerald-500 bg-emerald-50 text-emerald-500"
                    : "border-slate-100 bg-white text-slate-300"
              }`}
            >
              {step > s.id ? <Check size={20} strokeWidth={3} /> : <s.icon size={20} />}
            </div>
            <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${step === s.id ? "text-blue-600" : "text-slate-400"}`}>
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div className="absolute left-[54px] top-6 h-[2px] w-[80px] bg-slate-100 -z-0">
                <div 
                  className="h-full bg-blue-600 transition-all duration-700" 
                  style={{ width: step > s.id ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_40px_80px_rgba(0,0,0,0.06)]">
        <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        <div className="p-10">
          {error && (
            <div className="mb-8 rounded-xl border border-red-100 bg-red-50 p-4 text-center text-[13px] font-bold text-red-500 animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-10 text-center">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
                <p className="mt-2 text-slate-500 font-medium text-sm">Let's start with your administrator profile.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Full Name</label>
                  <div className="relative">
                    <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-5 py-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@organisation.com"
                      className={`w-full rounded-xl border ${emailAvailable === false ? 'border-red-500/50' : emailAvailable === true ? 'border-emerald-500/50' : 'border-slate-200'} bg-slate-50 pl-12 pr-12 py-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      {checkingEmail ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                      ) : email && (
                        emailAvailable === true ? <Check size={18} className="text-emerald-500" strokeWidth={3} /> : emailAvailable === false ? <X size={18} className="text-red-500" strokeWidth={3} /> : null
                      )}
                    </div>
                  </div>
                  {emailAvailable === false && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-1.5 pl-1">
                      This email is already registered.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Password</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 py-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white"
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
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Confirm</label>
                    <div className="relative">
                      <Check className={`absolute left-4 top-1/2 -translate-y-1/2 ${confirmPassword && password === confirmPassword ? 'text-emerald-500' : 'text-slate-300'}`} size={18} />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border ${confirmPassword && password !== confirmPassword ? 'border-red-500/50' : 'border-slate-200'} bg-slate-50 pl-12 pr-5 py-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white`}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={nextStep}
                  disabled={!validateStep(1)}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-4.5 font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-10"
                >
                  Confirm Account
                  <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-10 text-center">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Establish Club</h1>
                <p className="mt-2 text-slate-500 font-medium text-sm">Define your organisation's identity.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Club Name</label>
                  <input
                    type="text"
                    value={clubName}
                    onChange={e => setClubName(e.target.value)}
                    placeholder="e.g. Skyline Youth Club"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Club Handle (URL)</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400 text-sm font-semibold">
                      teamnode.app/
                    </div>
                    <input
                      type="text"
                      value={clubHandle}
                      onChange={e => setClubHandle(e.target.value.toLowerCase().replace(/[^a-z0-0-]/g, ""))}
                      placeholder="my-club"
                      className={`w-full rounded-xl border ${handleAvailable === false ? 'border-red-500/50' : handleAvailable === true ? 'border-emerald-500/50' : 'border-slate-200'} bg-slate-50 pl-[130px] pr-12 py-4 text-[15px] font-medium text-slate-900 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-5">
                      {checkingHandle ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                      ) : clubHandle && clubHandle.length >= 3 && (
                        handleAvailable ? <Check size={18} className="text-emerald-500" strokeWidth={3} /> : <X size={18} className="text-red-500" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 pl-1">
                    Lowercase, numbers & hyphens only
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    placeholder="Empowering our future"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white"
                  />
                </div>

                <div className="mt-12 flex items-center gap-4 pt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={nextStep}
                    disabled={!validateStep(2)}
                    className="group flex flex-1 items-center justify-center gap-3 rounded-xl bg-blue-600 py-4.5 font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    Next Step
                    <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-10 text-center">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Final Launch</h1>
                <p className="mt-2 text-slate-500 font-medium text-sm">Just a few more details to go.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Headquarters</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-slate-300" size={18} />
                    <textarea
                      value={headquarters}
                      onChange={e => setHeadquarters(e.target.value)}
                      placeholder="Organisation address"
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-5 py-3.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Public Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="email"
                        value={publicEmail}
                        onChange={e => setPublicEmail(e.target.value)}
                        placeholder="hello@club.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-5 py-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="+1 234 567 890"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-5 py-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-300 outline-none transition focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex items-center gap-4 pt-4">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading || !validateStep(3)}
                    className="group relative flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4.5 font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        Launch Dashboard
                        <Rocket size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-10 text-center px-4">
        <p className="text-xs font-medium text-slate-400 mb-6 leading-relaxed">
          By launching your workspace, you agree to our <span className="text-slate-600 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-slate-600 hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-[13px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Already have an account? Sign in
          <ArrowRight size={16} />
        </Link>

        {isSetupMode && session && (
          <div className="mt-6 border-t border-slate-100 pt-6">
             <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-[12px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
             >
                Not your account? Sign Out
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-white shadow-xl shadow-blue-600/20" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
