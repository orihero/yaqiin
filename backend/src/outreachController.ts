import { Request, Response, RequestHandler } from 'express';
import { Outreach, IOutreach } from './models/Outreach';
import User, { IUser } from './models/User';
import { sendTelegramMessage } from './utils/telegram';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

interface CreateOutreachRequest {
  title: string;
  message: string;
  targetType: 'all' | 'couriers' | 'shop_owners' | 'customers';
  sendImmediately: boolean;
}

export const createOutreach = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, message, targetType, sendImmediately }: CreateOutreachRequest = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validate input
    if (!title || !message || !targetType) {
      res.status(400).json({ message: 'Title, message, and target type are required' });
      return;
    }

    if (title.length > 100) {
      res.status(400).json({ message: 'Title cannot exceed 100 characters' });
      return;
    }

    if (message.length > 1000) {
      res.status(400).json({ message: 'Message cannot exceed 1000 characters' });
      return;
    }

    // Get recipient count based on target type
    let recipientCount = 0;
    let query: any = {};

    switch (targetType) {
      case 'all':
        recipientCount = await User.countDocuments();
        break;
      case 'customers':
        query.role = 'client';
        recipientCount = await User.countDocuments(query);
        break;
      case 'shop_owners':
        query.role = 'shop_owner';
        recipientCount = await User.countDocuments(query);
        break;
      case 'couriers':
        query.role = 'courier';
        recipientCount = await User.countDocuments(query);
        break;
    }

    // Create outreach
    const outreach = new Outreach({
      title,
      message,
      targetType,
      recipientCount,
      createdBy: userId,
      status: sendImmediately ? 'sent' : 'draft',
      sentAt: sendImmediately ? new Date() : undefined,
    });

    await outreach.save();

    // If send immediately, send the messages
    if (sendImmediately) {
      await sendOutreachMessages(outreach);
    }

    res.status(201).json({
      message: 'Outreach created successfully',
      outreach: {
        id: outreach._id,
        title: outreach.title,
        message: outreach.message,
        targetType: outreach.targetType,
        status: outreach.status,
        recipientCount: outreach.recipientCount,
        successCount: outreach.successCount,
        failureCount: outreach.failureCount,
        createdAt: outreach.createdAt,
        sentAt: outreach.sentAt,
        createdBy: outreach.createdBy,
      },
    });
  } catch (error) {
    console.error('Error creating outreach:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOutreachHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const outreachList = await Outreach.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName username');

    const formattedOutreach = outreachList.map(outreach => ({
      id: outreach._id,
      title: outreach.title,
      message: outreach.message,
      targetType: outreach.targetType,
      status: outreach.status,
      recipientCount: outreach.recipientCount,
      successCount: outreach.successCount,
      failureCount: outreach.failureCount,
      createdAt: outreach.createdAt,
      sentAt: outreach.sentAt,
      createdBy: outreach.createdBy,
    }));

    res.json(formattedOutreach);
  } catch (error) {
    console.error('Error fetching outreach history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOutreachById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const outreach = await Outreach.findById(id).populate('createdBy', 'firstName lastName username');

    if (!outreach) {
      res.status(404).json({ message: 'Outreach not found' });
      return;
    }

    res.json({
      id: outreach._id,
      title: outreach.title,
      message: outreach.message,
      targetType: outreach.targetType,
      status: outreach.status,
      recipientCount: outreach.recipientCount,
      successCount: outreach.successCount,
      failureCount: outreach.failureCount,
      createdAt: outreach.createdAt,
      sentAt: outreach.sentAt,
      createdBy: outreach.createdBy,
    });
  } catch (error) {
    console.error('Error fetching outreach:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendOutreach = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const outreach = await Outreach.findById(id);

    if (!outreach) {
      res.status(404).json({ message: 'Outreach not found' });
      return;
    }

    if (outreach.status === 'sent') {
      res.status(400).json({ message: 'Outreach has already been sent' });
      return;
    }

    // Send the messages
    await sendOutreachMessages(outreach);

    // Update outreach status
    outreach.status = 'sent';
    outreach.sentAt = new Date();
    await outreach.save();

    res.json({
      message: 'Outreach sent successfully',
      outreach: {
        id: outreach._id,
        title: outreach.title,
        message: outreach.message,
        targetType: outreach.targetType,
        status: outreach.status,
        recipientCount: outreach.recipientCount,
        successCount: outreach.successCount,
        failureCount: outreach.failureCount,
        createdAt: outreach.createdAt,
        sentAt: outreach.sentAt,
        createdBy: outreach.createdBy,
      },
    });
  } catch (error) {
    console.error('Error sending outreach:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteOutreach = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const outreach = await Outreach.findById(id);

    if (!outreach) {
      res.status(404).json({ message: 'Outreach not found' });
      return;
    }

    if (outreach.status === 'sent') {
      res.status(400).json({ message: 'Cannot delete sent outreach' });
      return;
    }

    await Outreach.findByIdAndDelete(id);
    res.json({ message: 'Outreach deleted successfully' });
  } catch (error) {
    console.error('Error deleting outreach:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOutreachStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const outreach = await Outreach.findById(id);

    if (!outreach) {
      res.status(404).json({ message: 'Outreach not found' });
      return;
    }

    const deliveryRate = outreach.recipientCount > 0 
      ? (outreach.successCount / outreach.recipientCount) * 100 
      : 0;

    res.json({
      totalRecipients: outreach.recipientCount,
      successfulDeliveries: outreach.successCount,
      failedDeliveries: outreach.failureCount,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
    });
  } catch (error) {
    console.error('Error fetching outreach stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to send outreach messages
async function sendOutreachMessages(outreach: IOutreach) {
  try {
    let query: any = {};

    // Build query based on target type
    switch (outreach.targetType) {
      case 'all':
        // No additional filters
        break;
      case 'customers':
        query.role = 'client';
        break;
      case 'shop_owners':
        query.role = 'shop_owner';
        break;
      case 'couriers':
        query.role = 'courier';
        break;
    }

    // Get users to send messages to
    const users = await User.find(query).select('telegramId role');
    
    let successCount = 0;
    let failureCount = 0;

    // Send messages to each user
    for (const user of users) {
      if (user.telegramId) {
        try {
          const message = `📢 *${outreach.title}*\n\n${outreach.message}`;
          await sendTelegramMessage(user.telegramId, message);
          successCount++;
        } catch (error) {
          console.error(`Failed to send message to user ${user._id}:`, error);
          failureCount++;
        }
      } else {
        failureCount++;
      }
    }

    // Update outreach with delivery stats
    outreach.successCount = successCount;
    outreach.failureCount = failureCount;
    await outreach.save();

  } catch (error) {
    console.error('Error sending outreach messages:', error);
    outreach.status = 'failed';
    await outreach.save();
    throw error;
  }
}
