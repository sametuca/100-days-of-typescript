export class ResponseTransformer {
  static transformToV1(data: any): any {
    // Transform V2 response format to V1 format
    if (data.success !== undefined && data.data !== undefined) {
      return {
        success: data.success,
        ...data.data,
        // Remove V2 specific fields
        meta: undefined,
        pagination: data.pagination ? {
          total: data.pagination.total,
          page: data.pagination.page,
          limit: data.pagination.limit
        } : undefined
      };
    }
    return data;
  }

  static transformToV2(data: any): any {
    // Transform V1 response format to V2 format
    if (data.success !== undefined && !data.meta) {
      return {
        success: data.success,
        data: {
          ...data,
          success: undefined // Remove from data object
        },
        meta: {
          version: 'v2',
          timestamp: new Date().toISOString()
        }
      };
    }
    return data;
  }

  static transformByVersion(version: string, data: any): any {
    switch (version) {
      case 'v1':
        return this.transformToV1(data);
      case 'v2':
        return this.transformToV2(data);
      default:
        return data;
    }
  }
}