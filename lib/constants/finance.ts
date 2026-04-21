import { 
  Users, 
  Coins, 
  Handshake, 
  Trophy, 
  Coffee, 
  Hammer, 
  HeartHandshake, 
  CalendarRange 
} from "lucide-react";

export type TransactionType = "income" | "expense";

export interface Category {
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
