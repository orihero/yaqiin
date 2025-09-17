import { Markup } from 'telegraf';
import courierBot from '../../bots/courierBot';
import { escapeMarkdownV2, escapeMarkdownV2Url, sendTelegramPhotoAlbum } from '../../utils/telegram';
import { t } from '../../utils/i18n';

/**
 * Sends a Telegram notification to the shop's order group when an order is created.
 * @param order The order document (with items, pricing, etc.)
 * @param shop The shop document (with orders_chat_id, ownerId, etc.)
 * @param client The user document for the client (with name, phone, etc.)
 */
export async function sendOrderCreatedTelegramNotification(order: any, shop: any, client: any) {
  if (!shop || !shop.orders_chat_id) return;
  let clientName = client
    ? `${client.firstName || ''} ${client.lastName || ''}`.trim()
    : 'Client';
  let clientPhone = client?.phoneNumber || '';
  
  // Create a mock context for translation (since we don't have a real context here)
  const mockCtx = { from: { language_code: 'uz' } };
  
  // Compose order details
  let orderText = `${escapeMarkdownV2(t(mockCtx, 'newOrderLabel'))}
${t(mockCtx, 'orderIdLabel')} ${escapeMarkdownV2(String(order._id))}
${t(mockCtx, 'clientLabel')} ${escapeMarkdownV2(clientName)}`;
  if (clientPhone) {
    const safePhone = clientPhone.replace(/[-()\s]/g, '');
    orderText += `\nTelefon: [${escapeMarkdownV2('📞 ' + clientPhone)}](tel:${escapeMarkdownV2Url('+' + safePhone)})`;
  }
  orderText += `\n\n${escapeMarkdownV2(t(mockCtx, 'productsLabel'))}`;
  for (const item of order.items) {
    const productLine = `- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
    orderText += `\n${escapeMarkdownV2(productLine)}`;
  }
  orderText += `\n\n${escapeMarkdownV2(t(mockCtx, 'totalLabel'))} ${escapeMarkdownV2(String(order.pricing.total))}`;
  
  // Buttons: Confirm/Accept
  const callbackRow = [
    Markup.button.callback(`✅ ${t(mockCtx, 'acceptBtn')}`, `order_accept_${order._id}`),
  ];
  const keyboard = [callbackRow];
  
  try {
    // Collect all product images from order items
    const allProductImages: string[] = [];
    order.items.forEach((item: any) => {
      if (item.images && Array.isArray(item.images)) {
        allProductImages.push(...item.images);
      }
    });
    
    // Remove duplicates and filter out empty strings
    const uniqueImages = [...new Set(allProductImages)].filter(img => img && img.trim() !== '');
    
    // Send order message with buttons
    await courierBot.telegram.sendMessage(
      shop.orders_chat_id,
      orderText,
      { 
        reply_markup: Markup.inlineKeyboard(keyboard).reply_markup, 
        parse_mode: 'MarkdownV2' 
      }
    );
    
    // Send product images as album if there are any
    if (uniqueImages.length > 0) {
      console.log(`[Order Create] Sending ${uniqueImages.length} product images to Telegram group`);
      await sendTelegramPhotoAlbum(shop.orders_chat_id, uniqueImages, `🖼️ Mahsulot rasmlari - Buyurtma #${order._id}`);
    } else {
      console.log('[Order Create] No product images found for this order');
    }
    
  } catch (err: any) {
    console.error('[Order Create] Telegram notification error:', err);
    // Don't throw error to avoid breaking order creation
    // Just log the error and continue
  }
}

/**
 * Sends order status updates to the orders group with action buttons for admins/operators
 * @param order The order document
 * @param shop The shop document
 * @param status The new status
 * @param updatedBy The user who updated the status
 */
// This module kept for order creation; status updates moved to orderGroupNotifier to avoid circular imports.