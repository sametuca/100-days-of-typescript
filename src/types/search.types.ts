export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  sort?: SortOptions;
  pagination?: PaginationOptions;
}

export interface SearchFilters {
  status?: string[];
  priority?: string[];
  assigneeId?: string[];
  projectId?: string[];
  tags?: string[];
  dateRange?: DateRange;
  hasAttachments?: boolean;
  hasComments?: boolean;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface SortOptions {
  field: 'relevance' | 'createdAt' | 'updatedAt' | 'priority' | 'dueDate';
  order: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  facets?: SearchFacets;
}

export interface SearchFacets {
  status: Record<string, number>;
  priority: Record<string, number>;
  assignee: Record<string, number>;
  project: Record<string, number>;
  tags: Record<string, number>;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: SearchQuery;
  isDefault: boolean;
  createdAt: Date;
}

export interface SearchSuggestion {
  text: string;
  type: 'task' | 'project' | 'user' | 'tag';
  score: number;
}
