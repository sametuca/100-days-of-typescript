export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export class PaginationUtil {
  
  public static readonly DEFAULT_PAGE = 1;
  public static readonly DEFAULT_LIMIT = 10;
  public static readonly MAX_LIMIT = 100;

  public static validateParams(params: PaginationParams): {
    page: number;
    limit: number;
  } {
    let page = params.page || this.DEFAULT_PAGE;
    let limit = params.limit || this.DEFAULT_LIMIT;

    if (page < 1) page = 1;
    if (limit < 1) limit = this.DEFAULT_LIMIT;
    if (limit > this.MAX_LIMIT) limit = this.MAX_LIMIT;

    return { page, limit };
  }

  public static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  public static createMeta(
    page: number,
    limit: number,
    totalItems: number
  ): PaginationMeta {
    const totalPages = Math.ceil(totalItems / limit);

    return {
      currentPage: page,
      totalPages,
      pageSize: limit,
      totalItems,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  public static paginate<T>(
    items: T[],
    page: number,
    limit: number
  ): PaginatedResult<T> {
    const offset = this.calculateOffset(page, limit);
    const paginatedItems = items.slice(offset, offset + limit);

    return {
      data: paginatedItems,
      pagination: this.createMeta(page, limit, items.length)
    };
  }
}