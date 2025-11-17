"use client";

import { useAppStore } from "@/app/layout.stores";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  bulkDeleteQuizzesAction,
  createQuizAction,
  deleteQuizAction,
  getDashboardMetricsAction,
  getQuizResponsesAction,
  GetQuizResponsesParams,
  getQuizzesAction,
  GetQuizzesParams,
  getResponseDetailAction,
  getUserResponseAction,
  processInvitationAction,
  updateQuizAction,
} from "./page.actions";
import {
  useBulkOperationStore,
  useDashboardDataStore,
  useQuizTableStore,
  useResponseDataStore,
  useResponseTableStore,
} from "./page.stores";

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

export const useGetMetrics = () => {
  const { selectedOrganizationIds } = useAppStore();
  const { setMetrics } = useDashboardDataStore();

  conditionalLog(
    { hook: "useGetMetrics", status: "initialized", selectedOrganizationIds },
    { label: LOG_LABELS.DATA_FETCH }
  );

  const query = useQuery({
    queryKey: ["metrics", selectedOrganizationIds],
    queryFn: async () => {
      conditionalLog(
        { hook: "useGetMetrics", status: "fetching", selectedOrganizationIds },
        { label: LOG_LABELS.DATA_FETCH }
      );
      const { data, error } = await getDashboardMetricsAction(
        selectedOrganizationIds
      );
      if (error) {
        conditionalLog(
          { hook: "useGetMetrics", status: "error", error },
          { label: LOG_LABELS.DATA_FETCH }
        );
        console.error(JSON.stringify({ hook: "useGetMetrics", error }));
        throw new Error(error);
      }
      conditionalLog(
        { hook: "useGetMetrics", status: "success", metrics: data },
        { label: LOG_LABELS.DATA_FETCH }
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      setMetrics(query.data);
    }
  }, [query.data, setMetrics]);

  return query;
};

export const useGetQuizzes = () => {
  const { search, sort, page, itemsPerPage } = useQuizTableStore();
  const { selectedOrganizationIds } = useAppStore();
  const { setQuizzes } = useDashboardDataStore();
  const debouncedSearch = useDebounce(search, 300);

  const queryParams: GetQuizzesParams = useMemo(
    () => ({
      search: debouncedSearch,
      sortColumn: sort.column || undefined,
      sortDirection: sort.direction || undefined,
      page,
      itemsPerPage,
      selectedOrganizationIds,
    }),
    [
      debouncedSearch,
      sort.column,
      sort.direction,
      page,
      itemsPerPage,
      selectedOrganizationIds,
    ]
  );

  conditionalLog(
    {
      hook: "useGetQuizzes",
      status: "initialized",
      search: debouncedSearch,
      selectedOrganizationIds,
    },
    { label: LOG_LABELS.DATA_FETCH }
  );

  const query = useQuery({
    queryKey: ["quizzes", queryParams],
    queryFn: async () => {
      conditionalLog(
        {
          hook: "useGetQuizzes",
          status: "fetching",
          search: debouncedSearch,
          page,
          selectedOrganizationIds,
        },
        { label: LOG_LABELS.DATA_FETCH }
      );
      const { data, error } = await getQuizzesAction(queryParams);
      if (error) {
        conditionalLog(
          { hook: "useGetQuizzes", status: "error", error },
          { label: LOG_LABELS.DATA_FETCH }
        );
        console.error(JSON.stringify({ hook: "useGetQuizzes", error }));
        throw new Error(error);
      }
      conditionalLog(
        {
          hook: "useGetQuizzes",
          status: "success",
          quizCount: data?.quizzes?.length,
          totalCount: data?.totalCount,
        },
        { label: LOG_LABELS.DATA_FETCH }
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (query.data) {
      setQuizzes(
        query.data.quizzes,
        query.data.totalCount,
        query.data.totalPages
      );
    }
  }, [query.data, setQuizzes]);

  return query;
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuizAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz created successfully");
    },
    onError: (error: Error) => {
      console.error(JSON.stringify({ hook: "useCreateQuiz", error }));
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
      console.error(JSON.stringify({ hook: "useUpdateQuiz", error }));
      toast.error(error?.message || "Failed to update quiz");
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuizAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz deleted successfully");
    },
    onError: (error: Error) => {
      console.error(JSON.stringify({ hook: "useDeleteQuiz", error }));
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
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      clearSelection();
      toast.success(`${data.data?.count || 0} quizzes deleted successfully`);
    },
    onError: (error: Error) => {
      console.error(JSON.stringify({ hook: "useBulkDeleteQuizzes", error }));
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

export const useGetQuizResponses = (quizId: string | null) => {
  const { search, sort, page, itemsPerPage } = useResponseTableStore();
  const { setResponses } = useResponseDataStore();
  const debouncedSearch = useDebounce(search, 300);

  const queryParams: GetQuizResponsesParams | null = useMemo(() => {
    if (!quizId) return null;

    return {
      quizId,
      search: debouncedSearch,
      sortColumn: sort.column || undefined,
      sortDirection: sort.direction || undefined,
      page,
      itemsPerPage,
    };
  }, [
    quizId,
    debouncedSearch,
    sort.column,
    sort.direction,
    page,
    itemsPerPage,
  ]);

  const enabled = !!queryParams;
  conditionalLog(
    { hook: "useGetQuizResponses", status: "initialized", enabled, quizId },
    { label: LOG_LABELS.DATA_FETCH }
  );

  const query = useQuery({
    queryKey: ["quiz-responses", queryParams],
    queryFn: async () => {
      if (!queryParams) return null;
      conditionalLog(
        { hook: "useGetQuizResponses", status: "fetching", quizId, page },
        { label: LOG_LABELS.DATA_FETCH }
      );
      const { data, error } = await getQuizResponsesAction(queryParams);
      if (error) {
        conditionalLog(
          { hook: "useGetQuizResponses", status: "error", error },
          { label: LOG_LABELS.DATA_FETCH }
        );
        console.error(JSON.stringify({ hook: "useGetQuizResponses", error }));
        throw new Error(error);
      }
      conditionalLog(
        {
          hook: "useGetQuizResponses",
          status: "success",
          responseCount: data?.responses?.length,
          totalCount: data?.totalCount,
        },
        { label: LOG_LABELS.DATA_FETCH }
      );
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (query.data) {
      setResponses(
        query.data.responses,
        query.data.totalCount,
        query.data.totalPages
      );
    }
  }, [query.data, setResponses]);

  return query;
};

export const useExportResponses = () => {
  return useMutation({
    mutationFn: async ({
      quizId,
      quizTitle,
    }: {
      quizId: string;
      quizTitle: string;
    }) => {
      const params: GetQuizResponsesParams = {
        quizId,
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
      console.error(JSON.stringify({ hook: "useExportResponses", error }));
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
    mutationFn: async ({
      organizationId,
    }: {
      organizationId: string;
      role: string;
    }) => {
      const { data, error } = await processInvitationAction(organizationId);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      toast.success("Successfully joined the organization!");
    },
    onError: (error: Error) => {
      console.error(JSON.stringify({ hook: "useProcessInvitation", error }));
      toast.error(error.message || "Failed to join organization");
    },
  });
};

export const useGetResponseDetail = (responseId: string | null) => {
  const { setResponseDetail } = useResponseDataStore();
  const enabled = !!responseId;
  conditionalLog(
    {
      hook: "useGetResponseDetail",
      status: "initialized",
      enabled,
      responseId,
    },
    { label: LOG_LABELS.DATA_FETCH }
  );

  const query = useQuery({
    queryKey: ["response-detail", responseId],
    queryFn: async () => {
      if (!responseId) return null;
      conditionalLog(
        { hook: "useGetResponseDetail", status: "fetching", responseId },
        { label: LOG_LABELS.DATA_FETCH }
      );
      const { data, error } = await getResponseDetailAction(responseId);
      if (error) {
        conditionalLog(
          { hook: "useGetResponseDetail", status: "error", error },
          { label: LOG_LABELS.DATA_FETCH }
        );
        console.error(JSON.stringify({ hook: "useGetResponseDetail", error }));
        throw new Error(error);
      }
      conditionalLog(
        { hook: "useGetResponseDetail", status: "success", hasData: !!data },
        { label: LOG_LABELS.DATA_FETCH }
      );
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setResponseDetail(query.data ?? null);
  }, [query.data, setResponseDetail]);

  return query;
};

export const useGetUserResponse = (quizId: string | null) => {
  const { setUserResponse } = useResponseDataStore();
  const enabled = !!quizId;
  conditionalLog(
    { hook: "useGetUserResponse", status: "initialized", enabled, quizId },
    { label: LOG_LABELS.DATA_FETCH }
  );

  const query = useQuery({
    queryKey: ["user-response", quizId],
    queryFn: async () => {
      if (!quizId) return null;
      conditionalLog(
        { hook: "useGetUserResponse", status: "fetching", quizId },
        { label: LOG_LABELS.DATA_FETCH }
      );
      const { data, error } = await getUserResponseAction(quizId);
      if (error) {
        conditionalLog(
          { hook: "useGetUserResponse", status: "error", error },
          { label: LOG_LABELS.DATA_FETCH }
        );
        console.error(JSON.stringify({ hook: "useGetUserResponse", error }));
        throw new Error(error);
      }
      conditionalLog(
        { hook: "useGetUserResponse", status: "success", hasData: !!data },
        { label: LOG_LABELS.DATA_FETCH }
      );
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setUserResponse(query.data ?? null);
  }, [query.data, setUserResponse]);

  return query;
};
