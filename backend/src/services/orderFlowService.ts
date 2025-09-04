import OrderFlow from '../models/OrderFlow';
import { IOrderFlow, IOrderFlowStep } from '../models/OrderFlow';

export class OrderFlowService {
  /**
   * Get all order flows
   */
  static async getAllFlows() {
    return await OrderFlow.find({}).sort({ createdAt: -1 });
  }

  /**
   * Get order flow by ID
   */
  static async getFlowById(id: string) {
    return await OrderFlow.findById(id);
  }

  /**
   * Get the appropriate flow for a shop
   */
  static async getFlowForShop(shopId?: string) {
    return await OrderFlow.getFlowForShop(shopId);
  }

  /**
   * Get flow step by status
   */
  static async getStepByStatus(status: string, shopId?: string) {
    return await OrderFlow.getStepByStatus(status, shopId);
  }

  /**
   * Get next possible statuses for a current status
   */
  static async getNextStatuses(currentStatus: string, shopId?: string) {
    return await OrderFlow.getNextStatuses(currentStatus, shopId);
  }

  /**
   * Check if a role can change status
   */
  static async canChangeStatus(
    currentStatus: string,
    newStatus: string,
    userRole: string,
    shopId?: string
  ) {
    return await OrderFlow.canChangeStatus(currentStatus, newStatus, userRole, shopId);
  }

  /**
   * Create a new order flow
   */
  static async createFlow(flowData: Partial<IOrderFlow>) {
    const flow = new OrderFlow(flowData);
    return await flow.save();
  }

  /**
   * Update an order flow
   */
  static async updateFlow(id: string, flowData: Partial<IOrderFlow>) {
    return await OrderFlow.findByIdAndUpdate(id, flowData, { new: true });
  }

  /**
   * Delete an order flow
   */
  static async deleteFlow(id: string) {
    return await OrderFlow.findByIdAndDelete(id);
  }

  /**
   * Set a flow as default
   */
  static async setDefaultFlow(id: string) {
    // First, unset any existing default flow
    await OrderFlow.updateMany({}, { isDefault: false });
    
    // Set the new default flow
    return await OrderFlow.findByIdAndUpdate(id, { isDefault: true }, { new: true });
  }

  /**
   * Get forwarding destinations for a specific order status
   */
  static async getForwardingDestinations(status: string, shopId?: string) {
    const step = await this.getStepByStatus(status, shopId);
    return step?.forwardingDestinations || [];
  }

  /**
   * Resolve forwarding destinations with actual values
   * This method will replace placeholders with actual shop/courier data
   */
  static async resolveForwardingDestinations(
    step: IOrderFlowStep,
    order: any,
    shop: any,
    courier?: any
  ) {
    const resolvedDestinations = [];

    for (const destination of step.forwardingDestinations) {
      if (!destination.isActive) continue;

      let resolvedIdentifier = destination.identifier;

      // Replace placeholders with actual values
      if (destination.identifier.includes('{{shop.orders_chat_id}}')) {
        resolvedIdentifier = shop?.orders_chat_id || '';
      } else if (destination.identifier.includes('{{shop.owner.telegramId}}')) {
        resolvedIdentifier = shop?.ownerId ? await this.getUserTelegramId(shop.ownerId) : '';
      } else if (destination.identifier.includes('{{courier.telegramId}}')) {
        resolvedIdentifier = courier?.telegramId || '';
      }

      if (resolvedIdentifier) {
        resolvedDestinations.push({
          ...destination,
          identifier: resolvedIdentifier
        });
      }
    }

    return resolvedDestinations;
  }

  /**
   * Get user telegram ID by user ID
   */
  private static async getUserTelegramId(userId: string) {
    const User = require('../models/User').default;
    const user = await User.findById(userId);
    return user?.telegramId || '';
  }

  /**
   * Get all couriers for a specific order
   */
  static async getCouriersForOrder(order: any) {
    const User = require('../models/User').default;
    return await User.find({ role: 'courier', status: 'active' });
  }

  /**
   * Get shop owner for a specific order
   */
  static async getShopOwnerForOrder(order: any) {
    const User = require('../models/User').default;
    const Shop = require('../models/Shop').default;
    
    const shop = await Shop.findById(order.shopId);
    if (!shop?.ownerId) return null;
    
    return await User.findById(shop.ownerId);
  }

  /**
   * Handle order status change and send notifications based on flow
   */
  static async handleOrderStatusChange(
    order: any,
    newStatus: string,
    updatedBy: string,
    reason?: string
  ) {
    try {
      // Get the current step for the new status
      const step = await this.getStepByStatus(newStatus, order.shopId?.toString());
      if (!step) {
        console.log(`[OrderFlow] No step found for status: ${newStatus}`);
        return;
      }

      // Get related data
      const [shop, courier] = await Promise.all([
        require('../models/Shop').default.findById(order.shopId),
        order.courierId ? require('../models/User').default.findById(order.courierId) : null
      ]);

      // Resolve forwarding destinations
      const resolvedDestinations = await this.resolveForwardingDestinations(
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
          updatedBy,
          reason
        );
      }

      console.log(`[OrderFlow] Status change to ${newStatus} processed with ${resolvedDestinations.length} destinations`);
    } catch (error) {
      console.error('[OrderFlow] Error handling order status change:', error);
    }
  }

  /**
   * Send notifications to multiple destinations
   */
  private static async sendNotificationsToDestinations(
    order: any,
    step: IOrderFlowStep,
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
        console.error(`[OrderFlow] Error sending notification to ${destination.type}:${destination.identifier}:`, error);
      }
    }
  }

  /**
   * Create notification text for order status change
   */
  private static createOrderNotificationText(
    order: any,
    step: IOrderFlowStep,
    userName: string,
    reason?: string
  ) {
    let text = `🔄 <b>${step.name}</b>\n`;
    text += `<b>Order ID:</b> <code>${order._id}</code>\n`;
    text += `<b>Updated by:</b> ${userName}\n`;
    
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
    step: IOrderFlowStep,
    destination: any
  ) {
    const courierBot = require('../bots/courierBot').default;
    const { Markup } = require('telegraf');

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
      console.error(`[OrderFlow] Error sending Telegram message to ${chatId}:`, error);
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