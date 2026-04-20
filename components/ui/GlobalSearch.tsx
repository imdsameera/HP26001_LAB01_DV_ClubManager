"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronRight, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils/nameUtils";

// Hardcoded settings map
const SETTINGS_TABS = [
  { id: "general", label: "General Settings", desc: "Club information and basic setup" },
  { id: "admin-access", label: "Admin Access", desc: "Manage roles and dashboard permissions" },
  { id: "branding", label: "Branding", desc: "Customize colors and logos" },
  { id: "emails", label: "Email Settings", desc: "Configure templated communications" },
  { id: "finance", label: "Finance Configuration", desc: "Set up bank details and fee structures" },
];

export default function GlobalSearch({ placeholder }: { placeholder: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [dynamicMembers, setDynamicMembers] = useState<any[]>([]);

  // Keyboard shortcut (/)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const active = document.activeElement;
    const isTyping = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || (active as HTMLElement)?.isContentEditable;
    if (e.key === "/" && !isTyping) {
      e.preventDefault();
      searchRef.current?.focus();
    }
    if (e.key === "Escape") {
      searchRef.current?.blur();
      setIsFocused(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Pre-fetch contexts
  useEffect(() => {
    if (pathname.startsWith("/members")) {
      fetch("/api/members?status=active")
        .then(res => res.json())
        .then(data => {
          if (data.members) setDynamicMembers(data.members);
        })
        .catch(() => {});
    }
  }, [pathname]);

  // Resolve search results
  const renderResults = () => {
    if (!query) return null;
    const lowerQuery = query.toLowerCase();

    // Context: Settings
    if (pathname.startsWith("/settings")) {
      const results = SETTINGS_TABS.filter(
        t => t.label.toLowerCase().includes(lowerQuery) || t.desc.toLowerCase().includes(lowerQuery)
      );
      if (results.length === 0) return <div className="p-4 text-sm text-gray-500 text-center">No settings found.</div>;
      
      return results.map(t => (
        <button
          key={t.id}
          onClick={() => {
            setIsFocused(false);
            setQuery("");
            router.push(`/settings?tab=${t.id}`);
          }}
          className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50 last:border-0"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-slate-500">
            <Settings size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-[15px] font-semibold text-slate-800">{t.label}</p>
            <p className="truncate text-xs text-gray-400 mt-0.5">{t.desc}</p>
          </div>
          <ChevronRight size={14} className="text-gray-300" />
        </button>
      ));
    }

    // Context: Members
    if (pathname.startsWith("/members")) {
      const results = dynamicMembers.filter(
        m => m.name.toLowerCase().includes(lowerQuery) || 
             m.email?.toLowerCase().includes(lowerQuery) || 
             m.memberId?.toLowerCase().includes(lowerQuery)
      );
      if (results.length === 0) return <div className="p-4 text-sm text-gray-500 text-center">No members found.</div>;

      return results.slice(0, 8).map(m => ( // Max 8 results to prevent huge dropdowns
        <button
          key={m.id}
          onClick={() => {
            setIsFocused(false);
            setQuery("");
            router.push(`/members?id=${m.id}`);
          }}
          className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50 last:border-0"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5EFFF] text-[#0066FF] font-black text-xs space-x-[1px]">
             {getInitials(m.name)}
          </div>
          <div className="flex-1 overflow-hidden">
             <p className="truncate text-[15px] font-semibold text-slate-800">{m.name}</p>
             <p className="truncate text-xs text-gray-400 mt-0.5">{m.memberId} {m.email && `• ${m.email}`}</p>
          </div>
        </button>
      ));
    }

    // Default Fallback Context — Global App Navigation
    // This covers Dashboard, Finance, Attendance, Events, and any future pages.
    // It also surfaces Settings sub-tabs so users can jump anywhere from any page.
    const NAV_ITEMS = [
      { label: "Dashboard",        desc: "Overview and analytics",               path: "/dashboard",                  icon: "grid" },
      { label: "Members",          desc: "Manage club members",                  path: "/members",                    icon: "users" },
      { label: "Attendance",       desc: "Track member attendance",              path: "/attendance",                  icon: "check" },
      { label: "Events",           desc: "Manage club events",                   path: "/events",                     icon: "calendar" },
      { label: "Finance",          desc: "Income, expenses and reports",         path: "/finance",                    icon: "dollar" },
      { label: "Settings",         desc: "General club configuration",           path: "/settings",                   icon: "settings" },
      // Settings sub-tabs (accessible from anywhere)
      ...SETTINGS_TABS.map(t => ({
        label: t.label,
        desc: t.desc,
        path: `/settings?tab=${t.id}`,
        icon: "settings" as const,
      })),
    ];

    const results = NAV_ITEMS.filter(
      n => n.label.toLowerCase().includes(lowerQuery) || n.desc.toLowerCase().includes(lowerQuery)
    );

    if (results.length === 0) return <div className="p-4 text-sm text-gray-500 text-center">No results found.</div>;

    return results.slice(0, 8).map((n, i) => (
      <button
        key={`${n.path}-${i}`}
        onClick={() => {
          setIsFocused(false);
          setQuery("");
          router.push(n.path);
        }}
        className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50 last:border-0"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-slate-500">
          {n.icon === "settings" ? <Settings size={16} /> : <ChevronRight size={16} />}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-[15px] font-semibold text-slate-800">{n.label}</p>
          <p className="truncate text-xs text-gray-400 mt-0.5">{n.desc}</p>
        </div>
        <ChevronRight size={14} className="text-gray-300" />
      </button>
    ));
  };

  return (
    <div className="relative hidden sm:block" ref={containerRef}>
      <Search
        size={14}
        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isFocused ? 'text-[#0066FF]' : 'text-gray-400'}`}
      />
      <input
        ref={searchRef}
        id="global-search"
        type="text"
        placeholder={`${placeholder} ( / )`}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        className="h-9 w-56 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-8 text-sm text-slate-700 placeholder:text-gray-400 outline-none transition-all duration-200 focus:w-72 focus:border-[#0066FF] focus:bg-white focus:ring-2 focus:ring-blue-100 focus:shadow-md"
        autoComplete="off"
      />
      
      {/* Custom Clear (X) Button */}
      {query.length > 0 && isFocused && (
        <button
          onClick={() => {
            setQuery("");
            searchRef.current?.focus();
            if (pathname.startsWith("/members")) {
              router.push("/members"); // clear filter
            }
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition-colors"
          tabIndex={-1}
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 1L1 13"/><path d="M1 1l12 12"/></svg>
        </button>
      )}

      {/* Dropdown Results Box */}
      {isFocused && query.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden bg-white shadow-xl shadow-black/10 rounded-2xl border border-gray-200 max-h-[400px] overflow-y-auto">
          {renderResults()}
        </div>
      )}
    </div>
  );
}
