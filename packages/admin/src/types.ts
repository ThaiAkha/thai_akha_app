
export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  suggestions?: string[];
  isStreaming?: boolean;
}

export interface HeaderMetadata {
  badge?: string;
  icon?: string;
  titleMain?: string;
  titleHighlight?: string;
  description?: string;
}
