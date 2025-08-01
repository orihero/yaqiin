import { Markup } from 'telegraf';
import courierBot from '../../bots/courierBot';
import { escapeMarkdownV2, escapeMarkdownV2Url } from '../../utils/telegram';

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
  // Compose order details
  let orderText = `${escapeMarkdownV2('🆕🛒 Yangi buyurtma!')}
Order ID: ${escapeMarkdownV2(String(order._id))}
Mijoz: ${escapeMarkdownV2(clientName)}`;
  if (clientPhone) {
    const safePhone = clientPhone.replace(/[-()\s]/g, '');
    orderText += `\nTelefon: [${escapeMarkdownV2('📞 ' + clientPhone)}](tel:${escapeMarkdownV2Url('+' + safePhone)})`;
  }
  orderText += `\n\n${escapeMarkdownV2('Mahsulotlar:')}`;
  for (const item of order.items) {
    const productLine = `- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
    orderText += `\n${escapeMarkdownV2(productLine)}`;
  }
  orderText += `\n\n${escapeMarkdownV2('Umumiy:')} ${escapeMarkdownV2(String(order.pricing.total))}`;
  // Buttons: Confirm/Accept
  const callbackRow = [
    Markup.button.callback('✅ Qabul qilish', `order_accept_${order._id}`),
  ];
  const keyboard = [callbackRow];
  const payload = {
    chat_id: shop.orders_chat_id,
    text: orderText,
    parse_mode: 'MarkdownV2',
    reply_markup: Markup.inlineKeyboard(keyboard).reply_markup,
  };
  try {
    await courierBot.telegram.sendMessage(
      shop.orders_chat_id,
      orderText,
      { reply_markup: payload.reply_markup, parse_mode: 'MarkdownV2' }
    );
  } catch (err: any) {
    console.error('[Order Create] Telegram sendMessage error (order group):', err);
    throw { on: { method: 'sendMessage', payload }, response: err };
  }
} 