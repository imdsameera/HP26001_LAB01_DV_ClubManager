"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, Users, CheckCheck, Clock }        from "lucide-react";
import { useRouter }                                 from "next/navigation";
import { useSession }                             from "next-auth/react";

interface Notification {
  _id:      string;
  type:    "new_applicant" | "system" | "finance";
  title:   string;
  message: string;
  createdAt: string;
  read:    boolean;
  metadata?: Record<string, string>;
}

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationPanel() {
  const { data: session } = useSession();
  const slug = (session?.user as any)?.slug;

  const [open,   setOpen]   = useState(false);
  const [tab,    setTab]    = useState<"all" | "unread">("all");
  const [notes,  setNotes]  = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const fetchNotes = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res  = await fetch("/api/notifications");
      const data = await res.json() as { notifications?: Notification[] };
      const fetched = data.notifications ?? [];
      
      const unreadCount = fetched.filter(n => !n.read).length;
      
      // Play sound if new unread notifications arrived
      if (isSilent && unreadCount > lastCountRef.current) {
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.volume = 0.5;
        void audio.play().catch(() => {}); // Browser might block autoplay
      }
      
      lastCountRef.current = unreadCount;
      setNotes(fetched);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  // Initial load
  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  // Polling every 20 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      void fetchNotes(true);
    }, 20000);
    return () => clearInterval(timer);
  }, [fetchNotes]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notes.filter(n => !n.read).length;
  const filtered    = tab === "unread" ? notes.filter(n => !n.read) : notes;

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotes(prev => prev.map(n => ({ ...n, read: true })));
      lastCountRef.current = 0;
    } catch (e) { console.error(e); }
  };

  const markRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotes(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      lastCountRef.current = Math.max(0, lastCountRef.current - 1);
    } catch (e) { console.error(e); }
  };

  const handleClick = (n: Notification) => {
    if (!n.read) void markRead(n._id);
    setOpen(false);
    
    if (n.type === "new_applicant" && n.metadata?.applicantId) {
      router.push(`/${slug}/dashboard?applicantId=${n.metadata.applicantId}`);
    } else {
      router.push(`/${slug}/dashboard`);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border)]"
        aria-label="Notifications"
        id="notifications-bell"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0066FF] text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/10 z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#0066FF] hover:underline"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-100 px-3 pt-2">
            {(["all", "unread"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-2 px-2 text-xs font-medium capitalize transition-colors border-b-2 ${
                  tab === t
                    ? "border-[#0066FF] text-[#0066FF]"
                    : "border-transparent text-gray-500 hover:text-slate-700"
                }`}
              >
                {t} {t === "unread" && unreadCount > 0 && (
                  <span className="ml-1 rounded-full bg-[#0066FF] px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-[#0066FF]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
                <Bell size={24} className="opacity-30" />
                <p className="text-xs">{tab === "unread" ? "No unread notifications" : "No notifications"}</p>
              </div>
            ) : (
              filtered.map(n => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${
                    !n.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    !n.read ? "bg-blue-100" : "bg-gray-100"
                  }`}>
                    {n.type === "new_applicant" ? (
                      <Users size={13} className={!n.read ? "text-blue-600" : "text-gray-500"} />
                    ) : (
                      <Bell size={13} className={!n.read ? "text-blue-600" : "text-gray-500"} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold ${!n.read ? "text-slate-800" : "text-slate-600"}`}>
                      {n.title}
                      {!n.read && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500 leading-snug">{n.message}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock size={10} />{timeAgo(n.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => { setOpen(false); router.push(`/${slug}/dashboard`); }}
              className="w-full py-2.5 text-center text-xs font-medium text-[#0066FF] hover:bg-blue-50/50 transition"
            >
              View all pending applications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
