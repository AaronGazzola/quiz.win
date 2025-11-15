import { quiz, Question, Response } from "@prisma/client";

export interface DashboardMetrics {
  totalQuizzes: number;
  completedToday: number;
  teamMembers: number;
  activeInvites: number;
}

export interface ProcessInvitationData {
  organizationId: string;
  role: string;
}

export interface QuizWithDetails extends quiz {
  Question: Question[];
  Response: Response[];
  organization: {
    id: string;
    name: string;
  };
  _count: {
    Question: number;
    Response: number;
  };
}

export interface ResponseWithUser extends Response {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface ResponseWithDetails extends ResponseWithUser {
  quiz: {
    id: string;
    title: string;
    Question: Question[];
  };
}

export interface QuestionWithUserAnswer extends Question {
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface TableState {
  search: string;
  sort: {
    column: string;
    direction: "asc" | "desc" | null;
  };
  page: number;
  itemsPerPage: number;
  selectedItems: Set<string>;
  setSearch: (search: string) => void;
  setSort: (column: string, direction: "asc" | "desc" | null) => void;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setSelectedItems: (selectedItems: Set<string>) => void;
  toggleSelected: (id: string) => void;
  selectAll: (items: QuizWithDetails[]) => void;
  clearSelection: () => void;
  reset: () => void;
}

export interface BulkOperationState {
  isVisible: boolean;
  isLoading: boolean;
  setVisible: (visible: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export interface QuizTableProps {
  organizationId?: string;
}

export interface SearchAndFilterProps {
  search: string;
  onSearchChange: (search: string) => void;
}

export interface PaginationState {
  page: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface ResponseTableState {
  search: string;
  sort: {
    column: string;
    direction: "asc" | "desc" | null;
  };
  page: number;
  itemsPerPage: number;
  selectedResponseId: string | null;
  setSearch: (search: string) => void;
  setSort: (column: string, direction: "asc" | "desc" | null) => void;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setSelectedResponseId: (responseId: string | null) => void;
  toggleSelected: (id: string) => void;
  clearSelection: () => void;
  reset: () => void;
}

export interface ResponsesData {
  responses: ResponseWithUser[];
  totalCount: number;
  totalPages: number;
}

export interface ResponseDetailState {
  selectedResponseId: string | null;
  viewMode: "responses" | "response-detail";
  setSelectedResponseId: (responseId: string | null) => void;
  setViewMode: (mode: "responses" | "response-detail") => void;
  reset: () => void;
}