// Helper to escape Telegram MarkdownV2 special characters
export function escapeMarkdownV2(text: string) {
  return String(text).replace(/[\\_\*\[\]\(\)~`>#+\-=|{}\.!]/g, (match) => `\\${match}`);
}

// Helper to escape only parentheses for MarkdownV2 URLs
export function escapeMarkdownV2Url(text: string) {
  return String(text).replace(/[()]/g, (match) => `\\${match}`);
} 