"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getResponsesAction, exportResponsesAction } from "./page.actions";
import { getUserOrganizationsAction } from "../quizzes/page.actions";
import { GetResponsesParams } from "./page.types";
import { useBulkOperationStore } from "./page.stores";

export const useGetResponses = (params: GetResponsesParams) => {
  return useQuery({
    queryKey: ["responses", params],
    queryFn: async () => {
      const { data, error } = await getResponsesAction(params);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!params.organizationId,
  });
};

export const useGetUserOrganizations = () => {
  return useQuery({
    queryKey: ["user-organizations"],
    queryFn: async () => {
      const { data, error } = await getUserOrganizationsAction();
      if (error) throw new Error(error);
      return data;
    },
  });
};

export const useExportResponses = () => {
  const { setLoading } = useBulkOperationStore();

  return useMutation({
    mutationFn: async (responseIds: string[]) => {
      setLoading(true);
      const { data, error } = await exportResponsesAction(responseIds);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: (data) => {
      if (data?.exportData) {
        const csvContent = convertToCSV(data.exportData);
        downloadCSV(csvContent, `quiz-responses-${new Date().toISOString().split('T')[0]}.csv`);
        toast.success("Responses exported successfully!");
      }
      setLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export responses");
      setLoading(false);
    },
  });
};

export const useViewportResize = (callback: (height: number) => void) => {
  const observerRef = useRef<ResizeObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current?.parentElement;
    if (!element) return;

    if (window.ResizeObserver) {
      observerRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          callback(height);
        }
      });

      observerRef.current.observe(element);

      callback(element.getBoundingClientRect().height);
    } else {
      const handleResize = () => {
        callback(element.getBoundingClientRect().height);
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback]);

  return elementRef;
};

function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}

function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}