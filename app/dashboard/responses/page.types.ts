import { Response, Quiz, User } from "@prisma/client";

export interface ResponseWithDetails extends Response {
  quiz: Pick<Quiz, "id" | "title" | "description">;
  user: Pick<User, "id" | "name" | "email"> | null;
}

export interface GetResponsesParams {
  organizationId?: string;
  search?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  itemsPerPage?: number;
  quizFilter?: string;
}

export interface ResponseTableState {
  search: string;
  sort: { column: string; direction: "asc" | "desc" | null };
  page: number;
  itemsPerPage: number;
  selectedItems: Set<string>;
  setSearch: (search: string) => void;
  setSort: (column: string, direction: "asc" | "desc" | null) => void;
  setPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  toggleSelected: (id: string) => void;
  selectAll: (items: ResponseWithDetails[]) => void;
  clearSelection: () => void;
}