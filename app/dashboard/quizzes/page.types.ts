import { Quiz, Question, Response, Organization } from "@prisma/client";

export interface QuizWithDetails extends Quiz {
  questions: Question[];
  responses: Response[];
  organization: {
    id: string;
    name: string;
  };
  _count: {
    questions: number;
    responses: number;
  };
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