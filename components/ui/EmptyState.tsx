import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  buttonLabel?: string;
}

export default function EmptyState({
  title,
  description,
  icon: Icon,
  buttonLabel = "Coming Soon",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-8 py-16 text-center shadow-sm">
      {/* Icon container */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
        <Icon size={32} className="text-gray-300" strokeWidth={1.5} />
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-gray-400">
        {description}
      </p>

      {/* Disabled CTA */}
      <button
        disabled
        className="mt-6 inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-[#0066FF] px-4 py-2 text-sm font-semibold text-white opacity-40"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
