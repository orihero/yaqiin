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
exports.importFromExcel = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const customExcelImportService_1 = __importDefault(require("../services/customExcelImportService"));
// Multer setup for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'excel-' + uniqueSuffix + '-' + file.originalname);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) and CSV files are allowed.'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});
const importFromExcel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
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
        const result = yield customExcelImportService_1.default.importFromExcel(filePath);
        console.log(`✅ Custom Excel analysis completed:`, {
            success: result.success,
            totalRows: result.totalRows,
            productsFound: ((_a = result.products) === null || _a === void 0 ? void 0 : _a.length) || 0,
            firstCategory: ((_b = result.firstCategory) === null || _b === void 0 ? void 0 : _b.name) || 'None',
            errors: ((_c = result.errors) === null || _c === void 0 ? void 0 : _c.length) || 0
        });
        res.json({
            success: result.success,
            data: result,
            message: result.success ? 'Excel file analyzed successfully' : 'Failed to analyze Excel file'
        });
    }
    catch (error) {
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
});
exports.importFromExcel = importFromExcel;
