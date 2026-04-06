import EmptyState from "@/components/ui/EmptyState";
import { CircleDollarSign } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Finance</h2>
        <p className="mt-0.5 text-sm text-gray-400">
          Track the club's treasury, income, and expenses.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <EmptyState
          icon={CircleDollarSign}
          title="Treasury Ledger"
          description="No transactions logged. Record income or expenses to see them here."
          buttonLabel="Log Transaction"
        />
      </div>
    </div>
  );
}
