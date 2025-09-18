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
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeMarkdownV2 = escapeMarkdownV2;
exports.escapeMarkdownV2Url = escapeMarkdownV2Url;
exports.sendTelegramMessage = sendTelegramMessage;
exports.sendTelegramPhotoAlbum = sendTelegramPhotoAlbum;
// Helper to escape Telegram MarkdownV2 special characters
function escapeMarkdownV2(text) {
    return String(text).replace(/[\\_\*\[\]\(\)~`>#+\-=|{}\.!]/g, (match) => `\\${match}`);
}
// Helper to escape only parentheses for MarkdownV2 URLs
function escapeMarkdownV2Url(text) {
    return String(text).replace(/[()]/g, (match) => `\\${match}`);
}
// Function to send Telegram messages using the Bot API
function sendTelegramMessage(chatId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = process.env.MAIN_BOT_TOKEN;
        if (!token) {
            throw new Error('MAIN_BOT_TOKEN is not set in environment variables');
        }
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        try {
            const response = yield fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown',
                }),
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(`Telegram API error: ${errorData.description || response.statusText}`);
            }
            const result = yield response.json();
            if (!result.ok) {
                throw new Error(`Telegram API error: ${result.description}`);
            }
        }
        catch (error) {
            console.error('Error sending Telegram message:', error);
            throw error;
        }
    });
}
// Function to send photo album to Telegram using Bot API
function sendTelegramPhotoAlbum(chatId, photos, caption) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = process.env.COURIER_BOT_TOKEN;
        if (!token) {
            throw new Error('COURIER_BOT_TOKEN is not set in environment variables');
        }
        if (!photos || photos.length === 0) {
            console.log('No photos to send');
            return;
        }
        // Telegram API supports up to 10 photos in an album
        const photosToSend = photos.slice(0, 10);
        try {
            const url = `https://api.telegram.org/bot${token}/sendMediaGroup`;
            const media = photosToSend.map((photo, index) => ({
                type: 'photo',
                media: photo,
                caption: index === 0 ? caption : undefined, // Only first photo gets caption
            }));
            const response = yield fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    media: media,
                }),
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(`Telegram API error: ${errorData.description || response.statusText}`);
            }
            const result = yield response.json();
            if (!result.ok) {
                throw new Error(`Telegram API error: ${result.description}`);
            }
            console.log(`Successfully sent ${photosToSend.length} photos to Telegram group`);
        }
        catch (error) {
            console.error('Error sending Telegram photo album:', error);
            throw error;
        }
    });
}
