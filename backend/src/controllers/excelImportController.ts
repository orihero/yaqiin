import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import excelImportService from '../services/excelImportService';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'excel-import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) and CSV files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export const importProductsFromExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'No file uploaded'
        }
      });
    }

    // Get limit from query parameter or environment variable
    const limit = req.query.limit ? 
      parseInt(req.query.limit as string) : 
      parseInt(process.env.EXCEL_IMPORT_LIMIT || '500');

    const filePath = req.file.path;
    
    console.log(`Starting Excel import from file: ${filePath}`);
    console.log(`Processing limit: ${limit === -1 ? 'All products' : limit} products`);

    // Process the Excel file
    const result = await excelImportService.importProducts(filePath, limit);

    // Clean up the uploaded file
    try {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up uploaded file: ${filePath}`);
    } catch (cleanupError) {
      console.warn(`Failed to clean up file ${filePath}:`, cleanupError);
    }

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: {
          imported: result.imported,
          errors: result.errors,
          message: result.message
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: result.message,
          details: result.errors
        }
      });
    }
      } catch (error: any) {
      console.error('Excel import error:', error);
      
      // Clean up file if it exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.warn('Failed to clean up file after error:', cleanupError);
        }
      }

      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Failed to import products from Excel',
          details: error.message || 'Unknown error'
        }
      });
    }
};

export const getImportStatus = async (req: Request, res: Response) => {
  try {
    // This could be enhanced to track import progress in the future
    return res.status(200).json({
      success: true,
      data: {
        message: 'Excel import service is available',
        supportedFormats: ['.xlsx', '.xls', '.csv'],
        maxFileSize: '10MB',
        defaultLimit: process.env.EXCEL_IMPORT_LIMIT || '500'
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: 'Failed to get import status',
        details: error.message || 'Unknown error'
      }
    });
  }
};
