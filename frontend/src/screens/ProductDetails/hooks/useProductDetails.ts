import { useQuery } from '@tanstack/react-query';
import { getProductById, getRelatedProducts } from '../../../services/productService';
import { Product } from '@yaqiin/shared/types/product';
import { useUserStore } from '../../../store/userStore';

export function useProductDetails(productId: string) {
  const user = useUserStore(state => state.user);
  const shopId = user?.shopId;
  
  return useQuery({
    queryKey: ['product', productId, shopId],
    queryFn: () => getProductById(productId, shopId),
    enabled: !!productId,
  });
}

export function useRelatedProducts(productId: string) {
  const user = useUserStore(state => state.user);
  const shopId = user?.shopId;
  
  return useQuery({
    queryKey: ['relatedProducts', productId, shopId],
    queryFn: () => getRelatedProducts(productId, shopId),
    enabled: !!productId,
  });
} 