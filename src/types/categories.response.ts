export interface Category {
  id: string;
  name: string;
  box_art_url: string;
}

interface Pagination {
  cursor?: string;
}

interface CategoriesResponse {
  data: Category[];
  pagination: Pagination;
}

export interface TopCategoriesResponse extends CategoriesResponse {}
export interface SearchCategoriesResponse extends CategoriesResponse {}
