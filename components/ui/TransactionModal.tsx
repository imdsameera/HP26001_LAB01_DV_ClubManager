"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Camera,
  Image as ImageIcon,
  X,
} from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import ImageCropperModal from "./ImageCropperModal";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "@/lib/constants/finance";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RecordType = "Expense" | "Income";

// ----------------------------------------------------------------------
// Custom Category Dropdown
// ----------------------------------------------------------------------
function CategorySelect({
  categories,
  value,
  onChange,
  isIncome,
}: {
  categories: any[];
  value: string;
  onChange: (val: string) => void;
  isIncome: boolean;
}) {
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

  const selectedCategory = categories.find((c) => c.id === value);

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] bg-white cursor-pointer hover:border-[#0066FF] transition-colors focus-within:ring-1 focus-within:ring-[#0066FF] focus-within:border-[#0066FF]"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <div className="flex items-center gap-2">
          {selectedCategory ? (
            <>
              <div
                className={`p-1.5 rounded-full ${isIncome ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
              >
                <selectedCategory.icon className="w-4 h-4" />
              </div>
              <span className="text-[#111827]">{selectedCategory.label}</span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 grid grid-cols-2 gap-[2px] opacity-40">
                <div className="bg-current rounded-[2px]" />
                <div className="bg-current rounded-[2px]" />
                <div className="bg-current rounded-[2px]" />
                <div className="bg-current rounded-[2px]" />
              </div>
              <span className="text-gray-400">Choose</span>
            </>
          )}
        </div>
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full z-50 bg-white rounded-lg border border-gray-100 shadow-xl max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Available Categories
            </div>
            {categories.map((cat) => {
              const active = cat.id === value;
              return (
                <div
                  key={cat.id}
                  className={`flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors ${
                    active
                      ? "bg-blue-50 text-[#0066FF]"
                      : "hover:bg-gray-50 text-[#111827]"
                  }`}
                  onClick={() => {
                    onChange(cat.id);
                    setIsOpen(false);
                  }}
                >
                  <div
                    className={`p-1.5 rounded-full flex shrink-0 items-center justify-center ${active ? (isIncome ? "bg-green-600 text-white" : "bg-red-600 text-white") : isIncome ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                  >
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-sm">{cat.label}</span>
                  {active && <Check className="w-4 h-4 text-[#0066FF]" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Custom Date Picker
// ----------------------------------------------------------------------
function CustomDatePicker({
  value, // ISO Date string e.g. "2026-04-08T15:30"
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [fallbackDate] = useState(() => new Date());
  const currentDate = value ? new Date(value) : fallbackDate;
  const [viewDate, setViewDate] = useState(new Date(currentDate));

  const [timeStr, setTimeStr] = useState(() => {
    const d = new Date(value || Date.now());
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    return `${hh}:${mm} ${ampm}`;
  });

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

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayIndex = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1,
  ).getDay();
  // Adjust so Monday is 0
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const handlePrevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleSelectDay = (day: number) => {
    const newD = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Parse the current time string and keep it
    const parts = timeStr.match(/(\d+):(\d+) (AM|PM)/);
    let h = 0,
      m = 0;
    if (parts) {
      h = parseInt(parts[1], 10);
      m = parseInt(parts[2], 10);
      if (parts[3] === "PM" && h < 12) h += 12;
      if (parts[3] === "AM" && h === 12) h = 0;
    }
    newD.setHours(h, m, 0, 0);
    // adjust for local timezone to get proper local ISO string without Z shift for standard inputs
    const localIso = new Date(newD.getTime() - newD.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    onChange(localIso);
    setIsOpen(false);
  };

  const formattedDisplay = () => {
    if (!value) return "Select date";
    const d = new Date(value);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year} ${timeStr}`;
  };

  const isSameDay = (d: number) => {
    return (
      currentDate.getDate() === d &&
      currentDate.getMonth() === viewDate.getMonth() &&
      currentDate.getFullYear() === viewDate.getFullYear()
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] bg-white cursor-pointer hover:border-[#0066FF] transition-colors focus-within:ring-1 focus-within:ring-[#0066FF] focus-within:border-[#0066FF]"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span>{formattedDisplay()}</span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-72 z-50 bg-white rounded-lg border border-gray-200 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15)] p-4 animate-in fade-in zoom-in-95 duration-100">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="font-semibold text-[#111827]">
              {viewDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 mb-2">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="text-center p-1" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSameDay(day);
              return (
                <button
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-md text-sm transition-colors
                    ${
                      selected
                        ? "bg-green-600 text-white font-bold ring-2 ring-green-600 ring-offset-2"
                        : "text-[#111827] hover:bg-gray-100"
                    }
                    ${new Date().getDate() === day && new Date().getMonth() === viewDate.getMonth() && new Date().getFullYear() === viewDate.getFullYear() && !selected ? "text-green-600 font-bold" : ""}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time & Check */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#0066FF]"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Stop closing
              onBlur={() => {
                // When time changes, update value but don't close.
                const parts = timeStr.match(/(\d+):(\d+) (AM|PM)/);
                if (parts) {
                  handleSelectDay(currentDate.getDate()); // re-saves date with new time
                }
              }}
            />
            <button
              className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              <Check className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Custom Select Wrapper for ChevronsUpDown
// ----------------------------------------------------------------------
function NativeSelectOverlay({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm text-[#111827] focus:border-[#0066FF] focus:outline-none focus:ring-1 focus:ring-[#0066FF] bg-white appearance-none cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronsUpDown className="w-4 h-4" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Modal Component
// ----------------------------------------------------------------------
export default function TransactionModal({
  isOpen,
  onClose,
}: TransactionModalProps) {
  const [type, setType] = useState<RecordType>("Expense");
  const [template, setTemplate] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("LKR");
  const [account, setAccount] = useState("Flash Primary");
  const [category, setCategory] = useState("");
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const [createTemplate, setCreateTemplate] = useState(false);

  // Other Details
  const [note, setNote] = useState("");
  const [payer, setPayer] = useState("");
  const [paymentType, setPaymentType] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Cleared");

  // Receipt & Camera
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [rawImageFile, setRawImageFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCategories =
    type === "Income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Active styles for segment control based on current design language
  // Utilizing requested UI patterns while preserving primary app color scheme
  const getSegmentActiveStyle = (segment: RecordType) => {
    if (type !== segment) return "text-gray-600 hover:bg-gray-50";
    if (segment === "Expense")
      return "bg-red-50 text-red-600 border border-red-200/50 shadow-sm";
    if (segment === "Income")
      return "bg-green-50 text-green-600 border border-green-200/50 shadow-sm";
    return "";
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#111827] focus:border-[#0066FF] focus:outline-none focus:ring-1 focus:ring-[#0066FF] bg-white transition-all";
  const labelClass = "mb-1.5 block text-sm font-medium text-[#111827]";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add record"
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col lg:flex-row border-t border-gray-100 bg-[#F9FAFB]/50">
        {/* Left Column - Main Details */}
        <div className="flex-1 p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
          {/* Template Select */}
          <div className="flex gap-2 relative">
            <input
              type="text"
              placeholder="Select template"
              className={inputClass}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
            <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0066FF] text-white hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={18} />
            </button>
          </div>

          {/* Type Toggle */}
          <div className="flex rounded-lg p-1 bg-gray-100/80 border border-gray-200/60 shadow-inner">
            {(["Expense", "Income"] as RecordType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${getSegmentActiveStyle(t)}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className={labelClass}>
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-lg shadow-sm border border-gray-200 bg-white focus-within:ring-1 focus-within:ring-[#0066FF] focus-within:border-[#0066FF] overflow-hidden">
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="flex-1 px-3 py-2 text-sm text-[#111827] focus:outline-none bg-transparent"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              <div className="border-l border-gray-200 bg-gray-50 flex items-center relative">
                <select
                  className="bg-transparent pl-3 pr-8 py-2 text-sm text-[#111827] focus:outline-none appearance-none font-medium cursor-pointer w-full h-full"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="LKR">LKR</option>
                  <option value="USD">USD</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronsUpDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Account */}
          <div>
            <label className={labelClass}>Account</label>
            <NativeSelectOverlay
              options={["Flash Primary", "Cash in Hand", "Bank Account"]}
              value={account}
              onChange={setAccount}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>
              Category <span className="text-red-500">*</span>
            </label>
            <CategorySelect
              categories={activeCategories}
              value={category}
              onChange={setCategory}
              isIncome={type === "Income"}
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className={labelClass}>Date & Time</label>
            <CustomDatePicker value={dateTime} onChange={setDateTime} />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2 pt-1 pb-4">
            <input
              type="checkbox"
              id="createTemplate"
              className="h-4 w-4 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
              checked={createTemplate}
              onChange={(e) => setCreateTemplate(e.target.checked)}
            />
            <label
              htmlFor="createTemplate"
              className="text-sm text-[#111827] cursor-pointer"
            >
              Create template from this record
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            <Button
              variant="primary"
              className="w-full h-11 text-base font-medium"
            >
              Add record
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 text-[#0066FF] border-[#0066FF]/30 bg-blue-50/50 hover:bg-blue-50 font-medium hover:border-[#0066FF]"
            >
              Add and create another
            </Button>
          </div>
        </div>

        {/* Right Column - Other Details */}
        <div className="w-full lg:w-[360px] p-6 lg:bg-gray-50 flex flex-col space-y-5 border-l border-white/40">
          <h3 className="font-semibold text-[#111827]">Other details</h3>

          <div>
            <label className={labelClass}>Note</label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Describe your record"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Payer</label>
            <input
              type="text"
              className={inputClass}
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Payment type</label>
            <NativeSelectOverlay
              options={[
                "Cash",
                "Debit card",
                "Credit card",
                "Bank transfer",
                "Voucher",
                "Mobile payment",
              ]}
              value={paymentType}
              onChange={setPaymentType}
            />
          </div>

          <div>
            <label className={labelClass}>Payment status</label>
            <NativeSelectOverlay
              options={["Cleared", "Uncleared", "Reconciled"]}
              value={paymentStatus}
              onChange={setPaymentStatus}
            />
          </div>
          {/* Receipt Update Block */}
          <div className="pt-2 border-t border-gray-200">
            <label className={labelClass}>Receipt</label>
            {receiptDataUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 h-32 flex items-center justify-center bg-white shadow-sm ring-1 ring-black/5">
                <img
                  src={receiptDataUrl}
                  alt="Receipt"
                  className="max-w-full max-h-full object-contain"
                />
                <button
                  onClick={() => setReceiptDataUrl(null)}
                  className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded shadow-md hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-dashed border-2 border-gray-300 font-normal text-[#6B7280] hover:text-[#0066FF] hover:border-[#0066FF] hover:bg-blue-50/50 h-16 flex-col gap-1 rounded-xl"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-xs font-medium">Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-dashed border-2 border-gray-300 font-normal text-[#6B7280] hover:text-[#0066FF] hover:border-[#0066FF] hover:bg-blue-50/50 h-16 flex-col gap-1 rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-xs font-medium">Upload Image</span>
                </Button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setRawImageFile(e.target.files[0]);
                  setIsCropperOpen(true);
                }
                e.target.value = "";
              }}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setRawImageFile(e.target.files[0]);
                  setIsCropperOpen(true);
                }
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>

      {/* Image Cropper Sub-Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageFile={rawImageFile}
        onClose={() => {
          setIsCropperOpen(false);
          setRawImageFile(null);
        }}
        onRetake={() => {
          setIsCropperOpen(false);
          setRawImageFile(null);
          // reopen camera
          setTimeout(() => cameraInputRef.current?.click(), 300);
        }}
        onComplete={(dataUrl) => {
          setReceiptDataUrl(dataUrl);
          setIsCropperOpen(false);
          setRawImageFile(null);
        }}
      />
    </Modal>
  );
}
