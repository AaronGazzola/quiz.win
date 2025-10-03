"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
} from "./page.actions";
import type { EventType } from "@prisma/client";

export function useCalendar() {
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      return data;
    },
  });

  const currentCampusId = session?.session?.activeOrganizationId;

  const hasAdminAccess =
    session?.user?.role === "super-admin" ||
    (currentCampusId &&
      session?.session?.activeOrganizationId === currentCampusId &&
      (session?.user?.role === "admin" || session?.user?.role === "owner"));

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", currentCampusId],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const result = await getEvents(currentCampusId);
      return result.success ? result.data : [];
    },
    enabled: !!currentCampusId,
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["upcoming-events", currentCampusId],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const result = await getUpcomingEvents(currentCampusId, 5);
      return result.success ? result.data : [];
    },
    enabled: !!currentCampusId,
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      eventType: EventType;
      startDate: Date;
      endDate?: Date;
      isSchoolClosed?: boolean;
    }) => {
      if (!currentCampusId) throw new Error("No campus selected");
      return createEvent({ ...data, campusId: currentCampusId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({
      eventId,
      data,
    }: {
      eventId: string;
      data: {
        title?: string;
        description?: string;
        eventType?: EventType;
        startDate?: Date;
        endDate?: Date;
        isSchoolClosed?: boolean;
      };
    }) => {
      return updateEvent(eventId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
    },
  });

  return {
    events,
    upcomingEvents,
    isLoading,
    hasAdminAccess,
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
  };
}
