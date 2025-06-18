import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import RequestCard from "./RequestCard";

export default function RequestsList({ title, requests, showCalendarView = false }) {
  if (requests.length === 0) {
    return (
      <div className="section-container">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Aucune demande disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="section-container">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  )
}
