/**
 * Chat message format - used across both admin and front apps
 */
export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  parts: { text: string }[];
  timestamp?: Date;
}

/**
 * Page header metadata - used in front app
 */
export interface HeaderMetadata {
  header_badge?: string | null;
  header_icon?: string | null;
  header_title?: string | null;
  header_description?: string | null;
}
