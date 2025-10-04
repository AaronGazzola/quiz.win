"use client";

import {
  useAdminAccess,
  useGetUser,
  useGetUserMembers,
} from "@/app/layout.hooks";
import { queryClient } from "@/app/layout.providers";
import { useAppStore } from "@/app/layout.stores";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/shadcn.utils";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Edit,
  Search,
  Settings,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetDashboardMetrics,
  useGetQuizResponses,
  useGetQuizzes,
  useGetResponseDetail,
  useGetUserResponse,
  useProcessInvitation,
  useViewportPagination,
  useViewportResize,
} from "./page.hooks";
import {
  useQuizDialogStore,
  useQuizTableStore,
  useResponseDetailStore,
  useResponseTableStore,
} from "./page.stores";
import { QuizDialog } from "./QuizDialog";

export function DashboardPageContent() {
  const { data: user } = useGetUser();
  const { data: userWithMembers } = useGetUserMembers();
  const { selectedOrganizationIds, setSelectedOrganizationIds } = useAppStore();
  const hasAdminAccess = useAdminAccess();
  const containerRef = useRef<HTMLDivElement>(null);
  const [immediateSearch, setImmediateSearch] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const organizations = useMemo(
    () =>
      userWithMembers?.member?.map((memberItem) => ({
        id: memberItem.organizationId,
        name: memberItem.organization.name,
        slug: memberItem.organization.slug || "",
        role: memberItem.role,
      })) || [],
    [userWithMembers?.member]
  );

  const processInvitationMutation = useProcessInvitation();
  const router = useRouter();

  const {
    data: metrics,
    isLoading: metricsLoading,
    isFetching: metricsFetching,
  } = useGetDashboardMetrics(selectedOrganizationIds);

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
    selectedResponseId: selectedResponseIdFromTable,
    setSearch: setResponsesSearch,
    setSort: setResponsesSort,
    setPage: setResponsesPage,
    toggleSelected: toggleResponseSelected,
    clearSelection: clearResponseSelection,
  } = useResponseTableStore();

  const { calculateItemsPerPage } = useViewportPagination();
  const {
    isOpen: dialogOpen,
    editingQuiz,
    openEdit,
    close,
  } = useQuizDialogStore();

  const {
    selectedResponseId,
    setSelectedResponseId,
    reset: resetResponseDetail,
  } = useResponseDetailStore();

  const {
    data: quizData,
    isLoading,
    isFetching: quizzesFetching,
  } = useGetQuizzes(selectedOrganizationIds);
  const {
    data: responsesData,
    isLoading: responsesLoading,
    isFetching: responsesFetching,
  } = useGetQuizResponses(selectedQuizId, selectedOrganizationIds);
  const {
    data: responseDetail,
    isLoading: responseDetailLoading,
    isFetching: responseDetailFetching,
  } = useGetResponseDetail(selectedResponseId);
  const {
    data: userResponse,
    isLoading: userResponseLoading,
    isFetching: userResponseFetching,
  } = useGetUserResponse(selectedQuizId);

  const quizzes = quizData?.quizzes || [];

  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId);
  const totalPages = quizData?.totalPages || 0;
  const totalItems = quizData?.totalCount || 0;

  useEffect(() => {
    if (
      organizations &&
      organizations.length > 0 &&
      selectedOrganizationIds.length === 0
    ) {
      setSelectedOrganizationIds(organizations.map((org) => org.id));
    }
  }, [
    organizations,
    selectedOrganizationIds.length,
    setSelectedOrganizationIds,
  ]);

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
    setSelectedQuizId(null);
    resetResponseDetail();
    clearResponseSelection();
    queryClient.invalidateQueries({ queryKey: ["quiz-responses"] });
    queryClient.invalidateQueries({ queryKey: ["response-detail"] });
  }, [selectedOrganizationIds, resetResponseDetail, clearResponseSelection]);

  useEffect(() => {
    clearResponseSelection();
    if (selectedQuizId) {
      queryClient.invalidateQueries({ queryKey: ["quiz-responses"] });
      queryClient.invalidateQueries({ queryKey: ["response-detail"] });
    }
  }, [selectedQuizId, clearResponseSelection]);

  useEffect(() => {
    if (selectedResponseId) {
      queryClient.invalidateQueries({
        queryKey: ["response-detail", selectedResponseId],
      });
    }
  }, [selectedResponseId]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitationParam = urlParams.get("invitation");

    if (invitationParam && user) {
      try {
        const invitationData = JSON.parse(decodeURIComponent(invitationParam));

        const { organizationId, role } = invitationData;

        if (organizationId && role) {
          processInvitationMutation.mutate(
            { organizationId, role },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["user"] });
                queryClient.invalidateQueries({ queryKey: ["organizations"] });

                router.replace("/");
              },
              onError: () => {
                router.replace("/");
              },
            }
          );
        }
      } catch (error) {
        console.error("Failed to process invitation:", error);
        router.replace("/dashboard");
      }
    }
  }, [user, processInvitationMutation, router]);

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

  const handleResponseSelect = (responseId: string) => {
    const newSelectedId =
      selectedResponseIdFromTable === responseId ? null : responseId;
    setSelectedResponseId(newSelectedId);
    toggleResponseSelected(responseId);
  };

  const responses = responsesData?.responses || [];
  const responsesTotalPages = responsesData?.totalPages || 0;
  const responsesTotalItems = responsesData?.totalCount || 0;

  return (
    <div
      ref={containerRef}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back,{" "}
            {user ? (
              user.email
            ) : (
              <span className="inline-block w-32 h-4 bg-muted rounded-lg"></span>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              <div className="text-2xl font-bold relative">
                <div
                  className={cn(
                    "transition-opacity duration-200",
                    metricsFetching && metrics ? "opacity-50" : "opacity-100"
                  )}
                >
                  {metrics?.totalQuizzes ?? 0}
                </div>
                {metricsLoading && (
                  <Skeleton className="absolute inset-0 h-8 w-12" />
                )}
                {metricsFetching && metrics && (
                  <div className="absolute inset-0 bg-background/20 rounded-md animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <div className="text-2xl font-bold relative">
                <div
                  className={cn(
                    "transition-opacity duration-200",
                    metricsFetching && metrics ? "opacity-50" : "opacity-100"
                  )}
                >
                  {metrics?.completedToday ?? 0}
                </div>
                {metricsLoading && (
                  <Skeleton className="absolute inset-0 h-8 w-12" />
                )}
                {metricsFetching && metrics && (
                  <div className="absolute inset-0 bg-background/20 rounded-md animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>

        {hasAdminAccess && (
          <>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <div className="text-2xl font-bold relative">
                    <div
                      className={cn(
                        "transition-opacity duration-200",
                        metricsFetching && metrics
                          ? "opacity-50"
                          : "opacity-100"
                      )}
                    >
                      {metrics?.teamMembers ?? 0}
                    </div>
                    {metricsLoading && (
                      <Skeleton className="absolute inset-0 h-8 w-12" />
                    )}
                    {metricsFetching && metrics && (
                      <div className="absolute inset-0 bg-background/20 rounded-md animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Active Invites
                  </p>
                  <div className="text-2xl font-bold relative">
                    <div
                      className={cn(
                        "transition-opacity duration-200",
                        metricsFetching && metrics
                          ? "opacity-50"
                          : "opacity-100"
                      )}
                    >
                      {metrics?.activeInvites ?? 0}
                    </div>
                    {metricsLoading && (
                      <Skeleton className="absolute inset-0 h-8 w-12" />
                    )}
                    {metricsFetching && metrics && (
                      <div className="absolute inset-0 bg-background/20 rounded-md animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 mb-6 bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Quizzes</h2>
              <p className="text-sm text-muted-foreground">
                Select a quiz to view its responses
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={immediateSearch}
                onChange={(e) => setImmediateSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto relative">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-12 px-6 py-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Select
                  </span>
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

                {hasAdminAccess && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Responses
                  </th>
                )}

                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-card divide-y divide-border">
              {isLoading || quizzesFetching ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr
                    key={i}
                    className="animate-pulse"
                  >
                    <td className="px-6 py-4">
                      <div className="w-4 h-4 bg-muted rounded-sm" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-48" />
                        <div className="h-3 bg-muted/70 rounded w-32" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-muted rounded w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-muted rounded w-8" />
                    </td>
                    {hasAdminAccess && (
                      <td className="px-6 py-4">
                        <div className="h-4 bg-muted rounded w-8" />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center space-x-3">
                        <div className="h-8 bg-muted rounded w-24" />
                        <div className="flex space-x-2">
                          <div className="w-4 h-4 bg-muted rounded" />
                          <div className="w-4 h-4 bg-muted rounded" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : quizzes.length === 0 ? (
                <tr>
                  <td
                    colSpan={hasAdminAccess ? 6 : 5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    {search
                      ? `No quizzes found matching "${search}"`
                      : "No quizzes created yet"}
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr
                    key={quiz.id}
                    className={cn(
                      "transition-colors cursor-pointer",
                      selectedQuizId === quiz.id
                        ? "bg-primary/10"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => handleQuizSelect(quiz.id)}
                  >
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                        <div className="text-sm font-medium text-foreground">
                          {quiz.title}
                        </div>
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
                      {quiz._count.Question}
                    </td>

                    {hasAdminAccess && (
                      <td className="px-6 py-4 text-sm text-foreground">
                        {quiz._count.Response}
                      </td>
                    )}

                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-3">
                        <button
                          onClick={() => router.push(`/take-quiz/${quiz.id}`)}
                          className="px-4 py-2 text-sm border border-primary/30 text-primary bg-transparent rounded-md hover:bg-primary/5 transition-colors flex items-center gap-2"
                        >
                          Take Quiz →
                        </button>
                        <div className="flex space-x-2">
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedQuizId && hasAdminAccess && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  Responses for &ldquo;{selectedQuiz?.title}&rdquo;
                </h2>
                <p className="text-sm text-muted-foreground">
                  Click on a response to view details
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search responses..."
                  value={responsesSearch}
                  onChange={(e) => setResponsesSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto relative">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-12 px-6 py-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Select
                    </span>
                  </th>
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
                {responsesLoading || responsesFetching ? (
                  Array.from({ length: responsesItemsPerPage }).map((_, i) => (
                    <tr
                      key={i}
                      className="animate-pulse"
                    >
                      <td className="px-6 py-4">
                        <div className="w-4 h-4 bg-muted rounded-sm" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-32" />
                          <div className="h-3 bg-muted/70 rounded w-40" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 bg-muted rounded-full w-12" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-muted rounded w-28" />
                      </td>
                    </tr>
                  ))
                ) : responses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      {responsesSearch
                        ? `No responses found matching "${responsesSearch}"`
                        : "No responses found for this quiz"}
                    </td>
                  </tr>
                ) : (
                  responses.map((response) => (
                    <tr
                      key={response.id}
                      className={cn(
                        "transition-colors cursor-pointer",
                        selectedResponseIdFromTable === response.id
                          ? "bg-primary/10"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => handleResponseSelect(response.id)}
                    >
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="radio"
                          name="selectedResponse"
                          checked={selectedResponseIdFromTable === response.id}
                          onChange={() => toggleResponseSelected(response.id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

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
                          {response.score !== null
                            ? `${Math.round(response.score * 100)}%`
                            : "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(response.completedAt).toLocaleDateString()}{" "}
                        {new Date(response.completedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {responsesTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {responsesPage * responsesItemsPerPage + 1} to{" "}
                {Math.min(
                  (responsesPage + 1) * responsesItemsPerPage,
                  responsesTotalItems
                )}{" "}
                of {responsesTotalItems} responses
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setResponsesPage(Math.max(0, responsesPage - 1))
                  }
                  disabled={responsesPage === 0}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from(
                  { length: Math.min(5, responsesTotalPages) },
                  (_, i) => {
                    const pageNum =
                      Math.max(
                        0,
                        Math.min(responsesTotalPages - 5, responsesPage - 2)
                      ) + i;
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
                  }
                )}

                <button
                  onClick={() =>
                    setResponsesPage(
                      Math.min(responsesTotalPages - 1, responsesPage + 1)
                    )
                  }
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

      {selectedQuizId && hasAdminAccess && selectedResponseId && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div>
              {responseDetailLoading ||
              responseDetailFetching ||
              !responseDetail ? (
                <>
                  <h2 className="text-lg font-medium text-foreground">
                    <Skeleton className="h-6 w-48 inline-block" />
                  </h2>
                  <div className="text-sm text-muted-foreground mt-1">
                    <Skeleton className="h-4 w-64 inline-block" />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-medium text-foreground">
                    Response by {responseDetail.user.name || "N/A"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Score:{" "}
                    {responseDetail.score !== null
                      ? `${Math.round(responseDetail.score * 100)}%`
                      : "N/A"}{" "}
                    | Completed:{" "}
                    {new Date(responseDetail.completedAt).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="p-6 relative">
            {responseDetailLoading ||
            responseDetailFetching ||
            !responseDetail ? (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          A
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          B
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          C
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          D
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border animate-pulse">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-muted rounded w-8" />
                          </td>
                          {[0, 1, 2, 3].map((optionIndex) => (
                            <td
                              key={optionIndex}
                              className="px-6 py-4"
                            >
                              <div className="h-4 bg-muted rounded w-12" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Question
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        A
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        B
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        C
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        D
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {responseDetail.quiz.Question.map((question, index) => {
                      const userAnswers = Array.isArray(responseDetail.answers)
                        ? responseDetail.answers as Array<{
                            questionId: string;
                            selectedAnswer: string;
                            isCorrect: boolean;
                          }>
                        : [];
                      const userAnswerObject = userAnswers.find(
                        (answer) => answer.questionId === question.id
                      );
                      const userAnswer = userAnswerObject?.selectedAnswer;

                      return (
                        <tr key={question.id}>
                          <td className="px-6 py-4 text-sm font-medium text-foreground">
                            Q{index + 1}
                          </td>
                          {[0, 1, 2, 3].map((optionIndex) => {
                            const option = question.options[optionIndex];
                            if (!option) {
                              return (
                                <td
                                  key={optionIndex}
                                  className="px-6 py-4 text-sm text-muted-foreground"
                                >
                                  -
                                </td>
                              );
                            }

                            const isUserAnswer = userAnswer === option;
                            const isCorrectAnswer =
                              option === question.correctAnswer;

                            return (
                              <td
                                key={optionIndex}
                                className={cn(
                                  "px-6 py-4 text-sm",
                                  isUserAnswer && isCorrectAnswer && "bg-green-100",
                                  isUserAnswer && !isCorrectAnswer && "bg-red-100"
                                )}
                              >
                                <div className="flex flex-col items-center space-y-1">
                                  {isCorrectAnswer && !isUserAnswer && (
                                    <Badge className="border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-50">
                                      Solution
                                    </Badge>
                                  )}
                                  {isUserAnswer && (
                                    isCorrectAnswer ? (
                                      <Check className="w-6 h-6 text-green-600" />
                                    ) : (
                                      <X className="w-6 h-6 text-red-600" />
                                    )
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedQuizId && !hasAdminAccess && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div>
              <h2 className="text-lg font-medium text-foreground">
                Your Response to &ldquo;{selectedQuiz?.title}&rdquo;
              </h2>
              <p className="text-sm text-muted-foreground">
                {userResponse
                  ? `Score: ${userResponse.score !== null ? `${Math.round(userResponse.score * 100)}%` : "N/A"} | Completed: ${new Date(userResponse.completedAt).toLocaleDateString()}`
                  : "You haven&apos;t completed this quiz yet"}
              </p>
            </div>
          </div>
          <div className="p-6 relative">
            {userResponseLoading || userResponseFetching ? (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          A
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          B
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          C
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          D
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border animate-pulse">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4">
                            <div className="h-4 bg-muted rounded w-8" />
                          </td>
                          {[0, 1, 2, 3].map((optionIndex) => (
                            <td
                              key={optionIndex}
                              className="px-6 py-4"
                            >
                              <div className="h-4 bg-muted rounded w-12" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : userResponse ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Question
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        A
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        B
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        C
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        D
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {userResponse.quiz.Question.map((question, index) => {
                      const userAnswers = Array.isArray(userResponse.answers)
                        ? userResponse.answers as Array<{
                            questionId: string;
                            selectedAnswer: string;
                            isCorrect: boolean;
                          }>
                        : [];
                      const userAnswerObject = userAnswers.find(
                        (answer) => answer.questionId === question.id
                      );
                      const userAnswer = userAnswerObject?.selectedAnswer;

                      return (
                        <tr key={question.id}>
                          <td className="px-6 py-4 text-sm font-medium text-foreground">
                            Q{index + 1}
                          </td>
                          {[0, 1, 2, 3].map((optionIndex) => {
                            const option = question.options[optionIndex];
                            if (!option) {
                              return (
                                <td
                                  key={optionIndex}
                                  className="px-6 py-4 text-sm text-muted-foreground"
                                >
                                  -
                                </td>
                              );
                            }

                            const isUserAnswer = userAnswer === option;
                            const isCorrectAnswer =
                              option === question.correctAnswer;

                            return (
                              <td
                                key={optionIndex}
                                className={cn(
                                  "px-6 py-4 text-sm",
                                  isUserAnswer && isCorrectAnswer && "bg-green-100",
                                  isUserAnswer && !isCorrectAnswer && "bg-red-100"
                                )}
                              >
                                <div className="flex flex-col items-center space-y-1">
                                  {isCorrectAnswer && !isUserAnswer && (
                                    <Badge className="border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-50">
                                      Solution
                                    </Badge>
                                  )}
                                  {isUserAnswer && (
                                    isCorrectAnswer ? (
                                      <Check className="w-6 h-6 text-green-600" />
                                    ) : (
                                      <X className="w-6 h-6 text-red-600" />
                                    )
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>You haven&apos;t completed this quiz yet.</p>
                <button
                  onClick={() => router.push(`/take-quiz/${selectedQuizId}`)}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Take Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedQuizId && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {page * itemsPerPage + 1} to{" "}
            {Math.min((page + 1) * itemsPerPage, totalItems)} of {totalItems}{" "}
            quizzes
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
              const pageNum =
                Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
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

      <QuizDialog
        open={dialogOpen}
        onOpenChange={close}
        quiz={editingQuiz}
        organizationId={selectedOrganizationIds[0] || ""}
      />
    </div>
  );
}
