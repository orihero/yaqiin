"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../utils/authMiddleware"));
const outreachController_1 = require("../outreachController");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(authMiddleware_1.default);
// Create new outreach
router.post('/', outreachController_1.createOutreach);
// Get outreach history
router.get('/', outreachController_1.getOutreachHistory);
// Get specific outreach by ID
router.get('/:id', outreachController_1.getOutreachById);
// Send outreach (for draft outreach)
router.post('/:id/send', outreachController_1.sendOutreach);
// Delete outreach (only for draft outreach)
router.delete('/:id', outreachController_1.deleteOutreach);
// Get outreach statistics
router.get('/:id/stats', outreachController_1.getOutreachStats);
exports.default = router;
