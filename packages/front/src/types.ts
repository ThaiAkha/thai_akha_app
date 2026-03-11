
export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  suggestions?: string[];
  isStreaming?: boolean;
}
