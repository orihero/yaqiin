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
const express_1 = require("express");
const SupportTicket_1 = __importDefault(require("../models/SupportTicket"));
const queryHelper_1 = require("../utils/queryHelper");
const router = (0, express_1.Router)();
// List all support tickets with pagination, filtering, and search
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter, page, limit, skip } = (0, queryHelper_1.parseQuery)(req);
        const [tickets, total] = yield Promise.all([
            SupportTicket_1.default.find(filter).skip(skip).limit(limit),
            SupportTicket_1.default.countDocuments(filter)
        ]);
        res.json({
            success: true,
            data: tickets,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (err) {
        next(err);
    }
}));
// Get support ticket by ID
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield SupportTicket_1.default.findById(req.params.id);
        if (!ticket)
            return next({ status: 404, message: 'Support ticket not found' });
        res.json({ success: true, data: ticket });
    }
    catch (err) {
        next(err);
    }
}));
// Create support ticket
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = new SupportTicket_1.default(req.body);
        yield ticket.save();
        res.status(201).json({ success: true, data: ticket, message: 'Support ticket created' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to create support ticket', details: err });
    }
}));
// Update support ticket
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield SupportTicket_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ticket)
            return next({ status: 404, message: 'Support ticket not found' });
        res.json({ success: true, data: ticket, message: 'Support ticket updated' });
    }
    catch (err) {
        next({ status: 400, message: 'Failed to update support ticket', details: err });
    }
}));
// Delete support ticket
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield SupportTicket_1.default.findByIdAndDelete(req.params.id);
        if (!ticket)
            return next({ status: 404, message: 'Support ticket not found' });
        res.json({ success: true, data: null, message: 'Support ticket deleted' });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
