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
  // Always send notification to couriers first, regardless of shop group
  try {
    await sendNewOrderToCouriers(order, client);
  } catch (err: any) {
    console.error('[Order Create] Failed to notify couriers:', err);
  }
  
  // If no shop or no orders_chat_id, skip shop group notification
  if (!shop || !shop.orders_chat_id) {
    console.log('[Order Create] No shop orders_chat_id, skipping shop group notification');
    return;
  }
  
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
    
    // Send order message with buttons to shop group
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
 * Sends new order notification to all couriers with action buttons
 * @param order The order document
 * @param client The client user document
 */
export async function sendNewOrderToCouriers(order: any, client: any) {
  try {
    const User = require('../../models/User').default;
    const Shop = require('../../models/Shop').default;
    
    // Get the shop from the order
    const shop = await Shop.findById(order.shopId);
    if (!shop) {
      console.log('[Order Create] Shop not found for order');
      return;
    }
    
    console.log(`[Order Create] Finding couriers for shop ${shop._id}, shop name: ${shop.name}`);
    console.log(`[Order Create] Order items:`, JSON.stringify(order.items, null, 2));
    
    // Find couriers that belong to this shop
    // Check both shop.couriers array and user.shopId field
    const courierQuery = {
      role: 'courier',
      $or: [
        { _id: { $in: shop.couriers || [] } },
        { shopId: shop._id }
      ]
    };
    
    const allCouriers = await User.find(courierQuery);
    
    // Remove duplicates by courier ID (in case courier is in both shop.couriers and has shopId)
    const courierMap = new Map();
    allCouriers.forEach((courier: any) => {
      courierMap.set(courier._id.toString(), courier);
    });
    const couriers = Array.from(courierMap.values());
    
    console.log(`[Order Create] Found ${couriers.length} couriers for shop ${shop.name}`);
    
    if (couriers.length === 0) {
      console.log('[Order Create] No couriers found for this shop');
      return;
    }
    
    const mockCtx = { from: { language_code: 'uz' } };
    let clientName = client
      ? `${client.firstName || ''} ${client.lastName || ''}`.trim()
      : 'Client';
    let clientPhone = client?.phoneNumber || '';
    
    // Compose order details for couriers
    let orderText = `🆕 ${escapeMarkdownV2(t(mockCtx, 'newOrderLabel'))}\n`;
    orderText += `🏪 ${escapeMarkdownV2('Do\'kon:')} ${escapeMarkdownV2(shop.name)}\n`;
    orderText += `${t(mockCtx, 'orderIdLabel')} ${escapeMarkdownV2(String(order._id))}\n`;
    orderText += `${t(mockCtx, 'clientLabel')} ${escapeMarkdownV2(clientName)}`;
    
    if (clientPhone) {
      const safePhone = clientPhone.replace(/[-()\s]/g, '');
      orderText += `\nTelefon: [${escapeMarkdownV2('📞 ' + clientPhone)}](tel:${escapeMarkdownV2Url('+' + safePhone)})`;
    }
    
    orderText += `\n\n${escapeMarkdownV2(t(mockCtx, 'productsLabel'))}`;
    
    // Collect product images for sending later
    const allProductImages: string[] = [];
    
    for (const item of order.items) {
      // Safely access item properties with fallbacks
      const itemName = item.name || 'Product';
      const itemQuantity = item.quantity || 0;
      const itemPrice = item.price || 0;
      const itemSubtotal = item.subtotal || (itemPrice * itemQuantity);
      
      const productLine = `- ${itemName} x${itemQuantity} (${itemPrice} x ${itemQuantity} = ${itemSubtotal})`;
      orderText += `\n${escapeMarkdownV2(productLine)}`;
      
      // Collect images
      if (item.images && Array.isArray(item.images)) {
        allProductImages.push(...item.images);
      }
    }
    
    const totalAmount = order.pricing?.total || order.total || 0;
    orderText += `\n\n${escapeMarkdownV2(t(mockCtx, 'totalLabel'))} ${escapeMarkdownV2(String(totalAmount))}`;
    
    // Add delivery address
    if (order.deliveryAddress) {
      const addr = order.deliveryAddress;
      orderText += `\n\n📍 ${escapeMarkdownV2('Manzil:')}`;
      if (addr.street) orderText += `\n${escapeMarkdownV2(addr.street)}`;
      if (addr.city) orderText += `, ${escapeMarkdownV2(addr.city)}`;
      if (addr.district) orderText += `, ${escapeMarkdownV2(addr.district)}`;
      if (addr.building) orderText += `\n${escapeMarkdownV2('Bino:')} ${escapeMarkdownV2(addr.building)}`;
      if (addr.entrance) orderText += `, ${escapeMarkdownV2('Podyezd:')} ${escapeMarkdownV2(addr.entrance)}`;
      if (addr.apartment) orderText += `, ${escapeMarkdownV2('Xonadon:')} ${escapeMarkdownV2(addr.apartment)}`;
    }
    
    // Remove duplicate images and filter out empty strings
    const uniqueImages = [...new Set(allProductImages)].filter(img => img && img.trim() !== '');
    
    // Action buttons for couriers
    const keyboard = [
      [
        { text: '✅ Qabul qilish', callback_data: `courier_confirm_${order._id}` },
        { text: '❌ Rad etish', callback_data: `courier_reject_${order._id}` }
      ]
    ];
    
    // Send to all couriers
    for (const courier of couriers) {
      if (courier.telegramId && /^\d+$/.test(courier.telegramId)) {
        try {
          // Send order details message
          await courierBot.telegram.sendMessage(
            courier.telegramId,
            orderText,
            {
              parse_mode: 'MarkdownV2',
              reply_markup: { inline_keyboard: keyboard }
            }
          );
          
          // Send product images as album if there are any
          if (uniqueImages.length > 0) {
            console.log(`[Order Create] Sending ${uniqueImages.length} product images to courier ${courier.telegramId}`);
            await sendTelegramPhotoAlbum(courier.telegramId, uniqueImages, `🖼️ Mahsulot rasmlari - Buyurtma #${order._id}`);
          }
          
          // Send location if available
          if (order.deliveryAddress && order.deliveryAddress.coordinates) {
            await courierBot.telegram.sendLocation(
              courier.telegramId,
              order.deliveryAddress.coordinates.lat,
              order.deliveryAddress.coordinates.lng
            );
          }
          
          console.log(`[Order Create] Notification sent to courier ${courier.firstName || courier.username} (${courier.telegramId})`);
        } catch (err) {
          console.error(`[Order Create] Failed to send notification to courier ${courier.telegramId}:`, err);
        }
      } else {
        console.log(`[Order Create] Courier ${courier.firstName || courier.username} has no valid telegramId`);
      }
    }
  } catch (err) {
    console.error('[Order Create] Failed to send notifications to couriers:', err);
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