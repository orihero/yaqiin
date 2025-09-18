"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const excelImportController_1 = require("../controllers/excelImportController");
const router = (0, express_1.Router)();
// Apply Telegram auth middleware to all routes
// router.use(telegramAuthMiddleware);
// Get import service status
router.get('/status', excelImportController_1.getImportStatus);
// Import products from Excel file
router.post('/import', excelImportController_1.upload.single('file'), excelImportController_1.importProductsFromExcel);
exports.default = router;
