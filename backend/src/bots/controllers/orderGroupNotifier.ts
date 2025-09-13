import { Markup, Telegram } from 'telegraf';
import { escapeMarkdownV2, escapeMarkdownV2Url } from '../../utils/telegram';

/**
 * Sends order status updates to the orders group with action buttons for admins/operators
 */
export async function sendOrderStatusUpdateToGroup(
  telegram: Telegram,
  order: any,
  shop: any,
  status: string,
  updatedBy: any
) {
  if (!shop || !shop.orders_chat_id) return;

  const User = require('../../models/User').default;
  const client = await User.findById(order.customerId);
  const clientName = client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() : 'Client';
  const clientPhone = client?.phoneNumber || '';

  const statusEmojis: Record<string, string> = {
    created: '📝',
    operator_confirmed: '✅',
    packing: '📦',
    packed: '📦',
    courier_picked: '🚚',
    delivered: '🎯',
    paid: '💵',
    rejected_by_shop: '❌',
    rejected_by_courier: '❌',
    cancelled_by_client: '🚫',
  };

  const statusLabels: Record<string, string> = {
    created: 'Buyurtma yaratildi',
    operator_confirmed: 'Buyurtma tasdiqlandi',
    packing: 'Buyurtma tayyorlanmoqda',
    packed: 'Buyurtma tayyor',
    courier_picked: 'Kuryer buyurtmani oldi',
    delivered: 'Buyurtma yetkazildi',
    paid: "Buyurtma to'landi",
    rejected_by_shop: 'Do\'kon tomonidan rad etildi',
    rejected_by_courier: 'Kuryer tomonidan rad etildi',
    cancelled_by_client: 'Mijoz tomonidan bekor qilindi',
  };

  const emoji = statusEmojis[status] || '📋';
  const statusLabel = statusLabels[status] || status;

  let orderText = `${escapeMarkdownV2(`${emoji} ${statusLabel}`)}\n` +
    `Order ID: ${escapeMarkdownV2(String(order._id))}\n` +
    `Mijoz: ${escapeMarkdownV2(clientName)}`;

  if (clientPhone) {
    const safePhone = clientPhone.replace(/[-()\s]/g, '');
    orderText += `\nTelefon: [${escapeMarkdownV2('📞 ' + clientPhone)}](tel:${escapeMarkdownV2Url('+' + safePhone)})`;
  }

  orderText += `\n\n${escapeMarkdownV2('Mahsulotlar:')}`;
  for (const item of order.items) {
    const line = `- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})`;
    orderText += `\n${escapeMarkdownV2(line)}`;
  }

  orderText += `\n\n${escapeMarkdownV2('Umumiy:')} ${escapeMarkdownV2(String(order.pricing.total))}`;

  if (updatedBy) {
    const updaterName = updatedBy.firstName || updatedBy.username || 'Unknown';
    orderText += `\n\n${escapeMarkdownV2('Yangilagan:')} ${escapeMarkdownV2(updaterName)}`;
  }

  const buttons = createStatusActionButtons(order, status);

  await telegram.sendMessage(shop.orders_chat_id, orderText, {
    parse_mode: 'MarkdownV2',
    reply_markup: buttons ? { inline_keyboard: buttons } : undefined,
  });
}

export function createStatusActionButtons(order: any, currentStatus: string) {
  const buttons: any[][] = [];

  const statusTransitions: Record<string, string[]> = {
    created: ['operator_confirmed', 'rejected_by_shop'],
    operator_confirmed: ['packing', 'rejected_by_shop'],
    packing: ['packed', 'rejected_by_shop'],
    packed: ['courier_picked', 'rejected_by_shop'],
    courier_picked: ['delivered', 'rejected_by_courier'],
    delivered: ['paid'],
    paid: [],
    rejected_by_shop: [],
    rejected_by_courier: [],
    cancelled_by_client: [],
  };

  const statusLabels: Record<string, string> = {
    created: '📝 Yaratildi',
    operator_confirmed: '✅ Tasdiqlash',
    packing: '📦 Tayyorlash',
    packed: '📦 Tayyor',
    courier_picked: '🚚 Kuryer oldi',
    delivered: '🎯 Yetkazildi',
    paid: "💵 To'landi",
    rejected_by_shop: '❌ Do\'kon rad etdi',
    rejected_by_courier: '❌ Kuryer rad etdi',
    cancelled_by_client: '🚫 Mijoz bekor qildi',
  };

  const statusEmojis: Record<string, string> = {
    created: '📝',
    operator_confirmed: '✅',
    packing: '📦',
    packed: '📦',
    courier_picked: '🚚',
    delivered: '🎯',
    paid: '💵',
    rejected_by_shop: '❌',
    rejected_by_courier: '❌',
    cancelled_by_client: '🚫',
  };

  const next = statusTransitions[currentStatus] || [];
  if (next.length > 0) {
    const row: any[] = [];
    next.forEach((st) => {
      row.push({ text: `${statusEmojis[st]} ${statusLabels[st]}`, callback_data: `admin_status_${st}_${order._id}` });
    });
    buttons.push(row);
  }

  return buttons;
}


