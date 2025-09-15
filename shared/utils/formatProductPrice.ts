import { formatPrice } from './formatPrice';
import { Product } from '../types/product';

export interface FormattedProductPrice {
  price: string; // Formatted price with currency (e.g., "19 000 UZS")
  unit: string;   // Unit part (e.g., "100mg kg" or "kg")
  full: string;   // Full formatted string (e.g., "19 000 UZS/100mg kg")
}

/**
 * Formats product price with unit information
 * Pattern: [Price][Currency]/[Unit measure][unit]
 * Examples:
 * - "19 000 UZS/100mg kg" (with unitMeasure)
 * - "19 000 UZS/kg" (without unitMeasure)
 * 
 * @param product - The product object
 * @param currency - The currency symbol (default: 'UZS')
 * @returns Object with separate price and unit parts
 */
export function formatProductPrice(product: Product, currency: string = 'UZS'): FormattedProductPrice {
  const price = product.price || product.basePrice;
  const formattedPrice = formatPrice(price);
  
  // Build the unit part
  let unitPart = '';
  if (product.unitMeasure) {
    unitPart = `${product.unitMeasure} ${product.unit}`;
  } else {
    unitPart = product.unit;
  }
  
  const priceWithCurrency = `${formattedPrice} ${currency}`;
  const fullString = `${priceWithCurrency}/${unitPart}`;
  
  return {
    price: priceWithCurrency,
    unit: unitPart,
    full: fullString
  };
}

/**
 * Formats product price with unit information for order items
 * Pattern: [Price][Currency]/[Unit measure][unit]
 * 
 * @param price - The price number
 * @param unit - The unit string
 * @param unitMeasure - Optional unit measure string
 * @param currency - The currency symbol (default: 'UZS')
 * @returns Object with separate price and unit parts
 */
export function formatOrderItemPrice(
  price: number, 
  unit: string, 
  unitMeasure?: string, 
  currency: string = 'UZS'
): FormattedProductPrice {
  const formattedPrice = formatPrice(price);
  
  // Build the unit part
  let unitPart = '';
  if (unitMeasure) {
    unitPart = `${unitMeasure} ${unit}`;
  } else {
    unitPart = unit;
  }
  
  const priceWithCurrency = `${formattedPrice} ${currency}`;
  const fullString = `${priceWithCurrency}/${unitPart}`;
  
  return {
    price: priceWithCurrency,
    unit: unitPart,
    full: fullString
  };
}
