"use client";

import { useState } from "react";
import { useCalendar } from "./page.hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { EventDialog } from "./EventDialog";
import type { CalendarEvent } from "@prisma/client";

export function CalendarClient() {
  const {
    events,
    upcomingEvents,
    isLoading,
    hasAdminAccess,
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
  } = useCalendar();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "Holiday":
        return "bg-red-100 text-red-800";
      case "ParentTeacherConference":
        return "bg-blue-100 text-blue-800";
      case "Assembly":
        return "bg-purple-100 text-purple-800";
      case "FieldTrip":
        return "bg-green-100 text-green-800";
      case "ExamPeriod":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading calendar...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academic Calendar</h1>
          <p className="text-muted-foreground">
            View school events, holidays, and important dates
          </p>
        </div>
        {hasAdminAccess && (
          <Button onClick={handleCreateEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              All Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events?.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge className={getEventTypeColor(event.eventType)}>
                        {event.eventType}
                      </Badge>
                      {event.isSchoolClosed && (
                        <Badge variant="destructive">School Closed</Badge>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {formatDate(event.startDate)}
                      {event.endDate &&
                        ` - ${formatDate(event.endDate)}`}
                    </div>
                  </div>
                  {hasAdminAccess && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {events?.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No events found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents?.map((event) => (
                <div key={event.id} className="space-y-1 rounded-lg border p-3">
                  <div className="font-medium">{event.title}</div>
                  <Badge
                    className={getEventTypeColor(event.eventType)}
                    variant="secondary"
                  >
                    {event.eventType}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(event.startDate)}
                  </div>
                </div>
              ))}
              {upcomingEvents?.length === 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No upcoming events
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {hasAdminAccess && (
        <EventDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          event={selectedEvent}
          onSubmit={(data) => {
            if (selectedEvent) {
              updateEventMutation.mutate({ eventId: selectedEvent.id, data });
            } else {
              createEventMutation.mutate(data);
            }
            setIsDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
