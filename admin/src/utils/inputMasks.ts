// Input mask utilities for formatting numbers and prices

export const formatPrice = (value: string): string => {
  // Remove all non-digit characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');
  
  // Handle decimal points properly
  const parts = cleanValue.split('.');
  if (parts.length > 2) return value; // Don't allow multiple decimal points
  
  // Format the whole number part with spaces
  const wholePart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Combine with decimal part if exists
  const formatted = parts.length > 1 ? `${wholePart}.${parts[1]}` : wholePart;
  
  return formatted;
};

export const formatNumber = (value: string): string => {
  // Remove all non-digit characters
  const cleanValue = value.replace(/\D/g, '');
  
  // Add spaces for thousands separator
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const parseFormattedPrice = (value: string): number => {
  // Remove all non-digit characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');
  return parseFloat(cleanValue) || 0;
};

export const parseFormattedNumber = (value: string): number => {
  // Remove all non-digit characters
  const cleanValue = value.replace(/\D/g, '');
  return parseInt(cleanValue) || 0;
};

export const formatPriceWithCurrency = (value: string): string => {
  const formatted = formatPrice(value);
  return `${formatted} UZS`;
};

export const parseFormattedPriceWithCurrency = (value: string): number => {
  // Remove UZS and parse
  const cleanValue = value.replace(/UZS/g, '').trim();
  return parseFormattedPrice(cleanValue);
};
