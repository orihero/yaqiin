import { ExcelProduct } from './types';

/**
 * Work Queue for managing product processing across multiple threads
 * Provides thread-safe access to products for parallel processing
 */
export class WorkQueue {
  private products: ExcelProduct[];
  private currentIndex: number = 0;
  private processedCount: number = 0;
  private lock: boolean = false;

  constructor(products: ExcelProduct[]) {
    this.products = [...products]; // Create a copy to avoid mutations
  }

  /**
   * Get the next product from the queue (thread-safe)
   */
  getNextProduct(): ExcelProduct | null {
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
  markAsProcessed(): void {
    this.processedCount++;
  }

  /**
   * Get the number of processed products
   */
  getProcessedCount(): number {
    return this.processedCount;
  }

  /**
   * Get the number of remaining products
   */
  getRemainingCount(): number {
    return this.products.length - this.currentIndex;
  }

  /**
   * Get the total number of products
   */
  getTotalCount(): number {
    return this.products.length;
  }

  /**
   * Get the progress percentage
   */
  getProgress(): number {
    return this.products.length > 0 ? (this.currentIndex / this.products.length) * 100 : 0;
  }
}
