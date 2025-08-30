import { RequestHandler, Router } from 'express';
import { importProductsFromExcel, getImportStatus, upload } from '../controllers/excelImportController';
import { telegramAuthMiddleware } from '../utils/authMiddleware';

const router = Router();

// Apply Telegram auth middleware to all routes
// router.use(telegramAuthMiddleware);

// Get import service status
router.get('/status', getImportStatus as unknown as RequestHandler);

// Import products from Excel file
router.post('/import', upload.single('file'), importProductsFromExcel as unknown as RequestHandler);

export default router;
