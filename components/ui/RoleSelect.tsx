"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { Role } from "@/components/ui/MemberDetailPanel";

interface RoleSelectProps {
  value: Role;
  onChange: (r: Role) => void;
  disabledRoles: Role[];
}

const ROLES: Role[] = [
  "Member",
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
];

export const ROLE_BADGE: Record<Role, string> = {
  President: "bg-violet-100 text-violet-700",
  "Vice President": "bg-blue-100 text-blue-700",
  Secretary: "bg-emerald-100 text-emerald-700",
  Treasurer: "bg-amber-100 text-amber-700",
  Member: "bg-gray-100 text-gray-500",
};

export default function RoleSelect({
  value,
  onChange,
  disabledRoles,
}: RoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors hover:border-gray-400 focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
      >
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${ROLE_BADGE[value]}`}
        >
          {value}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[200px] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Select an Option
          </p>
          <div className="flex flex-col gap-0.5 mt-1">
            {ROLES.map((role) => {
              const selected = role === value;
              const disabled = disabledRoles.includes(role);

              return (
                <button
                  key={role}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(role);
                    setIsOpen(false);
                  }}
                  className={`relative flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors outline-none
                    ${
                      disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50 focus-visible:bg-gray-50 cursor-pointer"
                    }
                  `}
                >
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${ROLE_BADGE[role]}`}
                  >
                    {role}
                  </span>

                  {disabled && !selected && (
                    <span className="text-[10px] font-medium text-gray-400">
                      Assigned
                    </span>
                  )}
                  {selected && (
                    <span className="flex items-center text-gray-600 pr-1">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
