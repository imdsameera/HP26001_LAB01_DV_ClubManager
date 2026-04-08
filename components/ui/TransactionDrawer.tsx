import React, { useState } from "react";
import { X, Users, Coins, Handshake, Trophy, Coffee, Hammer, HeartHandshake, CalendarRange } from "lucide-react";
import Button from "./Button";

interface TransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionDrawer({ isOpen, onClose }: TransactionDrawerProps) {
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [member, setMember] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const incomeCategories = [
    { value: "monthly_dues", label: "Monthly Dues", Icon: Users },
    { value: "match_collections", label: "Match Collections", Icon: Coins },
    { value: "sponsorships", label: "Sponsorships / Donations", Icon: Handshake },
  ];

  const expenseCategories = [
    { value: "equipment", label: "Equipment & Gear", Icon: Trophy },
    { value: "refreshments", label: "Refreshments", Icon: Coffee },
    { value: "maintenance", label: "Ground Maintenance", Icon: Hammer },
    { value: "charity", label: "Charity Works", Icon: HeartHandshake },
    { value: "events", label: "Events / Tournaments", Icon: CalendarRange },
  ];

  const activeCategories = type === "income" ? incomeCategories : expenseCategories;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#111827]">Add Record</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">
          
          {/* Type Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                type === "income" 
                  ? "bg-white text-green-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => { setType("income"); setCategory(""); }}
            >
              Income
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                type === "expense" 
                  ? "bg-white text-red-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => { setType("expense"); setCategory(""); }}
            >
              Expense
            </button>
          </div>

          {/* Amount */}
          <div className="flex flex-col items-center py-4">
            <label className="text-sm text-[#6B7280] mb-2 cursor-pointer" htmlFor="amount">Amount (LKR)</label>
            <div className="relative flex items-center justify-center">
              <span className={`absolute left-0 text-3xl font-medium ${type === "income" ? "text-green-600" : "text-red-600"}`}>
                {type === "income" ? "+" : "-"}
              </span>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full text-center text-4xl font-bold bg-transparent border-none focus:ring-0 p-0 pl-8 ${
                  type === "income" ? "text-green-600" : "text-red-600"
                } placeholder-gray-300`}
                style={{ width: amount ? `calc(${amount.length}ch + 40px)` : '120px' }}
              />
            </div>
            <div className="h-px w-32 bg-gray-200 mt-2" />
          </div>

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#111827]">Category</label>
            <div className="grid gap-2">
              {activeCategories.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <label 
                    key={cat.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#0066FF] bg-blue-50 ring-1 ring-[#0066FF]' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="category" 
                      value={cat.value} 
                      className="sr-only"
                      checked={isSelected}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                    <div className={`p-2 rounded-full ${isSelected ? 'bg-[#0066FF] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <cat.Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-[#0066FF]' : 'text-[#111827]'}`}>
                      {cat.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label htmlFor="date" className="block text-sm font-medium text-[#111827]">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-[#111827]"
            />
          </div>

          {/* Member Link */}
          <div className="space-y-1.5">
            <label htmlFor="member" className="block text-sm font-medium text-[#111827]">Link to Member (Optional)</label>
            <select
              id="member"
              value={member}
              onChange={(e) => setMember(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-[#111827] bg-white"
            >
              <option value="">-- Select Member --</option>
              <option value="mem_1">Giyash Liyanage</option>
              <option value="mem_2">Kamal Perera</option>
              <option value="mem_3">Nimal Silva</option>
            </select>
          </div>

          {/* Note / Description */}
          <div className="space-y-1.5">
            <label htmlFor="note" className="block text-sm font-medium text-[#111827]">Note</label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g., Match fees for April"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-[#111827] resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="primary" className="w-full py-3 text-base">
            Save Record
          </Button>
        </div>

      </div>
    </>
  );
}
