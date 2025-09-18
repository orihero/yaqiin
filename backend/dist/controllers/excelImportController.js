"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportStatus = exports.importProductsFromExcel = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const excelImportService_1 = __importDefault(require("../services/excelImportService"));
// Configure multer for file upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'excel-import-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) and CSV files are allowed.'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});
const importProductsFromExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
            parseInt(req.query.limit) :
            parseInt(process.env.EXCEL_IMPORT_LIMIT || '500');
        const filePath = req.file.path;
        console.log(`Starting Excel import from file: ${filePath}`);
        console.log(`Processing limit: ${limit === -1 ? 'All products' : limit} products`);
        // Process the Excel file
        const result = yield excelImportService_1.default.importProducts(filePath, limit);
        // Clean up the uploaded file
        try {
            fs_1.default.unlinkSync(filePath);
            console.log(`Cleaned up uploaded file: ${filePath}`);
        }
        catch (cleanupError) {
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
        }
        else {
            return res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: result.message,
                    details: result.errors
                }
            });
        }
    }
    catch (error) {
        console.error('Excel import error:', error);
        // Clean up file if it exists
        if (((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) && fs_1.default.existsSync(req.file.path)) {
            try {
                fs_1.default.unlinkSync(req.file.path);
            }
            catch (cleanupError) {
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
});
exports.importProductsFromExcel = importProductsFromExcel;
const getImportStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: 'Failed to get import status',
                details: error.message || 'Unknown error'
            }
        });
    }
});
exports.getImportStatus = getImportStatus;
