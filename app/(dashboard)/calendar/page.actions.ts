"use server";

import { getAuthenticatedClient } from "@/lib/auth.utils";
import { getActionResponse, ActionResponse } from "@/lib/action.utils";
import type { CalendarEvent, EventType } from "@prisma/client";

export async function getEvents(
  campusId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<ActionResponse<CalendarEvent[]>> {
  try {
    const { db } = await getAuthenticatedClient();

    const events = await db.calendarEvent.findMany({
      where: {
        campusId,
        ...(startDate &&
          endDate && {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          }),
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return getActionResponse({ data: events });
  } catch (error: unknown) {
    return getActionResponse({ error });
  }
}

export async function createEvent(data: {
  title: string;
  description?: string;
  eventType: EventType;
  startDate: Date;
  endDate?: Date;
  campusId: string;
  isSchoolClosed?: boolean;
}): Promise<ActionResponse<CalendarEvent>> {
  try {
    const { db, userId } = await getAuthenticatedClient();

    const event = await db.calendarEvent.create({
      data: {
        ...data,
        createdById: userId,
      },
    });

    return getActionResponse({ data: event });
  } catch (error: unknown) {
    return getActionResponse({ error });
  }
}

export async function updateEvent(
  eventId: string,
  data: {
    title?: string;
    description?: string;
    eventType?: EventType;
    startDate?: Date;
    endDate?: Date;
    isSchoolClosed?: boolean;
  },
): Promise<ActionResponse<CalendarEvent>> {
  try {
    const { db } = await getAuthenticatedClient();

    const event = await db.calendarEvent.update({
      where: { id: eventId },
      data,
    });

    return getActionResponse({ data: event });
  } catch (error: unknown) {
    return getActionResponse({ error });
  }
}

export async function deleteEvent(eventId: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const { db } = await getAuthenticatedClient();

    const event = await db.calendarEvent.delete({
      where: { id: eventId },
    });

    return getActionResponse({ data: { id: event.id } });
  } catch (error: unknown) {
    return getActionResponse({ error });
  }
}

export async function getUpcomingEvents(campusId: string, limit: number = 5): Promise<ActionResponse<CalendarEvent[]>> {
  try {
    const { db } = await getAuthenticatedClient();
    const now = new Date();

    const events = await db.calendarEvent.findMany({
      where: {
        campusId,
        startDate: {
          gte: now,
        },
      },
      orderBy: {
        startDate: "asc",
      },
      take: limit,
    });

    return getActionResponse({ data: events });
  } catch (error: unknown) {
    return getActionResponse({ error });
  }
}
