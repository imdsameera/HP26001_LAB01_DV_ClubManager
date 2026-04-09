"use client";

import React, { useState } from "react";
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Coins, 
  Handshake, 
  Trophy, 
  Coffee, 
  Hammer, 
  HeartHandshake, 
  CalendarRange 
} from "lucide-react";
import Button from "@/components/ui/Button";
import TransactionModal from "@/components/ui/TransactionModal";

// --- Types & Categories ---
type TransactionType = "income" | "expense";

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const INCOME_CATEGORIES: Category[] = [
  { id: "monthly_dues", label: "Monthly Dues", icon: Users },
  { id: "match_collections", label: "Match Collections", icon: Coins },
  { id: "sponsorships", label: "Sponsorships / Donations", icon: Handshake },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { id: "equipment", label: "Equipment & Gear", icon: Trophy },
  { id: "refreshments", label: "Refreshments", icon: Coffee },
  { id: "maintenance", label: "Ground Maintenance", icon: Hammer },
  { id: "charity", label: "Charity Works", icon: HeartHandshake },
  { id: "events", label: "Events / Tournaments", icon: CalendarRange },
];

interface Transaction {
  id: string;
  type: TransactionType;
  categoryId: string;
  amount: number;
  date: string; // ISO date string
  note?: string;
  member?: {
    id: string;
    name: string;
    avatarInitials?: string;
  };
}

// Dummy Data
const DUMMY_TRANSACTIONS: { dateGroup: string; items: Transaction[] }[] = [
  {
    dateGroup: "Today, April 8",
    items: [
      {
        id: "tx_1",
        type: "income",
        categoryId: "monthly_dues",
        amount: 2500,
        date: "2026-04-08T10:00:00Z",
        note: "April subscription",
        member: { id: "m_1", name: "G. Liyanage", avatarInitials: "GL" }
      },
      {
        id: "tx_2",
        type: "expense",
        categoryId: "refreshments",
        amount: 1500,
        date: "2026-04-08T14:30:00Z",
        note: "Post-match drinks",
      }
    ]
  },
  {
    dateGroup: "Yesterday, April 7",
    items: [
      {
        id: "tx_3",
        type: "income",
        categoryId: "sponsorships",
        amount: 3500,
        date: "2026-04-07T09:15:00Z",
        note: "Local business sponsor",
      }
    ]
  }
];

export default function FinancePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const getCategoryDetails = (id: string, type: TransactionType) => {
    if (type === "income") {
      return INCOME_CATEGORIES.find(c => c.id === id) || INCOME_CATEGORIES[0];
    }
    return EXPENSE_CATEGORIES.find(c => c.id === id) || EXPENSE_CATEGORIES[0];
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex flex-col space-y-6 h-full p-6 lg:p-8 bg-[#F9FAFB]">
      {/* Header & Summary Cards */}
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#111827]">Finance & Ledger</h1>
          <Button 
            variant="primary" 
            onClick={() => setIsDrawerOpen(true)}
            className="hidden sm:inline-flex"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>
          {/* Mobile button */}
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            className="sm:hidden"
          >
            <Plus className="w-4 h-4 mr-1" />
            Record
          </Button>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Net Balance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <span className="text-sm font-medium text-[#6B7280]">Total Cash on Hand</span>
            <div className="mt-2 text-2xl md:text-3xl font-bold text-[#0066FF]">
              LKR 4,500.00
            </div>
          </div>

          {/* Card 2: Income */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <span className="text-sm font-medium text-[#6B7280]">In (This Month)</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-bold text-green-600">
                LKR 6,000.00
              </span>
              <div className="bg-green-100 p-1.5 rounded-full">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          {/* Card 3: Expense */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <span className="text-sm font-medium text-[#6B7280]">Out (This Month)</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-bold text-red-600">
                LKR 1,500.00
              </span>
              <div className="bg-red-100 p-1.5 rounded-full">
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Smart Ledger */}
      <div className="flex-1">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-[#111827]">Transactions</h2>
          </div>
          
          <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
            {DUMMY_TRANSACTIONS.map((group, idx) => (
              <div key={idx} className="pb-2">
                {/* Date Header */}
                <div className="px-6 py-3 bg-gray-50 text-xs font-medium text-[#6B7280] uppercase tracking-wider sticky top-0 z-10 border-b border-y-gray-100">
                  {group.dateGroup}
                </div>
                
                {/* Transaction Rows */}
                <div className="px-6">
                  {group.items.map((tx) => {
                    const category = getCategoryDetails(tx.categoryId, tx.type);
                    const isIncome = tx.type === "income";
                    const amountColor = isIncome ? "text-green-600" : "text-red-600";
                    const amountPrefix = isIncome ? "+" : "-";
                    
                    return (
                      <div key={tx.id} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors -mx-6 px-6 cursor-pointer">
                        
                        {/* Left Side: Icon & Details */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`p-3 rounded-full shrink-0 ${isIncome ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            <category.icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <span className="font-semibold text-[#111827] truncate">
                              {category.label}
                            </span>
                            {tx.note && (
                              <span className="text-sm text-[#6B7280] truncate mt-0.5">
                                {tx.note}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Member Tag (Optional) */}
                        <div className="hidden md:flex items-center justify-center flex-1">
                          {tx.member && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full border border-gray-200 text-xs text-gray-600">
                              <div className="w-4 h-4 rounded-full bg-gray-300 text-white flex items-center justify-center text-[8px] font-bold">
                                {tx.member.avatarInitials}
                              </div>
                              <span className="truncate max-w-[100px]">{tx.member.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Right Side: Amount */}
                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <span className={`font-semibold ${amountColor} md:text-lg`}>
                            {amountPrefix}{formatCurrency(tx.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <TransactionModal 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}
