"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAnnouncementsAction,
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  pinAnnouncementAction,
} from "./page.actions";
import { authClient } from "@/lib/auth-client";
import { TargetAudience } from "@prisma/client";

export function useAnnouncements() {
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      return data;
    },
  });

  const hasAdminAccess =
    session?.user?.role === "admin" ||
    session?.user?.role === "super-admin" ||
    session?.user?.role === "teacher";

  const campusId = session?.session?.activeOrganizationId;
  const userId = session?.user?.id;

  const {
    data: announcements,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["announcements", campusId, userId],
    queryFn: () => getAnnouncementsAction(campusId!, userId!),
    enabled: !!campusId && !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      targetAudience: TargetAudience;
      classroomId?: string;
      grade?: string;
      isPinned?: boolean;
    }) => createAnnouncementAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        content?: string;
        targetAudience?: TargetAudience;
        classroomId?: string;
        grade?: string;
        isPinned?: boolean;
      };
    }) => updateAnnouncementAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncementAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const pinMutation = useMutation({
    mutationFn: (id: string) => pinAnnouncementAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  return {
    announcements,
    announcementsLoading: isLoading,
    announcementsError: error,
    createAnnouncement: createMutation.mutate,
    createLoading: createMutation.isPending,
    updateAnnouncement: updateMutation.mutate,
    updateLoading: updateMutation.isPending,
    deleteAnnouncement: deleteMutation.mutate,
    deleteLoading: deleteMutation.isPending,
    pinAnnouncement: pinMutation.mutate,
    pinLoading: pinMutation.isPending,
    hasAdminAccess,
  };
}
