"use client";

import { useGetUser, useGetUserMembers } from "@/app/layout.hooks";
import { useEffect, useRef, useState } from "react";
import { Search, ChevronUp, ChevronDown, Trash2, Edit, Download } from "lucide-react";
import { cn } from "@/lib/shadcn.utils";
import { useGetQuizzes, useViewportResize, useGetQuizResponses, useExportResponses } from "./page.hooks";
import { useQuizTableStore, useViewportPagination, useQuizDialogStore, useResponseTableStore } from "./page.stores";
import { QuizDialog } from "./QuizDialog";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/app/layout.stores";
import { canAccessAdminUI, isSuperAdmin } from "@/lib/client-role.utils";

export default function QuizzesPage() {
  const { data: user } = useGetUser();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [immediateSearch, setImmediateSearch] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
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

  const {
    search: responsesSearch,
    sort: responsesSort,
    page: responsesPage,
    itemsPerPage: responsesItemsPerPage,
    setSearch: setResponsesSearch,
    setSort: setResponsesSort,
    setPage: setResponsesPage,
  } = useResponseTableStore();

  const { calculateItemsPerPage } = useViewportPagination();
  const { isOpen: dialogOpen, editingQuiz, openEdit, close } = useQuizDialogStore();

  const { data: userWithMembers } = useGetUserMembers();
  const { selectedOrganizationIds } = useAppStore();
  const { data: quizData, isLoading } = useGetQuizzes(selectedOrganizationIds);

  const { data: responsesData, isLoading: responsesLoading } = useGetQuizResponses(selectedQuizId);
  const exportResponsesMutation = useExportResponses();

  const quizzes = quizData?.quizzes || [];

  // Get selected quiz and admin status
  const selectedQuiz = quizzes.find(quiz => quiz.id === selectedQuizId);
  const isSuperAdminUser = isSuperAdmin(userWithMembers || null);
  const canViewResponses = isSuperAdminUser || canAccessAdminUI(userWithMembers || null, selectedOrganizationIds);
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

  // Reset selected quiz when organization selection changes
  useEffect(() => {
    setSelectedQuizId(null);
  }, [selectedOrganizationIds]);

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

  const handleResponseSort = (column: string) => {
    setResponsesSort(column, null);
  };

  const getResponseSortIcon = (column: string) => {
    if (responsesSort.column !== column) {
      return <ChevronUp className="w-4 h-4 opacity-0" />;
    }
    if (responsesSort.direction === "asc") {
      return <ChevronUp className="w-4 h-4" />;
    }
    if (responsesSort.direction === "desc") {
      return <ChevronDown className="w-4 h-4" />;
    }
    return <ChevronUp className="w-4 h-4 opacity-0" />;
  };

  const handleExportResponses = () => {
    if (selectedQuiz) {
      exportResponsesMutation.mutate({
        quizId: selectedQuiz.id,
        quizTitle: selectedQuiz.title,
      });
    }
  };

  const responses = responsesData?.responses || [];
  const responsesTotalPages = responsesData?.totalPages || 0;
  const responsesTotalItems = responsesData?.totalCount || 0;

  return (
    <div ref={containerRef} className="flex flex-col h-full p-6">
      {/* Quiz Table */}
      <div className="flex-1 mb-6 bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Quizzes</h2>
              <p className="text-sm text-muted-foreground">Select a quiz to view its responses</p>
            </div>
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
                    "cursor-pointer transition-colors",
                    selectedQuizId === quiz.id
                      ? "bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => router.push(`/take-quiz/${quiz.id}`)}>
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
                  onClick={handleExportResponses}
                  disabled={exportResponsesMutation.isPending || responses.length === 0}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export Responses"
                >
                  <Download className="w-4 h-4" />
                  {exportResponsesMutation.isPending ? "Exporting..." : "Export"}
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <button
                      onClick={() => handleResponseSort("userName")}
                      className="flex items-center space-x-1 hover:text-foreground"
                    >
                      <span>User</span>
                      {getResponseSortIcon("userName")}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <button
                      onClick={() => handleResponseSort("score")}
                      className="flex items-center space-x-1 hover:text-foreground"
                    >
                      <span>Score</span>
                      {getResponseSortIcon("score")}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <button
                      onClick={() => handleResponseSort("completedAt")}
                      className="flex items-center space-x-1 hover:text-foreground"
                    >
                      <span>Completed</span>
                      {getResponseSortIcon("completedAt")}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {responsesLoading ? (
                  Array.from({ length: responsesItemsPerPage }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24" /></td>
                    </tr>
                  ))
                ) : responses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      {responsesSearch ? `No responses found matching "${responsesSearch}"` : "No responses found for this quiz"}
                    </td>
                  </tr>
                ) : (
                  responses.map((response) => (
                    <tr
                      key={response.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/quiz-results/${response.quizId}?userId=${response.userId}`)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {response.user.name || "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {response.user.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground font-medium">
                          {response.score !== null ? `${Math.round(response.score * 100)}%` : "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(response.completedAt).toLocaleDateString()} {new Date(response.completedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Responses Pagination */}
          {responsesTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {responsesPage * responsesItemsPerPage + 1} to {Math.min((responsesPage + 1) * responsesItemsPerPage, responsesTotalItems)} of {responsesTotalItems} responses
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setResponsesPage(Math.max(0, responsesPage - 1))}
                  disabled={responsesPage === 0}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, responsesTotalPages) }, (_, i) => {
                  const pageNum = Math.max(0, Math.min(responsesTotalPages - 5, responsesPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setResponsesPage(pageNum)}
                      className={cn(
                        "px-3 py-1 text-sm border rounded-md",
                        pageNum === responsesPage
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => setResponsesPage(Math.min(responsesTotalPages - 1, responsesPage + 1))}
                  disabled={responsesPage >= responsesTotalPages - 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
        organizationId={selectedOrganizationIds[0] || ""}
      />
    </div>
  );
}