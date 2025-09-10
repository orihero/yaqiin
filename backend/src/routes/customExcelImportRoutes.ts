import { RequestHandler, Router } from 'express';
import { importFromExcel, upload } from '../controllers/customExcelImportController';
import { telegramAuthMiddleware } from '../utils/authMiddleware';

const router = Router();

// Apply Telegram auth middleware to all routes
// router.use(telegramAuthMiddleware);

// Import and analyze Excel file
router.post('/import', upload.single('file'), importFromExcel as unknown as RequestHandler);

export default router;
