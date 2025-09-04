import OrderFlow from '../models/OrderFlow';

export async function seedOrderFlow() {
  try {
    // Check if default flow already exists
    const existingFlow = await OrderFlow.findOne({ isDefault: true });
    if (existingFlow) {
      console.log('Default order flow already exists, skipping seed');
      return;
    }

    // Create default order flow based on current process
    const defaultOrderFlow = new OrderFlow({
      name: 'Default Order Flow',
      description: 'Default order forwarding flow for all shops',
      isDefault: true,
      isActive: true,
      steps: [
        {
          status: 'created',
          name: 'Order Created',
          description: 'Order has been created and needs operator confirmation',
          order: 1,
          isActive: true,
          forwardingDestinations: [
            {
              type: 'telegram_group',
              identifier: '{{shop.orders_chat_id}}', // Will be replaced with actual shop orders chat ID
              name: 'Shop Orders Group',
              isActive: true
            }
          ],
          authorizedRoles: ['Operator', 'Admin'],
          nextStatuses: ['confirmed', 'rejected']
        },
        {
          status: 'confirmed',
          name: 'Order Confirmed',
          description: 'Order confirmed by operator, sent to shop owner',
          order: 2,
          isActive: true,
          forwardingDestinations: [
            {
              type: 'telegram_user',
              identifier: '{{shop.owner.telegramId}}', // Will be replaced with shop owner telegram ID
              name: 'Shop Owner',
              isActive: true
            }
          ],
          authorizedRoles: ['ShopOwner', 'Admin'],
          nextStatuses: ['packing', 'rejected']
        },
        {
          status: 'packing',
          name: 'Order Packing',
          description: 'Order is being packed by shop',
          order: 3,
          isActive: true,
          forwardingDestinations: [
            {
              type: 'telegram_user',
              identifier: '{{shop.owner.telegramId}}',
              name: 'Shop Owner',
              isActive: true
            }
          ],
          authorizedRoles: ['ShopOwner', 'Admin'],
          nextStatuses: ['packed']
        },
        {
          status: 'packed',
          name: 'Order Packed',
          description: 'Order has been packed and is ready for courier pickup',
          order: 4,
          isActive: true,
          forwardingDestinations: [
            {
              type: 'telegram_user',
              identifier: '{{courier.telegramId}}', // Will be replaced with courier telegram ID
              name: 'Courier',
              isActive: true
            }
          ],
          authorizedRoles: ['Courier', 'Admin'],
          nextStatuses: ['courier_picked', 'rejected']
        },
        {
          status: 'courier_picked',
          name: 'Courier Picked Up',
          description: 'Order has been picked up by courier',
          order: 5,
          isActive: true,
          forwardingDestinations: [
            {
              type: 'telegram_user',
              identifier: '{{courier.telegramId}}',
              name: 'Courier',
              isActive: true
            }
          ],
          authorizedRoles: ['Courier', 'Admin'],
          nextStatuses: ['delivered']
        },
        {
          status: 'delivered',
          name: 'Order Delivered',
          description: 'Order has been delivered to customer',
          order: 6,
          isActive: true,
          forwardingDestinations: [
            {
              type: 'telegram_user',
              identifier: '{{courier.telegramId}}',
              name: 'Courier',
              isActive: true
            }
          ],
          authorizedRoles: ['Courier', 'Admin'],
          nextStatuses: ['paid', 'rejected']
        },
        {
          status: 'paid',
          name: 'Order Paid',
          description: 'Order has been paid and completed',
          order: 7,
          isActive: true,
          forwardingDestinations: [],
          authorizedRoles: ['Courier', 'Admin'],
          nextStatuses: []
        },
        {
          status: 'rejected',
          name: 'Order Rejected',
          description: 'Order has been rejected',
          order: 8,
          isActive: true,
          forwardingDestinations: [],
          authorizedRoles: ['Admin'],
          nextStatuses: []
        }
      ]
    });

    await defaultOrderFlow.save();
    console.log('Default order flow seeded successfully');
  } catch (error) {
    console.error('Error seeding order flow:', error);
    throw error;
  }
} 