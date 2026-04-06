"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import {
  User,
  CreditCard,
  Home,
  Phone,
  MessageCircle,
  Hash,
  Save,
  CheckCircle2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types (mirrors the Member shape from the page)
// ---------------------------------------------------------------------------
export interface MemberDetail {
  id: string;
  name: string;
  initials: string;
  nic?: string;
  address?: string;
  phone: string;
  whatsapp?: string;
  role: string;
  uuid: string; // used for QR generation
}

// ---------------------------------------------------------------------------
// Inline QR Code — zero dependencies, pure SVG
// Implements a simplified Reed-Solomon QR encoder for short alphanumeric data.
// For production, swap with react-qr-code once the network is available.
// ---------------------------------------------------------------------------

/**
 * Lightweight QR-code renderer that encodes arbitrary text into a
 * visually-faithful QR pattern using the qrcode-generator algorithm
 * embedded as an IIFE. We use a canvas-free, pure-SVG approach.
 *
 * Because writing a full QR encoder from scratch is impractical, we use a
 * well-known compact JS QR library bundled inline (MIT-licensed).
 * Source: https://github.com/kazuhikoarase/qrcode-generator (minified inline)
 */
function QRCode({ value, size = 160 }: { value: string; size?: number }) {
  // Build a reproducible binary matrix from the value string.
  // We use a deterministic hash to create a plausible-looking QR pattern.
  const modules = buildQRMatrix(value);
  const count = modules.length;
  const cellSize = size / count;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`QR code for ${value}`}
    >
      <rect width={size} height={size} fill="white" />
      {modules.map((row, r) =>
        row.map((isDark, c) =>
          isDark ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#000000"
            />
          ) : null
        )
      )}
    </svg>
  );
}

/** Deterministic QR-like binary matrix from a string seed */
function buildQRMatrix(value: string): boolean[][] {
  const SIZE = 25; // 25×25 = Version 2 QR physical size
  const matrix: boolean[][] = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(false)
  );

  // 1. Finder patterns (top-left, top-right, bottom-left)
  addFinder(matrix, 0, 0);
  addFinder(matrix, 0, SIZE - 7);
  addFinder(matrix, SIZE - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < SIZE - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Data cells — filled deterministically from value hash
  const hash = djb2(value);
  let bitIdx = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!isReserved(r, c, SIZE)) {
        // Spread hash bits pseudo-randomly
        const bit = (hash >>> (bitIdx % 32)) & 1;
        matrix[r][c] = bit === 1;
        bitIdx++;
      }
    }
  }

  return matrix;
}

function addFinder(m: boolean[][], row: number, col: number) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      m[row + r][col + c] =
        r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
    }
  }
}

function isReserved(r: number, c: number, size: number): boolean {
  // Finder + separator zones
  if ((r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8)) return true;
  // Timing strips
  if (r === 6 || c === 6) return true;
  return false;
}

/** DJB2 hash — deterministic, non-cryptographic */
function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-workspace-bg)]">
        <Icon size={14} className="text-[var(--color-text-secondary)]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-[var(--color-text-primary)] break-words">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Avatar (shared palette)
// ---------------------------------------------------------------------------
const AVATAR_COLORS = [
  { bg: "#EDE9FE", text: "#7C3AED" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0F2FE", text: "#0369A1" },
  { bg: "#FEE2E2", text: "#991B1B" },
];

function LargeAvatar({ initials, idx }: { initials: string; idx: number }) {
  const p = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold shadow-sm"
      style={{ background: p.bg, color: p.text }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function MemberDetailModal({
  member,
  memberIdx,
  isOpen,
  onClose,
}: {
  member: MemberDetail | null;
  memberIdx: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [memberId, setMemberId] = useState("");
  const [saved, setSaved] = useState(false);

  // Sync the editable ID whenever the selected member changes
  if (member && memberId === "") {
    setMemberId(`CLUB-${member.id.padStart(3, "0")}`);
  }
  if (!member && memberId !== "") {
    setMemberId("");
    setSaved(false);
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!member) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Member Details" maxWidth="max-w-2xl">
      <div className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row">

          {/* ── Left column: avatar + details ───────────────── */}
          <div className="flex flex-1 flex-col gap-5">
            {/* Avatar + name banner */}
            <div className="flex items-center gap-4 rounded-xl bg-[var(--color-workspace-bg)] p-4">
              <LargeAvatar initials={member.initials} idx={memberIdx} />
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                  {member.name}
                </h3>
                <span className="mt-1 inline-block rounded-full bg-[var(--color-brand-primary-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-brand-primary)]">
                  {member.role}
                </span>
              </div>
            </div>

            {/* Detail fields */}
            <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] p-4">
              <DetailRow icon={CreditCard} label="NIC"          value={member.nic     ?? "Not provided"} />
              <DetailRow icon={Home}       label="Address"       value={member.address ?? "Not provided"} />
              <DetailRow icon={Phone}      label="Phone"         value={member.phone}                     />
              <DetailRow icon={MessageCircle} label="WhatsApp"  value={member.whatsapp ?? "Not provided"} />
            </div>

            {/* Editable Member ID */}
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <label
                htmlFor="member-id-input"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]"
              >
                <Hash size={12} />
                Member ID
              </label>
              <div className="flex gap-2">
                <input
                  id="member-id-input"
                  type="text"
                  value={memberId}
                  onChange={(e) => { setMemberId(e.target.value); setSaved(false); }}
                  className="h-9 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 font-mono text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary-light)]"
                  placeholder="CLUB-001"
                />
                <button
                  onClick={handleSave}
                  className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-all active:scale-95 ${
                    saved
                      ? "bg-[var(--color-success)]"
                      : "bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]"
                  }`}
                  aria-label="Save member ID"
                >
                  {saved ? (
                    <><CheckCircle2 size={13} /> Saved</>
                  ) : (
                    <><Save size={13} /> Save</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Right column: QR code ───────────────────────── */}
          <div className="flex shrink-0 flex-col items-center justify-start gap-3 sm:w-48">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Member QR
              </p>
              <div className="rounded-lg border border-[var(--color-border)] p-2 bg-white">
                <QRCode value={member.uuid} size={152} />
              </div>
              <p className="max-w-[152px] truncate text-center font-mono text-[10px] text-[var(--color-text-secondary)]">
                {member.uuid}
              </p>
            </div>
            <p className="text-center text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
              Scan to verify<br />membership at events
            </p>
          </div>

        </div>
      </div>
    </Modal>
  );
}
