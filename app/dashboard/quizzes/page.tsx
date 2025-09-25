"use client";

import { useGetUser } from "@/app/layout.hooks";
import { useEffect, useRef, useState } from "react";
import { Search, ChevronUp, ChevronDown, Plus, Trash2, Edit } from "lucide-react";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/shadcn.utils";
import { useGetQuizzes, useBulkDeleteQuizzes, useViewportResize, useGetUserOrganizations } from "./page.hooks";
import { useQuizTableStore, useBulkOperationStore, useViewportPagination, useQuizDialogStore } from "./page.stores";
import { QuizDialog } from "./QuizDialog";

export default function QuizzesPage() {
  const { data: user } = useGetUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const [immediateSearch, setImmediateSearch] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");

  const {
    search,
    sort,
    page,
    itemsPerPage,
    selectedItems,
    setSearch,
    setSort,
    setPage,
    setItemsPerPage,
    toggleSelected,
    selectAll,
    clearSelection,
  } = useQuizTableStore();

  const { isVisible: bulkVisible, isLoading: bulkLoading } = useBulkOperationStore();
  const { calculateItemsPerPage } = useViewportPagination();
  const { isOpen: dialogOpen, editingQuiz, openCreate, openEdit, close } = useQuizDialogStore();

  const { data: organizations } = useGetUserOrganizations();
  const { data: quizData, isLoading } = useGetQuizzes(selectedOrganization || organizations?.[0]?.id);
  const bulkDeleteMutation = useBulkDeleteQuizzes();

  const quizzes = quizData?.quizzes || [];
  const totalPages = quizData?.totalPages || 0;
  const totalItems = quizData?.totalCount || 0;

  useViewportResize((height) => {
    const newItemsPerPage = calculateItemsPerPage(height);
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
    }
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(immediateSearch);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [immediateSearch, setSearch]);

  useEffect(() => {
    if (selectedItems.size > 0) {
      useBulkOperationStore.getState().setVisible(true);
    } else {
      useBulkOperationStore.getState().setVisible(false);
    }
  }, [selectedItems.size]);

  if (!user) return null;

  const handleSort = (column: string) => {
    setSort(column, null);
  };

  const getSortIcon = (column: string) => {
    if (sort.column !== column) {
      return <ChevronUp className="w-4 h-4 opacity-0" />;
    }
    if (sort.direction === "asc") {
      return <ChevronUp className="w-4 h-4" />;
    }
    if (sort.direction === "desc") {
      return <ChevronDown className="w-4 h-4" />;
    }
    return <ChevronUp className="w-4 h-4 opacity-0" />;
  };

  const isAllSelected = quizzes.length > 0 && selectedItems.size === quizzes.length;
  const isSomeSelected = selectedItems.size > 0 && selectedItems.size < quizzes.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAll(quizzes);
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.size > 0) {
      bulkDeleteMutation.mutate(Array.from(selectedItems));
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full p-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Quiz Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage quizzes and view responses</p>
        </div>

        <div className="flex items-center gap-4">
          {organizations && organizations.length > 1 && (
            <select
              value={selectedOrganization || organizations?.[0]?.id || ""}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={immediateSearch}
              onChange={(e) => setImmediateSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quiz
          </button>
        </div>
      </div>

      {/* Bulk Operations */}
      {bulkVisible && (
        <div className="mb-4">
          <Popover open={bulkVisible}>
            <PopoverTrigger asChild>
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
                <span className="text-sm text-blue-700 mr-2">
                  {selectedItems.size} selected
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 bg-white border border-gray-200 rounded-md shadow-lg">
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {bulkLoading ? "Deleting..." : "Delete Selected"}
              </button>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-hidden bg-white border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=indeterminate]:bg-blue-500"
                    style={{
                      backgroundColor: isSomeSelected ? '#3b82f6' : undefined
                    }}
                  />
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Title</span>
                    {getSortIcon("title")}
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Created</span>
                    {getSortIcon("createdAt")}
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responses
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  </tr>
                ))
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {search ? `No quizzes found matching "${search}"` : "No quizzes created yet"}
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.has(quiz.id)}
                        onCheckedChange={() => toggleSelected(quiz.id)}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        {quiz.description && (
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {quiz.description}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {quiz._count.questions}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {quiz._count.responses}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEdit(quiz)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {page * itemsPerPage + 1} to {Math.min((page + 1) * itemsPerPage, totalItems)} of {totalItems} results
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "px-3 py-1 text-sm border rounded-md",
                    pageNum === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Quiz Dialog */}
      <QuizDialog
        open={dialogOpen}
        onOpenChange={close}
        quiz={editingQuiz}
        organizationId={selectedOrganization || organizations?.[0]?.id || ""}
      />
    </div>
  );
}