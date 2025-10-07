"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  bulkDeleteQuizzesAction,
  createQuizAction,
  deleteQuizAction,
  getQuizResponsesAction,
  GetQuizResponsesParams,
  getQuizzesAction,
  GetQuizzesParams,
  updateQuizAction,
  processInvitationAction,
  getDashboardMetricsAction,
  getResponseDetailAction,
  getUserResponseAction,
} from "./page.actions";
import {
  useBulkOperationStore,
  useQuizTableStore,
  useResponseTableStore,
} from "./page.stores";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useGetQuizzes = (organizationIds?: string[]) => {
  const { search, sort, page, itemsPerPage } = useQuizTableStore();
  const debouncedSearch = useDebounce(search, 300);
  const orgIdsKey = organizationIds?.join(",") || "";

  const queryParams: GetQuizzesParams = useMemo(
    () => ({
      organizationIds,
      search: debouncedSearch,
      sortColumn: sort.column || undefined,
      sortDirection: sort.direction || undefined,
      page,
      itemsPerPage,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      orgIdsKey,
      debouncedSearch,
      sort.column,
      sort.direction,
      page,
      itemsPerPage,
      organizationIds,
    ]
  );

  conditionalLog({hook:"useGetQuizzes",status:"initialized",hasOrgIds:!!organizationIds?.length,orgCount:organizationIds?.length,search:debouncedSearch},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["quizzes", queryParams],
    queryFn: async () => {
      conditionalLog({hook:"useGetQuizzes",status:"fetching",orgIds:organizationIds,search:debouncedSearch,page},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getQuizzesAction(queryParams);
      if (error) {
        conditionalLog({hook:"useGetQuizzes",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        throw new Error(error);
      }
      conditionalLog({hook:"useGetQuizzes",status:"success",quizCount:data?.quizzes?.length,totalCount:data?.totalCount},{label:LOG_LABELS.DATA_FETCH});
      return data;
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuizAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz created successfully");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create quiz");
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateQuizAction>[1];
    }) => updateQuizAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update quiz");
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuizAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete quiz");
    },
  });
};

export const useBulkDeleteQuizzes = () => {
  const queryClient = useQueryClient();
  const { clearSelection } = useQuizTableStore();
  const { setLoading } = useBulkOperationStore();

  return useMutation({
    mutationFn: bulkDeleteQuizzesAction,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      clearSelection();
      toast.success(`${data.data?.count || 0} quizzes deleted successfully`);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete quizzes");
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useViewportResize = (callback: (height: number) => void) => {
  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      callback(height);
    };

    const resizeObserver = new ResizeObserver(handleResize);

    if (document.body) {
      resizeObserver.observe(document.body);
    }

    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [callback]);
};

export const useGetQuizResponses = (
  quizId: string | null,
  organizationIds?: string[]
) => {
  const { search, sort, page, itemsPerPage } = useResponseTableStore();
  const debouncedSearch = useDebounce(search, 300);
  const orgIdsKey = organizationIds?.join(",") || "";

  const queryParams: GetQuizResponsesParams | null = useMemo(() => {
    if (!quizId) return null;

    return {
      quizId,
      organizationIds,
      search: debouncedSearch,
      sortColumn: sort.column || undefined,
      sortDirection: sort.direction || undefined,
      page,
      itemsPerPage,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    quizId,
    orgIdsKey,
    debouncedSearch,
    sort.column,
    sort.direction,
    page,
    itemsPerPage,
    organizationIds,
  ]);

  const enabled = !!queryParams;
  conditionalLog({hook:"useGetQuizResponses",status:"initialized",enabled,quizId,hasOrgIds:!!organizationIds?.length},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["quiz-responses", queryParams],
    queryFn: async () => {
      if (!queryParams) return null;
      conditionalLog({hook:"useGetQuizResponses",status:"fetching",quizId,orgIds:organizationIds,page},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getQuizResponsesAction(queryParams);
      if (error) {
        conditionalLog({hook:"useGetQuizResponses",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        throw new Error(error);
      }
      conditionalLog({hook:"useGetQuizResponses",status:"success",responseCount:data?.responses?.length,totalCount:data?.totalCount},{label:LOG_LABELS.DATA_FETCH});
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
};

export const useExportResponses = () => {
  return useMutation({
    mutationFn: async ({
      quizId,
      quizTitle,
      organizationIds,
    }: {
      quizId: string;
      quizTitle: string;
      organizationIds?: string[];
    }) => {
      const params: GetQuizResponsesParams = {
        quizId,
        organizationIds,
        page: 0,
        itemsPerPage: 10000,
      };

      const { data, error } = await getQuizResponsesAction(params);
      if (error) throw new Error(error);
      if (!data) throw new Error("No data to export");

      const csvHeaders = [
        "User Name",
        "User Email",
        "Score",
        "Completed At",
        "Answers",
      ];
      const csvRows = data.responses.map((response) => [
        response.user.name || "N/A",
        response.user.email,
        response.score?.toString() || "N/A",
        new Date(response.completedAt).toLocaleString(),
        JSON.stringify(response.answers),
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) =>
          row.map((field) => `"${field.replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${quizTitle}_responses_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return data.responses.length;
    },
    onSuccess: (count) => {
      toast.success(`Exported ${count} responses successfully`);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to export responses");
    },
  });
};

export const useViewportPagination = () => {
  const calculateItemsPerPage = (viewportHeight: number) => {
    const headerHeight = 200;
    const footerHeight = 100;
    const itemHeight = 80;

    const availableHeight = viewportHeight - headerHeight - footerHeight;
    const maxItems = Math.floor(availableHeight / itemHeight);

    return Math.max(5, Math.min(50, maxItems));
  };

  return { calculateItemsPerPage };
};

export const useProcessInvitation = () => {
  return useMutation({
    mutationFn: async ({ organizationId }: { organizationId: string, role: string }) => {
      const { data, error } = await processInvitationAction(organizationId);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      toast.success("Successfully joined the organization!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to join organization");
    },
  });
};

export const useGetDashboardMetrics = (organizationIds?: string[]) => {
  const orgIdsKey = organizationIds?.join(',') || '';

  const enabled = !!organizationIds;
  conditionalLog({hook:"useGetDashboardMetrics",status:"initialized",enabled,hasOrgIds:!!organizationIds?.length},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["dashboard-metrics", orgIdsKey],
    queryFn: async () => {
      conditionalLog({hook:"useGetDashboardMetrics",status:"fetching",orgIds:organizationIds},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getDashboardMetricsAction(organizationIds);
      if (error) {
        conditionalLog({hook:"useGetDashboardMetrics",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        throw new Error(error);
      }
      conditionalLog({hook:"useGetDashboardMetrics",status:"success",data},{label:LOG_LABELS.DATA_FETCH});
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

export const useGetResponseDetail = (responseId: string | null) => {
  const enabled = !!responseId;
  conditionalLog({hook:"useGetResponseDetail",status:"initialized",enabled,responseId},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["response-detail", responseId],
    queryFn: async () => {
      if (!responseId) return null;
      conditionalLog({hook:"useGetResponseDetail",status:"fetching",responseId},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getResponseDetailAction(responseId);
      if (error) {
        conditionalLog({hook:"useGetResponseDetail",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        throw new Error(error);
      }
      conditionalLog({hook:"useGetResponseDetail",status:"success",hasData:!!data},{label:LOG_LABELS.DATA_FETCH});
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetUserResponse = (quizId: string | null) => {
  const enabled = !!quizId;
  conditionalLog({hook:"useGetUserResponse",status:"initialized",enabled,quizId},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["user-response", quizId],
    queryFn: async () => {
      if (!quizId) return null;
      conditionalLog({hook:"useGetUserResponse",status:"fetching",quizId},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getUserResponseAction(quizId);
      if (error) {
        conditionalLog({hook:"useGetUserResponse",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        throw new Error(error);
      }
      conditionalLog({hook:"useGetUserResponse",status:"success",hasData:!!data},{label:LOG_LABELS.DATA_FETCH});
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};