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
exports.getOutreachStats = exports.deleteOutreach = exports.sendOutreach = exports.getOutreachById = exports.getOutreachHistory = exports.createOutreach = void 0;
const Outreach_1 = require("./models/Outreach");
const User_1 = __importDefault(require("./models/User"));
const telegram_1 = require("./utils/telegram");
const createOutreach = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, message, targetType, sendImmediately } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Validate input
        if (!title || !message || !targetType) {
            res.status(400).json({ message: 'Title, message, and target type are required' });
            return;
        }
        if (title.length > 100) {
            res.status(400).json({ message: 'Title cannot exceed 100 characters' });
            return;
        }
        if (message.length > 1000) {
            res.status(400).json({ message: 'Message cannot exceed 1000 characters' });
            return;
        }
        // Get recipient count based on target type
        let recipientCount = 0;
        let query = {};
        switch (targetType) {
            case 'all':
                recipientCount = yield User_1.default.countDocuments();
                break;
            case 'customers':
                query.role = 'client';
                recipientCount = yield User_1.default.countDocuments(query);
                break;
            case 'shop_owners':
                query.role = 'shop_owner';
                recipientCount = yield User_1.default.countDocuments(query);
                break;
            case 'couriers':
                query.role = 'courier';
                recipientCount = yield User_1.default.countDocuments(query);
                break;
        }
        // Create outreach
        const outreach = new Outreach_1.Outreach({
            title,
            message,
            targetType,
            recipientCount,
            createdBy: userId,
            status: sendImmediately ? 'sent' : 'draft',
            sentAt: sendImmediately ? new Date() : undefined,
        });
        yield outreach.save();
        // If send immediately, send the messages
        if (sendImmediately) {
            yield sendOutreachMessages(outreach);
        }
        res.status(201).json({
            message: 'Outreach created successfully',
            outreach: {
                id: outreach._id,
                title: outreach.title,
                message: outreach.message,
                targetType: outreach.targetType,
                status: outreach.status,
                recipientCount: outreach.recipientCount,
                successCount: outreach.successCount,
                failureCount: outreach.failureCount,
                createdAt: outreach.createdAt,
                sentAt: outreach.sentAt,
                createdBy: outreach.createdBy,
            },
        });
    }
    catch (error) {
        console.error('Error creating outreach:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createOutreach = createOutreach;
const getOutreachHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const outreachList = yield Outreach_1.Outreach.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'firstName lastName username');
        const formattedOutreach = outreachList.map(outreach => ({
            id: outreach._id,
            title: outreach.title,
            message: outreach.message,
            targetType: outreach.targetType,
            status: outreach.status,
            recipientCount: outreach.recipientCount,
            successCount: outreach.successCount,
            failureCount: outreach.failureCount,
            createdAt: outreach.createdAt,
            sentAt: outreach.sentAt,
            createdBy: outreach.createdBy,
        }));
        res.json(formattedOutreach);
    }
    catch (error) {
        console.error('Error fetching outreach history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getOutreachHistory = getOutreachHistory;
const getOutreachById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const outreach = yield Outreach_1.Outreach.findById(id).populate('createdBy', 'firstName lastName username');
        if (!outreach) {
            res.status(404).json({ message: 'Outreach not found' });
            return;
        }
        res.json({
            id: outreach._id,
            title: outreach.title,
            message: outreach.message,
            targetType: outreach.targetType,
            status: outreach.status,
            recipientCount: outreach.recipientCount,
            successCount: outreach.successCount,
            failureCount: outreach.failureCount,
            createdAt: outreach.createdAt,
            sentAt: outreach.sentAt,
            createdBy: outreach.createdBy,
        });
    }
    catch (error) {
        console.error('Error fetching outreach:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getOutreachById = getOutreachById;
const sendOutreach = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const outreach = yield Outreach_1.Outreach.findById(id);
        if (!outreach) {
            res.status(404).json({ message: 'Outreach not found' });
            return;
        }
        if (outreach.status === 'sent') {
            res.status(400).json({ message: 'Outreach has already been sent' });
            return;
        }
        // Send the messages
        yield sendOutreachMessages(outreach);
        // Update outreach status
        outreach.status = 'sent';
        outreach.sentAt = new Date();
        yield outreach.save();
        res.json({
            message: 'Outreach sent successfully',
            outreach: {
                id: outreach._id,
                title: outreach.title,
                message: outreach.message,
                targetType: outreach.targetType,
                status: outreach.status,
                recipientCount: outreach.recipientCount,
                successCount: outreach.successCount,
                failureCount: outreach.failureCount,
                createdAt: outreach.createdAt,
                sentAt: outreach.sentAt,
                createdBy: outreach.createdBy,
            },
        });
    }
    catch (error) {
        console.error('Error sending outreach:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.sendOutreach = sendOutreach;
const deleteOutreach = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const outreach = yield Outreach_1.Outreach.findById(id);
        if (!outreach) {
            res.status(404).json({ message: 'Outreach not found' });
            return;
        }
        if (outreach.status === 'sent') {
            res.status(400).json({ message: 'Cannot delete sent outreach' });
            return;
        }
        yield Outreach_1.Outreach.findByIdAndDelete(id);
        res.json({ message: 'Outreach deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting outreach:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteOutreach = deleteOutreach;
const getOutreachStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const outreach = yield Outreach_1.Outreach.findById(id);
        if (!outreach) {
            res.status(404).json({ message: 'Outreach not found' });
            return;
        }
        const deliveryRate = outreach.recipientCount > 0
            ? (outreach.successCount / outreach.recipientCount) * 100
            : 0;
        res.json({
            totalRecipients: outreach.recipientCount,
            successfulDeliveries: outreach.successCount,
            failedDeliveries: outreach.failureCount,
            deliveryRate: Math.round(deliveryRate * 100) / 100,
        });
    }
    catch (error) {
        console.error('Error fetching outreach stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getOutreachStats = getOutreachStats;
// Helper function to send outreach messages
function sendOutreachMessages(outreach) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let query = {};
            // Build query based on target type
            switch (outreach.targetType) {
                case 'all':
                    // No additional filters
                    break;
                case 'customers':
                    query.role = 'client';
                    break;
                case 'shop_owners':
                    query.role = 'shop_owner';
                    break;
                case 'couriers':
                    query.role = 'courier';
                    break;
            }
            // Get users to send messages to
            const users = yield User_1.default.find(query).select('telegramId role');
            let successCount = 0;
            let failureCount = 0;
            // Send messages to each user
            for (const user of users) {
                if (user.telegramId) {
                    try {
                        const message = `📢 *${outreach.title}*\n\n${outreach.message}`;
                        yield (0, telegram_1.sendTelegramMessage)(user.telegramId, message);
                        successCount++;
                    }
                    catch (error) {
                        console.error(`Failed to send message to user ${user._id}:`, error);
                        failureCount++;
                    }
                }
                else {
                    failureCount++;
                }
            }
            // Update outreach with delivery stats
            outreach.successCount = successCount;
            outreach.failureCount = failureCount;
            yield outreach.save();
        }
        catch (error) {
            console.error('Error sending outreach messages:', error);
            outreach.status = 'failed';
            yield outreach.save();
            throw error;
        }
    });
}
