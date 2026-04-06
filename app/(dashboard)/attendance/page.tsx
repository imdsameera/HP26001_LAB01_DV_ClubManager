import EmptyState from "@/components/ui/EmptyState";
import { ClipboardCheck } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Attendance</h2>
        <p className="mt-0.5 text-sm text-gray-400">
          QR scanner &amp; manual attendance tracking.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <EmptyState
          icon={ClipboardCheck}
          title="Attendance Tracking"
          description="No match selected. Start scanning QR codes to mark daily attendance."
          buttonLabel="Start Scanning"
        />
      </div>
    </div>
  );
}
