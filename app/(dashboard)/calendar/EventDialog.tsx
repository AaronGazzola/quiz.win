"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { CalendarEvent, EventType } from "@prisma/client";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  onSubmit: (data: {
    title: string;
    description?: string;
    eventType: EventType;
    startDate: Date;
    endDate?: Date;
    isSchoolClosed?: boolean;
  }) => void;
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  onSubmit,
}: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("Other");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSchoolClosed, setIsSchoolClosed] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setEventType(event.eventType);
      setStartDate(new Date(event.startDate).toISOString().split("T")[0]);
      setEndDate(
        event.endDate
          ? new Date(event.endDate).toISOString().split("T")[0]
          : "",
      );
      setIsSchoolClosed(event.isSchoolClosed);
    } else {
      setTitle("");
      setDescription("");
      setEventType("Other");
      setStartDate("");
      setEndDate("");
      setIsSchoolClosed(false);
    }
  }, [event, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description: description || undefined,
      eventType,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      isSchoolClosed,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {event ? "Edit Event" : "Create New Event"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Select
              value={eventType}
              onValueChange={(value) => setEventType(value as EventType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Holiday">Holiday</SelectItem>
                <SelectItem value="ParentTeacherConference">
                  Parent-Teacher Conference
                </SelectItem>
                <SelectItem value="Assembly">Assembly</SelectItem>
                <SelectItem value="FieldTrip">Field Trip</SelectItem>
                <SelectItem value="ExamPeriod">Exam Period</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSchoolClosed"
              checked={isSchoolClosed}
              onCheckedChange={(checked) =>
                setIsSchoolClosed(checked as boolean)
              }
            />
            <Label htmlFor="isSchoolClosed" className="cursor-pointer">
              School is closed on this date
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{event ? "Update" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
