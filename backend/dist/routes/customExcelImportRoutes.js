"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customExcelImportController_1 = require("../controllers/customExcelImportController");
const router = (0, express_1.Router)();
// Apply Telegram auth middleware to all routes
// router.use(telegramAuthMiddleware);
// Import and analyze Excel file
router.post('/import', customExcelImportController_1.upload.single('file'), customExcelImportController_1.importFromExcel);
exports.default = router;
