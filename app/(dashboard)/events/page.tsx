import EmptyState from "@/components/ui/EmptyState";
import { CalendarDays } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Events &amp; Calendar</h2>
        <p className="mt-0.5 text-sm text-gray-400">Manage matches, meetings, and club notices.</p>
      </div>
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <EmptyState
          icon={CalendarDays}
          title="Event Calendar"
          description="No upcoming events. Add a match or meeting to notify the club."
          buttonLabel="Add Event"
        />
      </div>
    </div>
  );
}
