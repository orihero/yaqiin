import api from './api';

export interface ExcelImportResponse {
  success: boolean;
  data?: {
    imported: number;
    errors: string[];
    message: string;
  };
  error?: {
    code: number;
    message: string;
    details?: string[];
  };
}

export interface ImportStatusResponse {
  success: boolean;
  data?: {
    message: string;
    supportedFormats: string[];
    maxFileSize: string;
    defaultLimit: string;
  };
  error?: {
    code: number;
    message: string;
  };
}

export const importProductsFromExcel = async (
  file: File,
  limit?: number
): Promise<ExcelImportResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (limit !== undefined) {
      formData.append('limit', limit.toString());
    }

    const response = await api.post('/excel-import/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Excel import error:', error);
    return {
      success: false,
      error: {
        code: error.response?.status || 500,
        message: error.response?.data?.error?.message || 'Failed to import products',
        details: error.response?.data?.error?.details || [],
      },
    };
  }
};

export const getImportStatus = async (): Promise<ImportStatusResponse> => {
  try {
    const response = await api.get('/excel-import/status');
    return response.data;
  } catch (error: any) {
    console.error('Get import status error:', error);
    return {
      success: false,
      error: {
        code: error.response?.status || 500,
        message: error.response?.data?.error?.message || 'Failed to get import status',
      },
    };
  }
};
