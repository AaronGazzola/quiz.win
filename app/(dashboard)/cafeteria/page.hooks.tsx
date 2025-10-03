"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
  getMenuByWeek,
  createMenu,
  updateMenu,
  deleteMenu,
} from "./page.actions";
import type { DayOfWeek } from "@prisma/client";

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function useCafeteria() {
  const queryClient = useQueryClient();
  const [weekOffset, setWeekOffset] = useState(0);

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

  const currentWeekStart = getMonday(
    new Date(Date.now() + weekOffset * 7 * 24 * 60 * 60 * 1000),
  );

  const { data: currentWeekMenu, isLoading } = useQuery({
    queryKey: ["cafeteria-menu", currentCampusId, currentWeekStart.toISOString()],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const result = await getMenuByWeek(currentCampusId, currentWeekStart);
      return result.success ? result.data : [];
    },
    enabled: !!currentCampusId,
  });

  const createMenuMutation = useMutation({
    mutationFn: async (data: {
      dayOfWeek: DayOfWeek;
      menuItems: Record<string, unknown>;
      specialNotes?: string;
    }) => {
      if (!currentCampusId) throw new Error("No campus selected");
      return createMenu({
        ...data,
        campusId: currentCampusId,
        weekStartDate: currentWeekStart,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafeteria-menu"] });
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: async ({
      menuId,
      data,
    }: {
      menuId: string;
      data: {
        menuItems?: Record<string, unknown>;
        specialNotes?: string;
      };
    }) => {
      return updateMenu(menuId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafeteria-menu"] });
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cafeteria-menu"] });
    },
  });

  const navigateWeek = (offset: number) => {
    if (offset === 0) {
      setWeekOffset(0);
    } else {
      setWeekOffset((prev) => prev + offset);
    }
  };

  return {
    currentWeekMenu,
    isLoading,
    hasAdminAccess,
    createMenuMutation,
    updateMenuMutation,
    deleteMenuMutation,
    currentWeekStart,
    navigateWeek,
  };
}
