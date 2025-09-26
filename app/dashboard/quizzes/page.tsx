"use client";

import { useGetUser } from "@/app/layout.hooks";
import { useEffect, useRef, useState } from "react";
import { Search, ChevronUp, ChevronDown, Trash2, Edit, Play, Download } from "lucide-react";
import { cn } from "@/lib/shadcn.utils";
import { useGetQuizzes, useBulkDeleteQuizzes, useViewportResize, useGetUserOrganizations } from "./page.hooks";
import { useQuizTableStore, useBulkOperationStore, useViewportPagination, useQuizDialogStore } from "./page.stores";
import { QuizDialog } from "./QuizDialog";
import { useRouter } from "next/navigation";

export default function QuizzesPage() {
  const { data: user } = useGetUser();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [immediateSearch, setImmediateSearch] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [responsesSearch, setResponsesSearch] = useState("");

  const {
    search,
    sort,
    page,
    itemsPerPage,
    setSearch,
    setSort,
    setPage,
    setItemsPerPage,
  } = useQuizTableStore();

  const { isLoading: bulkLoading } = useBulkOperationStore();
  const { calculateItemsPerPage } = useViewportPagination();
  const { isOpen: dialogOpen, editingQuiz, openCreate, openEdit, close } = useQuizDialogStore();

  const { data: organizations } = useGetUserOrganizations();
  const { data: quizData, isLoading } = useGetQuizzes(selectedOrganization || organizations?.[0]?.id);
  const bulkDeleteMutation = useBulkDeleteQuizzes();

  const quizzes = quizData?.quizzes || [];

  // Get selected quiz and current organization details
  const selectedQuiz = quizzes.find(quiz => quiz.id === selectedQuizId);
  const currentOrgId = selectedOrganization || organizations?.[0]?.id || "";
  const currentOrg = organizations?.find(org => org.id === currentOrgId);
  const isAdmin = currentOrg?.role === "admin" || currentOrg?.role === "owner";
  const isSuperAdmin = user?.role === "super-admin";
  const canViewResponses = isAdmin || isSuperAdmin;
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

  // Reset selected quiz when organization changes
  useEffect(() => {
    setSelectedQuizId(null);
  }, [selectedOrganization]);

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

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuizId(selectedQuizId === quizId ? null : quizId);
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full p-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Quiz Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-50 mt-1">Manage quizzes and view responses</p>
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
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

        </div>
      </div>


      {/* Quiz Table */}
      <div className="flex-1 mb-6 bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">Quizzes</h2>
          <p className="text-sm text-muted-foreground">Select a quiz to view its responses</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-12 px-6 py-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select</span>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center space-x-1 hover:text-foreground"
                  >
                    <span>Title</span>
                    {getSortIcon("title")}
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center space-x-1 hover:text-foreground"
                  >
                    <span>Created</span>
                    {getSortIcon("createdAt")}
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Questions
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Responses
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-card divide-y divide-border">
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-4 h-4 bg-muted rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20" /></td>
                  </tr>
                ))
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {search ? `No quizzes found matching "${search}"` : "No quizzes created yet"}
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz.id} className={cn(
                    "hover:bg-muted/50 cursor-pointer transition-colors",
                    selectedQuizId === quiz.id && "bg-blue-50 border-blue-200"
                  )}>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="radio"
                        name="selectedQuiz"
                        checked={selectedQuizId === quiz.id}
                        onChange={() => handleQuizSelect(quiz.id)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">{quiz.title}</div>
                        {quiz.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-md">
                            {quiz.description}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground">
                      {quiz._count.questions}
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground">
                      {quiz._count.responses}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end space-x-2">
                        {quiz._count.questions > 0 && (
                          <button
                            onClick={() => router.push(`/dashboard/take-quiz/${quiz.id}`)}
                            className="text-green-600 hover:text-green-900"
                            title="Take Quiz"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(quiz)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Quiz"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete Quiz"
                        >
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

      {/* Responses Table */}
      {selectedQuizId && canViewResponses && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-foreground">Responses for &ldquo;{selectedQuiz?.title}&rdquo;</h2>
                <p className="text-sm text-muted-foreground">View and manage quiz responses</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search responses..."
                    value={responsesSearch}
                    onChange={(e) => setResponsesSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  title="Export Responses"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    Responses functionality will be implemented in the next phase
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedQuizId && !canViewResponses && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-center text-muted-foreground">
            <p>You need admin permissions to view quiz responses.</p>
          </div>
        </div>
      )}

      {/* Quiz Pagination */}
      {!selectedQuizId && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {page * itemsPerPage + 1} to {Math.min((page + 1) * itemsPerPage, totalItems)} of {totalItems} quizzes
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