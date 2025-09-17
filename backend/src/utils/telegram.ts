// Helper to escape Telegram MarkdownV2 special characters
export function escapeMarkdownV2(text: string) {
  return String(text).replace(/[\\_\*\[\]\(\)~`>#+\-=|{}\.!]/g, (match) => `\\${match}`);
}

// Helper to escape only parentheses for MarkdownV2 URLs
export function escapeMarkdownV2Url(text: string) {
  return String(text).replace(/[()]/g, (match) => `\\${match}`);
}

// Function to send Telegram messages using the Bot API
export async function sendTelegramMessage(chatId: string, message: string): Promise<void> {
  const token = process.env.MAIN_BOT_TOKEN;
  if (!token) {
    throw new Error('MAIN_BOT_TOKEN is not set in environment variables');
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${errorData.description || response.statusText}`);
    }

    const result = await response.json();
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

// Function to send photo album to Telegram using Bot API
export async function sendTelegramPhotoAlbum(chatId: string, photos: string[], caption?: string): Promise<void> {
  const token = process.env.COURIER_BOT_TOKEN;
  if (!token) {
    throw new Error('COURIER_BOT_TOKEN is not set in environment variables');
  }

  if (!photos || photos.length === 0) {
    console.log('No photos to send');
    return;
  }

  // Telegram API supports up to 10 photos in an album
  const photosToSend = photos.slice(0, 10);
  
  try {
    const url = `https://api.telegram.org/bot${token}/sendMediaGroup`;
    
    const media = photosToSend.map((photo, index) => ({
      type: 'photo',
      media: photo,
      caption: index === 0 ? caption : undefined, // Only first photo gets caption
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        media: media,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${errorData.description || response.statusText}`);
    }

    const result = await response.json();
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }

    console.log(`Successfully sent ${photosToSend.length} photos to Telegram group`);
  } catch (error) {
    console.error('Error sending Telegram photo album:', error);
    throw error;
  }
} 