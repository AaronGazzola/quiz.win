"use server";

import { getAuthenticatedClient } from "@/lib/auth.utils";
import { getActionResponse, ActionResponse } from "@/lib/action.utils";
import type { DayOfWeek, CafeteriaMenu, Prisma } from "@prisma/client";

export async function getMenuByWeek(campusId: string, weekStartDate: Date): Promise<ActionResponse<CafeteriaMenu[]>> {
  try {
    const { db } = await getAuthenticatedClient();

    const menus = await db.cafeteriaMenu.findMany({
      where: {
        campusId,
        weekStartDate,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return getActionResponse({ data: menus });
  } catch (error: unknown) {
    return getActionResponse({ error });
  }
}

export async function createMenu(data: {
  weekStartDate: Date;
  dayOfWeek: DayOfWeek;
  menuItems: Record<string, unknown>;
  specialNotes?: string;
  campusId: string;
}): Promise<ActionResponse<CafeteriaMenu>> {
  try {
    const { db } = await getAuthenticatedClient();

    const menu = await db.cafeteriaMenu.create({
      data: {
        ...data,
        menuItems: data.menuItems as Prisma.InputJsonValue,
      },
    });

    return getActionResponse({ data: menu });
  } catch (error: unknown) {
    return getActionResponse({ error });
  }
}

export async function updateMenu(
  menuId: string,
  data: {
    menuItems?: Record<string, unknown>;
    specialNotes?: string;
  },
): Promise<ActionResponse<CafeteriaMenu>> {
  try {
    const { db } = await getAuthenticatedClient();

    const menu = await db.cafeteriaMenu.update({
      where: { id: menuId },
      data: {
        ...data,
        menuItems: data.menuItems ? (data.menuItems as Prisma.InputJsonValue) : undefined,
      },
    });

    return getActionResponse({ data: menu });
  } catch (error: unknown) {
    return getActionResponse({ error });
  }
}

export async function getCurrentWeekMenu(campusId: string): Promise<ActionResponse<CafeteriaMenu[]>> {
  try {
    const { db } = await getAuthenticatedClient();
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);

    const menus = await db.cafeteriaMenu.findMany({
      where: {
        campusId,
        weekStartDate: monday,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return getActionResponse({ data: menus });
  } catch (error: unknown) {
    return getActionResponse({ error });
  }
}

export async function bulkCreateWeekMenu(
  campusId: string,
  weekStartDate: Date,
  weekData: Array<{
    dayOfWeek: DayOfWeek;
    menuItems: Record<string, unknown>;
    specialNotes?: string;
  }>,
): Promise<ActionResponse<CafeteriaMenu[]>> {
  try {
    const { db } = await getAuthenticatedClient();

    const menus = await db.$transaction(
      weekData.map((day) =>
        db.cafeteriaMenu.create({
          data: {
            campusId,
            weekStartDate,
            ...day,
            menuItems: day.menuItems as Prisma.InputJsonValue,
          },
        }),
      ),
    );

    return getActionResponse({ data: menus });
  } catch (error: unknown) {
    return getActionResponse({ error });
  }
}

export async function deleteMenu(menuId: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const { db } = await getAuthenticatedClient();

    const menu = await db.cafeteriaMenu.delete({
      where: { id: menuId },
    });

    return getActionResponse({ data: { id: menu.id } });
  } catch (error: unknown) {
    return getActionResponse({ error });
  }
}
