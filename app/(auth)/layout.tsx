export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-[#1E222D] to-slate-900 px-4">
      {children}
    </div>
  );
}
