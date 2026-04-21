"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";

export interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const COUNTRIES: Country[] = [
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", dialCode: "+94" },
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dialCode: "+65" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dialCode: "+971" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dialCode: "+60" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", dialCode: "+64" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dialCode: "+27" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dialCode: "+81" },
  { code: "CN", name: "China", flag: "🇨🇳", dialCode: "+86" },
];

interface PhoneInputProps {
  phoneValue: string;
  onPhoneChange: (val: string) => void;
  countryDialCode: string;
  onCountryChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function PhoneInput({
  phoneValue,
  onPhoneChange,
  countryDialCode,
  onCountryChange,
  placeholder = "(000) 000-0000",
  required,
  disabled = false,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry =
    COUNTRIES.find((c) => c.dialCode === countryDialCode) || COUNTRIES[0];

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  // Close on outside click
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
    <div
      ref={containerRef}
      className={`relative flex flex-1 items-center rounded-lg border border-gray-300 bg-white transition-colors focus-within:border-[#0066FF] focus-within:ring-1 focus-within:ring-[#0066FF] ${
        disabled ? "pointer-events-none bg-gray-50 opacity-60" : ""
      }`}
    >
      {/* Country Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="flex items-center gap-1.5 rounded-l-lg py-2 pl-3 pr-2 outline-none hover:bg-gray-50 focus-visible:bg-gray-50"
      >
        <span className="text-base leading-none" aria-hidden="true">
          {selectedCountry.flag}
        </span>
        <ChevronDown size={14} className="text-gray-500 shrink-0" />
      </button>

      {/* Divider */}
      <div className="h-5 w-px bg-gray-300 mx-1 shrink-0" />

      {/* Input */}
      <input
        type="tel"
        value={phoneValue}
        onChange={(e) => {
          const v = e.target.value;
          const digitCount = (v.match(/\d/g) || []).length;
          if (/^[\d\s+\-()]*$/.test(v) && digitCount <= 10) {
            onPhoneChange(v);
          }
        }}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent px-2 py-2 outline-none text-sm text-slate-700 placeholder:text-gray-400"
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-[260px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">
          {/* Search */}
          <div className="border-b border-gray-100 p-2">
            <div className="relative flex items-center rounded-md bg-gray-50 px-2 py-1.5 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0066FF]">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onCountryChange(c.dialCode);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-50 focus:bg-gray-50 outline-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="text-slate-700">{c.name}</span>
                  </div>
                  <span className="text-gray-400 font-medium">{c.dialCode}</span>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-sm text-gray-500">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
