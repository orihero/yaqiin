"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.ImageScraperService = void 0;
const puppeteer = __importStar(require("puppeteer"));
const cheerio = __importStar(require("cheerio"));
class ImageScraperService {
    constructor() {
        this.browser = null;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browser) {
                this.browser = yield puppeteer.launch({
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ]
                });
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser) {
                yield this.browser.close();
                this.browser = null;
            }
        });
    }
    scrapeYandexImages(searchQuery_1) {
        return __awaiter(this, arguments, void 0, function* (searchQuery, maxImages = 3) {
            try {
                console.log(`🔍 Scraping Yandex images for: ${searchQuery}`);
                yield this.initialize();
                if (!this.browser) {
                    throw new Error('Browser not initialized');
                }
                const page = yield this.browser.newPage();
                // Set user agent to avoid detection
                yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
                // Navigate to Yandex Images
                const encodedQuery = encodeURIComponent(searchQuery);
                const url = `https://yandex.ru/images/search?text=${encodedQuery}&itype=photo`;
                console.log(`🌐 Navigating to: ${url}`);
                yield page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                // Wait for images to load
                yield page.waitForSelector('.serp-item__thumb', { timeout: 10000 });
                // Get the page content
                const content = yield page.content();
                const $ = cheerio.load(content);
                const images = [];
                // Extract image URLs from Yandex search results
                $('.serp-item__thumb').each((index, element) => {
                    if (images.length >= maxImages)
                        return false;
                    const $img = $(element);
                    const imgUrl = $img.attr('src') || $img.attr('data-src');
                    const alt = $img.attr('alt') || '';
                    const title = $img.attr('title') || '';
                    if (imgUrl && imgUrl.startsWith('http')) {
                        images.push({
                            url: imgUrl,
                            alt: alt,
                            title: title
                        });
                        console.log(`📸 Found image ${index + 1}: ${imgUrl}`);
                    }
                });
                // If we didn't get enough images from thumbnails, try alternative selectors
                if (images.length < maxImages) {
                    $('img[src*="yandex"]').each((index, element) => {
                        if (images.length >= maxImages)
                            return false;
                        const $img = $(element);
                        const imgUrl = $img.attr('src');
                        const alt = $img.attr('alt') || '';
                        const title = $img.attr('title') || '';
                        if (imgUrl && imgUrl.startsWith('http') && !images.some(img => img.url === imgUrl)) {
                            images.push({
                                url: imgUrl,
                                alt: alt,
                                title: title
                            });
                            console.log(`📸 Found additional image: ${imgUrl}`);
                        }
                    });
                }
                yield page.close();
                console.log(`✅ Scraped ${images.length} images for: ${searchQuery}`);
                return images.slice(0, maxImages);
            }
            catch (error) {
                console.error(`❌ Error scraping images for ${searchQuery}:`, error);
                return [];
            }
        });
    }
    scrapeUzumImages(searchQuery_1) {
        return __awaiter(this, arguments, void 0, function* (searchQuery, maxImages = 3) {
            try {
                console.log(`🔍 Scraping Uzum images for: ${searchQuery}`);
                yield this.initialize();
                if (!this.browser) {
                    throw new Error('Browser not initialized');
                }
                const page = yield this.browser.newPage();
                // Set user agent
                yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
                // Navigate to Uzum search
                const encodedQuery = encodeURIComponent(searchQuery);
                const url = `https://uzum.uz/uz/search?query=${encodedQuery}`;
                console.log(`🌐 Navigating to: ${url}`);
                yield page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                // Wait for product images to load
                yield page.waitForSelector('img[src*="uzum"]', { timeout: 10000 });
                const content = yield page.content();
                const $ = cheerio.load(content);
                const images = [];
                // Extract product images from Uzum
                $('img[src*="uzum"]').each((index, element) => {
                    if (images.length >= maxImages)
                        return false;
                    const $img = $(element);
                    const imgUrl = $img.attr('src');
                    const alt = $img.attr('alt') || '';
                    const title = $img.attr('title') || '';
                    if (imgUrl && imgUrl.startsWith('http') && !images.some(img => img.url === imgUrl)) {
                        images.push({
                            url: imgUrl,
                            alt: alt,
                            title: title
                        });
                        console.log(`📸 Found Uzum image: ${imgUrl}`);
                    }
                });
                yield page.close();
                console.log(`✅ Scraped ${images.length} Uzum images for: ${searchQuery}`);
                return images.slice(0, maxImages);
            }
            catch (error) {
                console.error(`❌ Error scraping Uzum images for ${searchQuery}:`, error);
                return [];
            }
        });
    }
    getProductImages(productName_1) {
        return __awaiter(this, arguments, void 0, function* (productName, maxImages = 3) {
            try {
                console.log(`🖼️ Getting product images for: ${productName}`);
                // Try Yandex first
                let images = yield this.scrapeYandexImages(productName, maxImages);
                // If we didn't get enough images, try Uzum
                if (images.length < maxImages) {
                    const uzumImages = yield this.scrapeUzumImages(productName, maxImages - images.length);
                    images = [...images, ...uzumImages];
                }
                // If still no images, try with a simpler search query
                if (images.length === 0) {
                    const simpleQuery = productName.split(' ').slice(0, 3).join(' '); // Take first 3 words
                    console.log(`🔄 Trying simpler query: ${simpleQuery}`);
                    images = yield this.scrapeYandexImages(simpleQuery, maxImages);
                }
                console.log(`🎯 Total images found: ${images.length}`);
                return images;
            }
            catch (error) {
                console.error(`❌ Error getting product images for ${productName}:`, error);
                return [];
            }
        });
    }
}
exports.ImageScraperService = ImageScraperService;
exports.default = new ImageScraperService();
