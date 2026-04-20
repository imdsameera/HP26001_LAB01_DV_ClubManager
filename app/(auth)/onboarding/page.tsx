"use client";

import { useState, useEffect } from "react";
import { useSession }         from "next-auth/react";
import { useRouter }           from "next/navigation";
import { 
  Building2, 
  UserCircle2, 
  Rocket, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Upload, 
  Camera,
  LayoutDashboard
} from "lucide-react";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Club Details
  const [clubName, setClubName] = useState("");
  const [tagline, setTagline] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [publicEmail, setPublicEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Step 2: User Profile
  const [adminName, setAdminName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (session?.user) {
      setAdminName(session.user.name || "");
      // Fetch initial club settings if possible, or just use defaults
    }
  }, [session]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club: { name: clubName, tagline, headquarters, publicEmail, phoneNumber },
          user: { name: adminName, jobTitle, avatarUrl }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete onboarding");

      // Update session to reflect 'active' status
      await update({ status: "active", name: adminName });
      
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: "Club", icon: Building2 },
    { id: 2, label: "Profile", icon: UserCircle2 },
    { id: 3, label: "Ready", icon: Rocket },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0F1117] px-4 py-12 text-white selection:bg-blue-500/30">
      {/* Background Glows */}
      <div className="fixed left-1/4 top-1/4 -z-10 h-64 w-64 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="fixed bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="w-full max-w-xl">
        {/* Progress Bar */}
        <div className="mb-12 flex items-center justify-between">
          {steps.map((s, idx) => (
            <div key={s.id} className="relative flex flex-col items-center gap-2">
              <div 
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-500 ${
                  step === s.id 
                    ? "border-blue-500 bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                    : step > s.id 
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                      : "border-white/10 bg-white/5 text-gray-500"
                }`}
              >
                {step > s.id ? <Check size={20} /> : <s.icon size={20} />}
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${step === s.id ? "text-blue-400" : "text-gray-500"}`}>
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div className="absolute left-16 top-6 h-[1px] w-24 bg-white/5">
                  <div 
                    className="h-full bg-blue-500/50 transition-all duration-500" 
                    style={{ width: step > s.id ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Card Container */}
        <div className="relative min-h-[480px] overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.03] p-10 backdrop-blur-2xl shadow-2xl shadow-black/50">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Establish Your Club</h2>
              <p className="mt-2 text-gray-400">Let's set the foundation for your new organization.</p>

              <div className="mt-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Club Name (Confirm)</label>
                  <input
                    type="text"
                    value={clubName}
                    onChange={e => setClubName(e.target.value)}
                    placeholder="Enter official club name"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Tagline / Motto</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    placeholder="e.g. Empowering the Next Generation"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Headquarters</label>
                  <textarea
                    value={headquarters}
                    onChange={e => setHeadquarters(e.target.value)}
                    placeholder="Main address or location"
                    rows={2}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Public Email</label>
                    <input
                      type="email"
                      value={publicEmail}
                      onChange={e => setPublicEmail(e.target.value)}
                      placeholder="hello@ourclub.com"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Complete Your Profile</h2>
              <p className="mt-2 text-gray-400">Tell us a bit about yourself as the administrator.</p>

              <div className="mt-10 flex flex-col items-center gap-6">
                {/* Avatar Placeholder */}
                <div className="group relative h-28 w-28 overflow-hidden rounded-[2rem] border-2 border-white/10 bg-white/5 transition-all hover:border-blue-500/50">
                  <div className="flex h-full w-full items-center justify-center text-gray-600">
                    <UserCircle2 size={48} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                
                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Display Name</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={e => setAdminName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Role / Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      placeholder="e.g. Founder, CEO, President"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-between">
                <button 
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 transition hover:text-white"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Almost Done
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in-95 duration-700">
              <div className="relative mb-8">
                <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-blue-600 text-white shadow-2xl">
                  <Rocket size={40} />
                </div>
              </div>

              <h2 className="text-4xl font-bold text-white">You're All Set!</h2>
              <p className="mt-4 max-w-sm text-gray-400">
                Your club infrastructure is ready. We've initialized your dashboard with the best practices for youth club management.
              </p>

              <div className="mt-12 w-full space-y-4">
                <button 
                  onClick={handleFinish}
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Go to Dashboard
                      <LayoutDashboard size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold">
                  Proceed to initialize workspace
                </p>
              </div>
            </div>
          )}
        </div>
        
        <p className="mt-8 text-center text-xs text-gray-500">
          Need help? <span className="text-gray-400 hover:underline cursor-pointer">Check our documentation</span> or <span className="text-gray-400 hover:underline cursor-pointer">Contact support</span>
        </p>
      </div>
    </div>
  );
}
