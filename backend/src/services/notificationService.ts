import { Markup } from 'telegraf';
import courierBot from '../bots/courierBot';
import { escapeMarkdownV2, escapeMarkdownV2Url } from '../utils/telegram';
import { OrderFlowService } from './orderFlowService';

export class NotificationService {
  /**
   * Send order created notification using flow system
   */
  static async sendOrderCreatedNotification(order: any, shop: any, client: any) {
    try {
      // Get the 'created' step from the order flow
      const step = await OrderFlowService.getStepByStatus('created', order.shopId?.toString());
      if (!step) {
        console.log('[NotificationService] No step found for status: created');
        return;
      }

      // Get related data
      const courier = order.courierId ? await require('../models/User').default.findById(order.courierId) : null;

      // Resolve forwarding destinations
      const resolvedDestinations = await OrderFlowService.resolveForwardingDestinations(
        step,
        order,
        shop,
        courier
      );

      // Send notifications to all resolved destinations
      if (resolvedDestinations.length > 0) {
        await this.sendNotificationsToDestinations(
          order,
          step,
          resolvedDestinations,
          'system',
          'Order created'
        );
      }

      console.log(`[NotificationService] Order created notification sent to ${resolvedDestinations.length} destinations`);
    } catch (error) {
      console.error('[NotificationService] Error sending order created notification:', error);
    }
  }

  /**
   * Send notifications to multiple destinations
   */
  private static async sendNotificationsToDestinations(
    order: any,
    step: any,
    destinations: any[],
    updatedBy: string,
    reason?: string
  ) {
    const User = require('../models/User').default;
    
    // Get user who made the change
    const user = await User.findById(updatedBy);
    const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'System';

    // Create order notification text
    const orderText = this.createOrderNotificationText(order, step, userName, reason);

    // Send to each destination
    for (const destination of destinations) {
      try {
        if (destination.type === 'telegram_user' || destination.type === 'telegram_group' || destination.type === 'telegram_channel') {
          await this.sendTelegramNotification(
            destination.identifier,
            orderText,
            order,
            step,
            destination
          );
        }
      } catch (error) {
        console.error(`[NotificationService] Error sending notification to ${destination.type}:${destination.identifier}:`, error);
      }
    }
  }

  /**
   * Create notification text for order
   */
  private static createOrderNotificationText(
    order: any,
    step: any,
    userName: string,
    reason?: string
  ) {
    let text = `🆕 <b>${step.name}</b>\n`;
    text += `<b>Order ID:</b> <code>${order._id}</code>\n`;
    
    if (userName !== 'System') {
      text += `<b>Updated by:</b> ${userName}\n`;
    }
    
    if (reason) {
      text += `<b>Reason:</b> ${reason}\n`;
    }

    text += `\n<b>Products:</b>\n`;
    for (const item of order.items) {
      text += `- ${item.name} x${item.quantity} (${item.price} x ${item.quantity} = ${item.subtotal})\n`;
    }
    
    text += `\n<b>Total:</b> ${order.pricing.total}`;
    text += `\n\n<b>Next step:</b> ${step.description || 'No description'}`;

    return text;
  }

  /**
   * Send Telegram notification with appropriate buttons
   */
  private static async sendTelegramNotification(
    chatId: string,
    text: string,
    order: any,
    step: any,
    destination: any
  ) {
    // Create buttons based on next statuses
    const buttons = [];
    for (const nextStatus of step.nextStatuses) {
      const buttonText = this.getButtonTextForStatus(nextStatus);
      if (buttonText) {
        buttons.push([
          Markup.button.callback(
            buttonText,
            `order_flow_${nextStatus}_${order._id}`
          )
        ]);
      }
    }

    const keyboard = buttons.length > 0 ? Markup.inlineKeyboard(buttons) : undefined;

    try {
      await courierBot.telegram.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: keyboard?.reply_markup
      });
    } catch (error) {
      console.error(`[NotificationService] Error sending Telegram message to ${chatId}:`, error);
    }
  }

  /**
   * Get button text for a status
   */
  private static getButtonTextForStatus(status: string): string {
    const statusButtons: { [key: string]: string } = {
      'confirmed': '✅ Confirm',
      'packing': '📦 Start Packing',
      'packed': '📦 Finish Packing',
      'courier_picked': '🚚 Pick Up',
      'delivered': '✅ Delivered',
      'paid': '💵 Paid',
      'rejected': '❌ Reject'
    };
    return statusButtons[status] || '';
  }
} 