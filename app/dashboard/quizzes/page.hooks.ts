"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  getQuizzesAction,
  createQuizAction,
  updateQuizAction,
  deleteQuizAction,
  bulkDeleteQuizzesAction,
  getUserOrganizationsAction,
  GetQuizzesParams,
} from "./page.actions";
import { useQuizTableStore, useBulkOperationStore } from "./page.stores";

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

export const useGetQuizzes = (organizationId?: string) => {
  const { search, sort, page, itemsPerPage } = useQuizTableStore();
  const debouncedSearch = useDebounce(search, 300);

  const queryParams: GetQuizzesParams = useMemo(() => ({
    organizationId,
    search: debouncedSearch,
    sortColumn: sort.column || undefined,
    sortDirection: sort.direction || undefined,
    page,
    itemsPerPage,
  }), [organizationId, debouncedSearch, sort.column, sort.direction, page, itemsPerPage]);

  return useQuery({
    queryKey: ["quizzes", queryParams],
    queryFn: async () => {
      const { data, error } = await getQuizzesAction(queryParams);
      if (error) throw new Error(error);
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
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateQuizAction>[1] }) =>
      updateQuizAction(id, data),
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

export const useGetUserOrganizations = () => {
  return useQuery({
    queryKey: ["user-organizations"],
    queryFn: async () => {
      const { data, error } = await getUserOrganizationsAction();
      if (error) throw new Error(error);
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
};