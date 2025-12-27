import type { BlogResponse } from "./BlogResponse";

interface BlogSort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

interface BlogPageable {
  sort: BlogSort;
  offset: number;
  pageSize: number;
  pageNumber: number;
  paged: boolean;
  unpaged: boolean;
}

export interface BlogListResponse {
  content: BlogResponse[];
  pageable: BlogPageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: BlogSort;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
