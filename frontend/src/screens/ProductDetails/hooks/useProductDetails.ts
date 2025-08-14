import { useQuery } from '@tanstack/react-query';
import { getProductById, getRelatedProducts } from '../../../services/productService';
import { Product } from '@yaqiin/shared/types/product';

export function useProductDetails(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });
}

export function useRelatedProducts(productId: string) {
  return useQuery({
    queryKey: ['relatedProducts', productId],
    queryFn: () => getRelatedProducts(productId),
    enabled: !!productId,
  });
} 