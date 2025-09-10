import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import CustomExcelImportService from '../services/customExcelImportService';

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'excel-' + uniqueSuffix + '-' + file.originalname);
  },
});

export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) and CSV files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export const importFromExcel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📊 Custom Excel import request received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'No file uploaded',
          details: ['Please select an Excel file to analyze']
        }
      });
    }

    console.log(`📁 File uploaded: ${req.file.filename} (${req.file.size} bytes)`);
    
    // Get the full file path
    const filePath = req.file.path;
    console.log(`📂 File path: ${filePath}`);
    
    // Use the custom Excel import service
    const result = await CustomExcelImportService.importFromExcel(filePath);
    
    console.log(`✅ Custom Excel analysis completed:`, {
      success: result.success,
      totalRows: result.totalRows,
      productsFound: result.products?.length || 0,
      firstCategory: result.firstCategory?.name || 'None',
      errors: result.errors?.length || 0
    });
    
    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'Excel file analyzed successfully' : 'Failed to analyze Excel file'
    });
    
  } catch (error: any) {
    console.error('❌ Custom Excel import error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error.message || 'Failed to analyze Excel file',
        details: [error.stack || 'Unknown error occurred']
      }
    });
  }
};
