/**
 * Unified Media Asset Structure
 */
export interface MediaAsset {
  id: string;               // UUID
  asset_id: string;         // Unique string identifier (e.g. 'class-01')
  title: string;
  caption: string;          // Standardized from description
  image_url: string;
  alt_text: string;
  width: number;
  height: number;
  file_name: string;
  folder_path: string;
  mime_type: string;
  size_kb: number;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Unified Audio Asset Structure
 */
export interface AudioAsset {
  id: string;               // UUID
  asset_id: string;         // Unique string identifier (e.g. 'akha-history-01')
  title: string;
  caption: string;          // Standardized from description
  audio_url: string;
  transcript: string;
  duration_seconds: number;
  file_name: string;
  folder_path: string;
  mime_type: string;
  size_kb: number;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}
