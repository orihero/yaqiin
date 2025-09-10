import api from './api';

export interface CustomExcelImportResponse {
  success: boolean;
  data?: {
    firstCategory?: {
      name: string;
      startIndex: number;
      endIndex: number;
      productCount: number;
    };
    products: Array<{
      code: string;
      name: string;
      price: number;
      rowIndex: number;
    }>;
    totalRows: number;
    errors: string[];
  };
  error?: {
    code: number;
    message: string;
    details?: string[];
  };
}

export const importFromExcel = async (
  file: File
): Promise<CustomExcelImportResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/custom-excel-import/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Custom Excel import error:', error);
    return {
      success: false,
      error: {
        code: error.response?.status || 500,
        message: error.response?.data?.error?.message || 'Failed to import from Excel',
        details: error.response?.data?.error?.details || [],
      },
    };
  }
};
