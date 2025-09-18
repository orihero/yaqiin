"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkQueue = void 0;
/**
 * Work Queue for managing product processing across multiple threads
 * Provides thread-safe access to products for parallel processing
 */
class WorkQueue {
    constructor(products) {
        this.currentIndex = 0;
        this.processedCount = 0;
        this.lock = false;
        this.products = [...products]; // Create a copy to avoid mutations
    }
    /**
     * Get the next product from the queue (thread-safe)
     */
    getNextProduct() {
        // Simple mutex to prevent race conditions
        if (this.lock) {
            return null;
        }
        this.lock = true;
        if (this.currentIndex >= this.products.length) {
            this.lock = false;
            return null;
        }
        const product = this.products[this.currentIndex];
        this.currentIndex++;
        this.lock = false;
        return product;
    }
    /**
     * Mark a product as processed
     */
    markAsProcessed() {
        this.processedCount++;
    }
    /**
     * Get the number of processed products
     */
    getProcessedCount() {
        return this.processedCount;
    }
    /**
     * Get the number of remaining products
     */
    getRemainingCount() {
        return this.products.length - this.currentIndex;
    }
    /**
     * Get the total number of products
     */
    getTotalCount() {
        return this.products.length;
    }
    /**
     * Get the progress percentage
     */
    getProgress() {
        return this.products.length > 0 ? (this.currentIndex / this.products.length) * 100 : 0;
    }
}
exports.WorkQueue = WorkQueue;
