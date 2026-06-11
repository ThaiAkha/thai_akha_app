// AUTO-GENERATED from Supabase (project mtqullobcsypkqgdkaob) — DO NOT EDIT BY HAND.
// Regenerate via Supabase MCP generate_typescript_types. Single source of truth for DB types.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      akha_news: {
        Row: {
          access_level: string | null
          audio_asset_id: string | null
          author_id: string | null
          breadcrumbs: Json | null
          canonical_url: string | null
          category_id: string | null
          cherry_button_ids: string[] | null
          cherry_prompt: string | null
          cherry_response: string | null
          content: string | null
          content_quality_score: number | null
          cover_asset_id: string | null
          created_at: string | null
          excerpt: string | null
          faq: Json | null
          hreflang: Json | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          json_ld: Json | null
          key_entities: Json | null
          last_content_audit_ai: string | null
          news_id: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          primary_focus_keyword: string | null
          published_at: string | null
          read_time_minutes: number | null
          related_articles: string[] | null
          related_queries_geo: Json | null
          semantic_vector: string | null
          seo_audit_logs: Json | null
          seo_description: string | null
          seo_health_score: number | null
          seo_keywords: string[] | null
          seo_robots: string | null
          seo_title: string | null
          slug: string
          subtitle: string | null
          summary_ai: string | null
          tags: string[] | null
          title: string
          twitter_card: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          access_level?: string | null
          audio_asset_id?: string | null
          author_id?: string | null
          breadcrumbs?: Json | null
          canonical_url?: string | null
          category_id?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          content?: string | null
          content_quality_score?: number | null
          cover_asset_id?: string | null
          created_at?: string | null
          excerpt?: string | null
          faq?: Json | null
          hreflang?: Json | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          news_id?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          primary_focus_keyword?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          related_articles?: string[] | null
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_audit_logs?: Json | null
          seo_description?: string | null
          seo_health_score?: number | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          slug: string
          subtitle?: string | null
          summary_ai?: string | null
          tags?: string[] | null
          title: string
          twitter_card?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          access_level?: string | null
          audio_asset_id?: string | null
          author_id?: string | null
          breadcrumbs?: Json | null
          canonical_url?: string | null
          category_id?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          content?: string | null
          content_quality_score?: number | null
          cover_asset_id?: string | null
          created_at?: string | null
          excerpt?: string | null
          faq?: Json | null
          hreflang?: Json | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          news_id?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          primary_focus_keyword?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          related_articles?: string[] | null
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_audit_logs?: Json | null
          seo_description?: string | null
          seo_health_score?: number | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          slug?: string
          subtitle?: string | null
          summary_ai?: string | null
          tags?: string[] | null
          title?: string
          twitter_card?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "akha_news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "akha_news_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "akha_news_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      audio_assets: {
        Row: {
          asset_id: string
          audio_url: string
          caption: string | null
          created_at: string | null
          duration_seconds: number | null
          file_name: string
          folder_path: string | null
          id: string
          key_entities: Json | null
          mime_type: string | null
          semantic_vector: string | null
          size_kb: number | null
          summary_ai: string | null
          title: string
          transcript: string | null
          updated_at: string | null
        }
        Insert: {
          asset_id: string
          audio_url: string
          caption?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          file_name: string
          folder_path?: string | null
          id?: string
          key_entities?: Json | null
          mime_type?: string | null
          semantic_vector?: string | null
          size_kb?: number | null
          summary_ai?: string | null
          title: string
          transcript?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_id?: string
          audio_url?: string
          caption?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          file_name?: string
          folder_path?: string | null
          id?: string
          key_entities?: Json | null
          mime_type?: string | null
          semantic_vector?: string | null
          size_kb?: number | null
          summary_ai?: string | null
          title?: string
          transcript?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      authors: {
        Row: {
          avatar_asset_id: string | null
          avatar_url: string | null
          created_at: string | null
          description: string | null
          expertise_tags: string[] | null
          id: string
          is_ai_agent: boolean | null
          is_organization: boolean | null
          json_ld: Json
          metadata: Json | null
          name: string
          same_as: string[] | null
          slug: string
          title: string | null
        }
        Insert: {
          avatar_asset_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          expertise_tags?: string[] | null
          id?: string
          is_ai_agent?: boolean | null
          is_organization?: boolean | null
          json_ld?: Json
          metadata?: Json | null
          name: string
          same_as?: string[] | null
          slug: string
          title?: string | null
        }
        Update: {
          avatar_asset_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          expertise_tags?: string[] | null
          id?: string
          is_ai_agent?: boolean | null
          is_organization?: boolean | null
          json_ld?: Json
          metadata?: Json | null
          name?: string
          same_as?: string[] | null
          slug?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "authors_avatar_asset_id_fkey"
            columns: ["avatar_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      booking_participants: {
        Row: {
          booking_id: string
          id: string
          is_leader: boolean | null
          joined_at: string | null
          user_id: string
        }
        Insert: {
          booking_id: string
          id?: string
          is_leader?: boolean | null
          joined_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string
          id?: string
          is_leader?: boolean | null
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_participants_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["internal_id"]
          },
          {
            foreignKeyName: "booking_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          actual_dropoff_time: string | null
          actual_pickup_time: string | null
          agency_note: string | null
          applied_commission_rate: number | null
          booking_date: string
          booking_ref: string | null
          booking_source: string | null
          commission_amount: number | null
          created_at: string | null
          customer_note: string | null
          dropoff_driver_uid: string | null
          dropoff_hotel: string | null
          dropoff_lat: number | null
          dropoff_lng: number | null
          dropoff_sequence: number | null
          dropoff_zone: string | null
          email_reference: string | null
          guest_email: string | null
          guest_name: string | null
          guest_user_id: string | null
          has_luggage: boolean | null
          hotel_name: string | null
          internal_id: string
          is_split_child: boolean | null
          meeting_point: string | null
          parent_booking_id: string | null
          pax_count: number | null
          payment_method: string | null
          payment_status: string | null
          phone_number: string | null
          phone_prefix: string | null
          pickup_driver_uid: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          pickup_sequence: number | null
          pickup_time: string | null
          pickup_zone: string | null
          requires_dropoff: boolean | null
          reservation_id_agency: string | null
          route_order: number | null
          session_id: string | null
          session_type: string | null
          special_requests: string | null
          status: string | null
          total_price: number | null
          transport_status: string | null
          updated_at: string | null
          user_id: string | null
          visitor_count: number | null
          zoho_invoice_id: string | null
        }
        Insert: {
          actual_dropoff_time?: string | null
          actual_pickup_time?: string | null
          agency_note?: string | null
          applied_commission_rate?: number | null
          booking_date?: string
          booking_ref?: string | null
          booking_source?: string | null
          commission_amount?: number | null
          created_at?: string | null
          customer_note?: string | null
          dropoff_driver_uid?: string | null
          dropoff_hotel?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          dropoff_sequence?: number | null
          dropoff_zone?: string | null
          email_reference?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_user_id?: string | null
          has_luggage?: boolean | null
          hotel_name?: string | null
          internal_id?: string
          is_split_child?: boolean | null
          meeting_point?: string | null
          parent_booking_id?: string | null
          pax_count?: number | null
          payment_method?: string | null
          payment_status?: string | null
          phone_number?: string | null
          phone_prefix?: string | null
          pickup_driver_uid?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_sequence?: number | null
          pickup_time?: string | null
          pickup_zone?: string | null
          requires_dropoff?: boolean | null
          reservation_id_agency?: string | null
          route_order?: number | null
          session_id?: string | null
          session_type?: string | null
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          transport_status?: string | null
          updated_at?: string | null
          user_id?: string | null
          visitor_count?: number | null
          zoho_invoice_id?: string | null
        }
        Update: {
          actual_dropoff_time?: string | null
          actual_pickup_time?: string | null
          agency_note?: string | null
          applied_commission_rate?: number | null
          booking_date?: string
          booking_ref?: string | null
          booking_source?: string | null
          commission_amount?: number | null
          created_at?: string | null
          customer_note?: string | null
          dropoff_driver_uid?: string | null
          dropoff_hotel?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          dropoff_sequence?: number | null
          dropoff_zone?: string | null
          email_reference?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_user_id?: string | null
          has_luggage?: boolean | null
          hotel_name?: string | null
          internal_id?: string
          is_split_child?: boolean | null
          meeting_point?: string | null
          parent_booking_id?: string | null
          pax_count?: number | null
          payment_method?: string | null
          payment_status?: string | null
          phone_number?: string | null
          phone_prefix?: string | null
          pickup_driver_uid?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_sequence?: number | null
          pickup_time?: string | null
          pickup_zone?: string | null
          requires_dropoff?: boolean | null
          reservation_id_agency?: string | null
          route_order?: number | null
          session_id?: string | null
          session_type?: string | null
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          transport_status?: string | null
          updated_at?: string | null
          user_id?: string | null
          visitor_count?: number | null
          zoho_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_dropoff_driver_uid_fkey"
            columns: ["dropoff_driver_uid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_guest_user_id_fkey"
            columns: ["guest_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_parent_booking_id_fkey"
            columns: ["parent_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["internal_id"]
          },
          {
            foreignKeyName: "bookings_pickup_driver_uid_fkey"
            columns: ["pickup_driver_uid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profile: {
        Row: {
          address_country: string | null
          address_locality: string | null
          address_region: string | null
          aggregate_rating: Json | null
          area_served: Json | null
          business_type: string | null
          created_at: string
          email: string | null
          founding_date: string | null
          google_place_id: string | null
          has_map: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          postal_code: string | null
          price_range: string | null
          same_as: Json | null
          service_radius: number | null
          service_type: string[] | null
          street_address: string | null
          telephone: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address_country?: string | null
          address_locality?: string | null
          address_region?: string | null
          aggregate_rating?: Json | null
          area_served?: Json | null
          business_type?: string | null
          created_at?: string
          email?: string | null
          founding_date?: string | null
          google_place_id?: string | null
          has_map?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          postal_code?: string | null
          price_range?: string | null
          same_as?: Json | null
          service_radius?: number | null
          service_type?: string[] | null
          street_address?: string | null
          telephone?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address_country?: string | null
          address_locality?: string | null
          address_region?: string | null
          aggregate_rating?: Json | null
          area_served?: Json | null
          business_type?: string | null
          created_at?: string
          email?: string | null
          founding_date?: string | null
          google_place_id?: string | null
          has_map?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          postal_code?: string | null
          price_range?: string | null
          same_as?: Json | null
          service_radius?: number | null
          service_type?: string[] | null
          street_address?: string | null
          telephone?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          booking_id: string | null
          created_at: string | null
          download_until: string | null
          generated_at: string | null
          id: string
          pdf_url: string | null
          profile_id: string
          session_type: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          download_until?: string | null
          generated_at?: string | null
          id?: string
          pdf_url?: string | null
          profile_id: string
          session_type?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          download_until?: string | null
          generated_at?: string | null
          id?: string
          pdf_url?: string | null
          profile_id?: string
          session_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["internal_id"]
          },
          {
            foreignKeyName: "certificates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          node_id: string | null
          sender_role: string
          session_id: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          node_id?: string | null
          sender_role: string
          session_id: string
          type?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          node_id?: string | null
          sender_role?: string
          session_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          last_activity: string | null
          message_count: number | null
          metadata: Json | null
          session_token: string | null
          status: string | null
          summary: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_activity?: string | null
          message_count?: number | null
          metadata?: Json | null
          session_token?: string | null
          status?: string | null
          summary?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_activity?: string | null
          message_count?: number | null
          metadata?: Json | null
          session_token?: string | null
          status?: string | null
          summary?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_calendar_overrides: {
        Row: {
          closure_reason: string | null
          created_at: string | null
          custom_capacity: number | null
          date: string
          id: string
          is_closed: boolean | null
          session_id: string
          updated_at: string | null
        }
        Insert: {
          closure_reason?: string | null
          created_at?: string | null
          custom_capacity?: number | null
          date: string
          id?: string
          is_closed?: boolean | null
          session_id: string
          updated_at?: string | null
        }
        Update: {
          closure_reason?: string | null
          created_at?: string | null
          custom_capacity?: number | null
          date?: string
          id?: string
          is_closed?: boolean | null
          session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_calendar_overrides_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sections: {
        Row: {
          assigned_classes: string[] | null
          created_at: string | null
          description: string
          display_order: number | null
          id: string
          is_active: boolean | null
          section_key: string
          subtitle: string | null
          tag_badge: string | null
          title: string
          ui_style: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_classes?: string[] | null
          created_at?: string | null
          description: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          section_key: string
          subtitle?: string | null
          tag_badge?: string | null
          title: string
          ui_style?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_classes?: string[] | null
          created_at?: string | null
          description?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          section_key?: string
          subtitle?: string | null
          tag_badge?: string | null
          title?: string
          ui_style?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      class_sessions: {
        Row: {
          active: boolean | null
          created_at: string | null
          display_name: string
          duration_hours: number | null
          end_time: string
          has_market_tour: boolean | null
          id: string
          max_capacity: number
          meeting_points: Json | null
          price_thb: number
          schedule_config: Json
          start_time: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          display_name: string
          duration_hours?: number | null
          end_time: string
          has_market_tour?: boolean | null
          id: string
          max_capacity: number
          meeting_points?: Json | null
          price_thb: number
          schedule_config: Json
          start_time: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          display_name?: string
          duration_hours?: number | null
          end_time?: string
          has_market_tour?: boolean | null
          id?: string
          max_capacity?: number
          meeting_points?: Json | null
          price_thb?: number
          schedule_config?: Json
          start_time?: string
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          audio_story_url: string | null
          author_id: string | null
          avatar_asset_id: string | null
          breadcrumbs: Json | null
          business_profile_id: string | null
          canonical_url: string | null
          chef_secrets: string[] | null
          cherry_button_ids: string[] | null
          cherry_prompt: string | null
          cherry_response: string | null
          color_theme: string | null
          content_body: string | null
          content_quality_score: number | null
          cover_asset_id: string | null
          created_at: string | null
          description: string | null
          dietary_variants: Json | null
          display_order: number | null
          domain: string
          faq: Json | null
          hreflang: Json | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          json_ld: Json | null
          key_entities: Json | null
          last_content_audit_ai: string | null
          last_seo_audit_at: string | null
          og_description: string | null
          og_title: string | null
          og_type: string | null
          related_queries_geo: Json | null
          semantic_vector: string | null
          seo_audit_logs: Json | null
          seo_description: string | null
          seo_health_score: number | null
          seo_keywords: string[] | null
          seo_priority: number | null
          seo_robots: string | null
          seo_title: string | null
          slug: string | null
          subtitle: string | null
          summary_ai: string | null
          tab_label: string | null
          title: string
          title_highlight: string | null
          twitter_card: string | null
          ui_quote: string | null
          updated_at: string | null
        }
        Insert: {
          audio_story_url?: string | null
          author_id?: string | null
          avatar_asset_id?: string | null
          breadcrumbs?: Json | null
          business_profile_id?: string | null
          canonical_url?: string | null
          chef_secrets?: string[] | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          color_theme?: string | null
          content_body?: string | null
          content_quality_score?: number | null
          cover_asset_id?: string | null
          created_at?: string | null
          description?: string | null
          dietary_variants?: Json | null
          display_order?: number | null
          domain: string
          faq?: Json | null
          hreflang?: Json | null
          icon_name?: string | null
          id: string
          is_active?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          last_seo_audit_at?: string | null
          og_description?: string | null
          og_title?: string | null
          og_type?: string | null
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_audit_logs?: Json | null
          seo_description?: string | null
          seo_health_score?: number | null
          seo_keywords?: string[] | null
          seo_priority?: number | null
          seo_robots?: string | null
          seo_title?: string | null
          slug?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          tab_label?: string | null
          title: string
          title_highlight?: string | null
          twitter_card?: string | null
          ui_quote?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_story_url?: string | null
          author_id?: string | null
          avatar_asset_id?: string | null
          breadcrumbs?: Json | null
          business_profile_id?: string | null
          canonical_url?: string | null
          chef_secrets?: string[] | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          color_theme?: string | null
          content_body?: string | null
          content_quality_score?: number | null
          cover_asset_id?: string | null
          created_at?: string | null
          description?: string | null
          dietary_variants?: Json | null
          display_order?: number | null
          domain?: string
          faq?: Json | null
          hreflang?: Json | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          last_seo_audit_at?: string | null
          og_description?: string | null
          og_title?: string | null
          og_type?: string | null
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_audit_logs?: Json | null
          seo_description?: string | null
          seo_health_score?: number | null
          seo_keywords?: string[] | null
          seo_priority?: number | null
          seo_robots?: string | null
          seo_title?: string | null
          slug?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          tab_label?: string | null
          title?: string
          title_highlight?: string | null
          twitter_card?: string | null
          ui_quote?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_categories_avatar_asset_id_fkey"
            columns: ["avatar_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "content_categories_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      cooking_classes: {
        Row: {
          badge: string | null
          capacity_text: string | null
          cherry_button_ids: string[] | null
          cherry_prompt: string | null
          cherry_response: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          duration_text: string | null
          highlights: string[] | null
          id: string
          image_url: string | null
          inclusions: string[] | null
          is_active: boolean | null
          key_entities: Json | null
          price: number
          schedule_items: Json | null
          semantic_vector: string | null
          summary_ai: string | null
          tagline: string | null
          tags: string[] | null
          theme_color: string | null
          title: string
          unit: string | null
        }
        Insert: {
          badge?: string | null
          capacity_text?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_text?: string | null
          highlights?: string[] | null
          id: string
          image_url?: string | null
          inclusions?: string[] | null
          is_active?: boolean | null
          key_entities?: Json | null
          price: number
          schedule_items?: Json | null
          semantic_vector?: string | null
          summary_ai?: string | null
          tagline?: string | null
          tags?: string[] | null
          theme_color?: string | null
          title: string
          unit?: string | null
        }
        Update: {
          badge?: string | null
          capacity_text?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_text?: string | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          inclusions?: string[] | null
          is_active?: boolean | null
          key_entities?: Json | null
          price?: number
          schedule_items?: Json | null
          semantic_vector?: string | null
          summary_ai?: string | null
          tagline?: string | null
          tags?: string[] | null
          theme_color?: string | null
          title?: string
          unit?: string | null
        }
        Relationships: []
      }
      culture_sections: {
        Row: {
          audio_asset_id: string | null
          author_id: string | null
          breadcrumbs: Json | null
          canonical_url: string | null
          category_id: string | null
          cherry_button_ids: string[] | null
          cherry_prompt: string | null
          cherry_response: string | null
          content: string
          content_quality_score: number | null
          cover_asset_id: string | null
          display_order: number
          faq: Json | null
          featured: boolean | null
          gallery_images: string[] | null
          hreflang: Json | null
          id: string
          is_published: boolean | null
          json_ld: Json | null
          key_entities: Json | null
          last_content_audit_ai: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          primary_focus_keyword: string | null
          published_at: string | null
          quote: string | null
          reading_time_minutes: number | null
          related_articles: string[] | null
          related_queries_geo: Json | null
          semantic_vector: string | null
          seo_audit_logs: Json | null
          seo_description: string | null
          seo_health_score: number | null
          seo_keywords: string[] | null
          seo_robots: string | null
          seo_title: string | null
          slug: string | null
          subtitle: string
          summary_ai: string | null
          title: string
          twitter_card: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          audio_asset_id?: string | null
          author_id?: string | null
          breadcrumbs?: Json | null
          canonical_url?: string | null
          category_id?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          content: string
          content_quality_score?: number | null
          cover_asset_id?: string | null
          display_order: number
          faq?: Json | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hreflang?: Json | null
          id: string
          is_published?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          primary_focus_keyword?: string | null
          published_at?: string | null
          quote?: string | null
          reading_time_minutes?: number | null
          related_articles?: string[] | null
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_audit_logs?: Json | null
          seo_description?: string | null
          seo_health_score?: number | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          slug?: string | null
          subtitle: string
          summary_ai?: string | null
          title: string
          twitter_card?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          audio_asset_id?: string | null
          author_id?: string | null
          breadcrumbs?: Json | null
          canonical_url?: string | null
          category_id?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          content?: string
          content_quality_score?: number | null
          cover_asset_id?: string | null
          display_order?: number
          faq?: Json | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hreflang?: Json | null
          id?: string
          is_published?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          primary_focus_keyword?: string | null
          published_at?: string | null
          quote?: string | null
          reading_time_minutes?: number | null
          related_articles?: string[] | null
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_audit_logs?: Json | null
          seo_description?: string | null
          seo_health_score?: number | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          slug?: string | null
          subtitle?: string
          summary_ai?: string | null
          title?: string
          twitter_card?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "culture_sections_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culture_sections_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culture_sections_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      dietary_profiles: {
        Row: {
          description_long: string | null
          display_order: number | null
          experience: string | null
          icon: string | null
          icon_name: string | null
          id: string
          image_url: string | null
          introduction: string | null
          name: string
          slug: string
          type: string | null
        }
        Insert: {
          description_long?: string | null
          display_order?: number | null
          experience?: string | null
          icon?: string | null
          icon_name?: string | null
          id: string
          image_url?: string | null
          introduction?: string | null
          name: string
          slug: string
          type?: string | null
        }
        Update: {
          description_long?: string | null
          display_order?: number | null
          experience?: string | null
          icon?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          introduction?: string | null
          name?: string
          slug?: string
          type?: string | null
        }
        Relationships: []
      }
      dietary_substitutions: {
        Row: {
          alt_substitute_ingredient_id: string | null
          id: number
          original_ingredient: string | null
          original_ingredient_id: string | null
          profile_id: string | null
          substitute_ingredient: string | null
          substitute_ingredient_id: string | null
        }
        Insert: {
          alt_substitute_ingredient_id?: string | null
          id?: number
          original_ingredient?: string | null
          original_ingredient_id?: string | null
          profile_id?: string | null
          substitute_ingredient?: string | null
          substitute_ingredient_id?: string | null
        }
        Update: {
          alt_substitute_ingredient_id?: string | null
          id?: number
          original_ingredient?: string | null
          original_ingredient_id?: string | null
          profile_id?: string | null
          substitute_ingredient?: string | null
          substitute_ingredient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dietary_substitutions_alt_substitute_ingredient_id_fkey"
            columns: ["alt_substitute_ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dietary_substitutions_original_ingredient_id_fkey"
            columns: ["original_ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dietary_substitutions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "dietary_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dietary_substitutions_substitute_ingredient_id_fkey"
            columns: ["substitute_ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_library"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_payments: {
        Row: {
          created_at: string | null
          driver_id: string
          id: string
          paid_at: string | null
          payout_amount: number
          run_date: string
          session_id: string
          source: string
          status: string | null
          total_pax: number
          total_stops: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: string
          paid_at?: string | null
          payout_amount: number
          run_date: string
          session_id: string
          source?: string
          status?: string | null
          total_pax: number
          total_stops: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: string
          paid_at?: string | null
          payout_amount?: number
          run_date?: string
          session_id?: string
          source?: string
          status?: string | null
          total_pax?: number
          total_stops?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_driver"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_payout_tiers: {
        Row: {
          created_at: string | null
          id: string
          max_stops: number
          min_stops: number
          price_thb: number
          session_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_stops: number
          min_stops: number
          price_thb: number
          session_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          max_stops?: number
          min_stops?: number
          price_thb?: number
          session_type?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          asset_id: string
          created_at: string | null
          display_order: number | null
          gallery_id: string
          id: string
          quote: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          display_order?: number | null
          gallery_id: string
          id?: string
          quote?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          display_order?: number | null
          gallery_id?: string
          id?: string
          quote?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_gallery_media"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      home_cards: {
        Row: {
          card_type: string | null
          display_order: number | null
          icon_name: string | null
          id: number
          image_asset_id: string | null
          image_url: string
          is_active: boolean | null
          role: string | null
          target_path: string | null
          variant: string | null
        }
        Insert: {
          card_type?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: number
          image_asset_id?: string | null
          image_url: string
          is_active?: boolean | null
          role?: string | null
          target_path?: string | null
          variant?: string | null
        }
        Update: {
          card_type?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: number
          image_asset_id?: string | null
          image_url?: string
          is_active?: boolean | null
          role?: string | null
          target_path?: string | null
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_home_cards_image_asset"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      home_cards_front: {
        Row: {
          card_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          extra_1: string | null
          extra_2: string | null
          id: string
          image_asset_id: string | null
          is_active: boolean | null
          link_label: string | null
          suffix_extra_1: string | null
          suffix_extra_2: string | null
          target_path: string
          title: string
          updated_at: string | null
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          extra_1?: string | null
          extra_2?: string | null
          id?: string
          image_asset_id?: string | null
          is_active?: boolean | null
          link_label?: string | null
          suffix_extra_1?: string | null
          suffix_extra_2?: string | null
          target_path: string
          title: string
          updated_at?: string | null
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          extra_1?: string | null
          extra_2?: string | null
          id?: string
          image_asset_id?: string | null
          is_active?: boolean | null
          link_label?: string | null
          suffix_extra_1?: string | null
          suffix_extra_2?: string | null
          target_path?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_cards_front_image_asset_id_fkey"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      home_cards_translations: {
        Row: {
          card_id: number
          created_at: string | null
          description: string
          id: string
          language: string
          link_label: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          card_id: number
          created_at?: string | null
          description: string
          id?: string
          language: string
          link_label?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          card_id?: number
          created_at?: string | null
          description?: string
          id?: string
          language?: string
          link_label?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_cards_translations_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "home_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_locations: {
        Row: {
          address: string | null
          created_at: string | null
          google_place_id: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          map_link: string | null
          name: string
          phone_number: string | null
          rejection_reason: string | null
          review_status: string | null
          source: string | null
          submitted_by: string | null
          website: string | null
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          google_place_id?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          map_link?: string | null
          name: string
          phone_number?: string | null
          rejection_reason?: string | null
          review_status?: string | null
          source?: string | null
          submitted_by?: string | null
          website?: string | null
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          google_place_id?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          map_link?: string | null
          name?: string
          phone_number?: string | null
          rejection_reason?: string | null
          review_status?: string | null
          source?: string | null
          submitted_by?: string | null
          website?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_locations_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "pickup_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_pickup_rules: {
        Row: {
          alt_latitude: number
          alt_longitude: number
          alt_map_link: string | null
          alt_meeting_point: string
          created_at: string | null
          day_of_week: number | null
          end_time: string
          guest_message: string | null
          hotel_id: string
          id: string
          is_active: boolean | null
          start_time: string
        }
        Insert: {
          alt_latitude: number
          alt_longitude: number
          alt_map_link?: string | null
          alt_meeting_point: string
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          guest_message?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean | null
          start_time?: string
        }
        Update: {
          alt_latitude?: number
          alt_longitude?: number
          alt_map_link?: string | null
          alt_meeting_point?: string
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          guest_message?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_pickup_rules_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients_library: {
        Row: {
          breadcrumbs: Json | null
          canonical_url: string | null
          category: string | null
          category_id: string | null
          cherry_button_ids: string[] | null
          cherry_prompt: string | null
          cherry_response: string | null
          content_quality_score: number | null
          created_at: string | null
          default_unit: string | null
          description: string | null
          id: string
          image_asset_id: string | null
          image_url: string | null
          is_logistics_item: boolean | null
          is_teacher_item: boolean | null
          is_visible_public: boolean | null
          json_ld: Json | null
          key_entities: Json | null
          last_content_audit_ai: string | null
          logistics_shop: string | null
          name_en: string
          name_th: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          phonetic: string | null
          purchase_group: string | null
          related_queries_geo: Json | null
          semantic_vector: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_robots: string | null
          seo_title: string | null
          slug: string | null
          storage_area: string | null
          summary_ai: string | null
          teacher_shop: string | null
          twitter_card: string | null
          updated_at: string | null
        }
        Insert: {
          breadcrumbs?: Json | null
          canonical_url?: string | null
          category?: string | null
          category_id?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          content_quality_score?: number | null
          created_at?: string | null
          default_unit?: string | null
          description?: string | null
          id?: string
          image_asset_id?: string | null
          image_url?: string | null
          is_logistics_item?: boolean | null
          is_teacher_item?: boolean | null
          is_visible_public?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          logistics_shop?: string | null
          name_en: string
          name_th?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          phonetic?: string | null
          purchase_group?: string | null
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          slug?: string | null
          storage_area?: string | null
          summary_ai?: string | null
          teacher_shop?: string | null
          twitter_card?: string | null
          updated_at?: string | null
        }
        Update: {
          breadcrumbs?: Json | null
          canonical_url?: string | null
          category?: string | null
          category_id?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          content_quality_score?: number | null
          created_at?: string | null
          default_unit?: string | null
          description?: string | null
          id?: string
          image_asset_id?: string | null
          image_url?: string | null
          is_logistics_item?: boolean | null
          is_teacher_item?: boolean | null
          is_visible_public?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          logistics_shop?: string | null
          name_en?: string
          name_th?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          phonetic?: string | null
          purchase_group?: string | null
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          slug?: string | null
          storage_area?: string | null
          summary_ai?: string | null
          teacher_shop?: string | null
          twitter_card?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_library_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_library_image_asset_id_fkey"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      market_runs: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          items_snapshot: Json | null
          notes: string | null
          run_date: string
          shopper_role: string
          status: string | null
          total_cost: number | null
          updated_at: string | null
          zoho_expense_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          items_snapshot?: Json | null
          notes?: string | null
          run_date?: string
          shopper_role: string
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
          zoho_expense_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          items_snapshot?: Json | null
          notes?: string | null
          run_date?: string
          shopper_role?: string
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
          zoho_expense_id?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          ai_tool: string | null
          alt_text: string | null
          asset_id: string | null
          caption: string | null
          content_location: string | null
          copyright: string | null
          crawl_priority: number | null
          created_at: string | null
          credit: string | null
          date_taken: string | null
          file_name: string
          folder_path: string | null
          height: number | null
          id: string
          image_url: string
          in_content: boolean | null
          is_ai_generated: boolean | null
          key_entities: Json | null
          license: string | null
          mime_type: string | null
          semantic_vector: string | null
          size_kb: number | null
          summary_ai: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          ai_tool?: string | null
          alt_text?: string | null
          asset_id?: string | null
          caption?: string | null
          content_location?: string | null
          copyright?: string | null
          crawl_priority?: number | null
          created_at?: string | null
          credit?: string | null
          date_taken?: string | null
          file_name: string
          folder_path?: string | null
          height?: number | null
          id?: string
          image_url: string
          in_content?: boolean | null
          is_ai_generated?: boolean | null
          key_entities?: Json | null
          license?: string | null
          mime_type?: string | null
          semantic_vector?: string | null
          size_kb?: number | null
          summary_ai?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          ai_tool?: string | null
          alt_text?: string | null
          asset_id?: string | null
          caption?: string | null
          content_location?: string | null
          copyright?: string | null
          crawl_priority?: number | null
          created_at?: string | null
          credit?: string | null
          date_taken?: string | null
          file_name?: string
          folder_path?: string | null
          height?: number | null
          id?: string
          image_url?: string
          in_content?: boolean | null
          is_ai_generated?: boolean | null
          key_entities?: Json | null
          license?: string | null
          mime_type?: string | null
          semantic_vector?: string | null
          size_kb?: number | null
          summary_ai?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: []
      }
      media_usage: {
        Row: {
          asset_id: string
          page_url: string
          role: string
          source: string | null
        }
        Insert: {
          asset_id: string
          page_url: string
          role?: string
          source?: string | null
        }
        Update: {
          asset_id?: string
          page_url?: string
          role?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_usage_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      meeting_points: {
        Row: {
          active: boolean | null
          description: string | null
          evening_pickup_end: string | null
          evening_pickup_time: string | null
          google_maps_link: string | null
          icon_url: string | null
          id: string
          image_url: string | null
          is_dropoff_point: boolean
          latitude: number | null
          longitude: number | null
          morning_pickup_end: string | null
          morning_pickup_time: string | null
          name: string
          point_type: string
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          evening_pickup_end?: string | null
          evening_pickup_time?: string | null
          google_maps_link?: string | null
          icon_url?: string | null
          id: string
          image_url?: string | null
          is_dropoff_point?: boolean
          latitude?: number | null
          longitude?: number | null
          morning_pickup_end?: string | null
          morning_pickup_time?: string | null
          name: string
          point_type?: string
        }
        Update: {
          active?: boolean | null
          description?: string | null
          evening_pickup_end?: string | null
          evening_pickup_time?: string | null
          google_maps_link?: string | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          is_dropoff_point?: boolean
          latitude?: number | null
          longitude?: number | null
          morning_pickup_end?: string | null
          morning_pickup_time?: string | null
          name?: string
          point_type?: string
        }
        Relationships: []
      }
      menu_selections: {
        Row: {
          booking_id: string | null
          curry_id: string | null
          id: string
          selected_allergies: string[] | null
          selected_profile: string | null
          soup_id: string | null
          spiciness_id: number | null
          stirfry_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          curry_id?: string | null
          id?: string
          selected_allergies?: string[] | null
          selected_profile?: string | null
          soup_id?: string | null
          spiciness_id?: number | null
          stirfry_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          curry_id?: string | null
          id?: string
          selected_allergies?: string[] | null
          selected_profile?: string | null
          soup_id?: string | null
          spiciness_id?: number | null
          stirfry_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_curry"
            columns: ["curry_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_menu_soup"
            columns: ["soup_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_menu_spiciness"
            columns: ["spiciness_id"]
            isOneToOne: false
            referencedRelation: "spiciness_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_menu_stirfry"
            columns: ["stirfry_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_selections_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["internal_id"]
          },
          {
            foreignKeyName: "menu_selections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          audio_asset_id: string | null
          button_link_url: string | null
          button_text: string | null
          created_at: string | null
          description: string | null
          highlight: string | null
          image_asset_id: string | null
          key_entities: Json | null
          open_in_new_tab: boolean | null
          page_slug: string | null
          section_id: string
          semantic_vector: string | null
          subtitle: string | null
          summary_ai: string | null
          tag_badge: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audio_asset_id?: string | null
          button_link_url?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          highlight?: string | null
          image_asset_id?: string | null
          key_entities?: Json | null
          open_in_new_tab?: boolean | null
          page_slug?: string | null
          section_id: string
          semantic_vector?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          tag_badge?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          audio_asset_id?: string | null
          button_link_url?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          highlight?: string | null
          image_asset_id?: string | null
          key_entities?: Json | null
          open_in_new_tab?: boolean | null
          page_slug?: string | null
          section_id?: string
          semantic_vector?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          tag_badge?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_page_sections_image_asset"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      pickup_zones: {
        Row: {
          color_code: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          evening_pickup_end: string | null
          evening_pickup_time: string | null
          id: string
          morning_pickup_end: string | null
          morning_pickup_time: string | null
          name: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          evening_pickup_end?: string | null
          evening_pickup_time?: string | null
          id: string
          morning_pickup_end?: string | null
          morning_pickup_time?: string | null
          name: string
        }
        Update: {
          color_code?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          evening_pickup_end?: string | null
          evening_pickup_time?: string | null
          id?: string
          morning_pickup_end?: string | null
          morning_pickup_time?: string | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          agency_address: string | null
          agency_city: string | null
          agency_company_name: string | null
          agency_country: string | null
          agency_phone: string | null
          agency_postal_code: string | null
          agency_province: string | null
          agency_tax_id: string | null
          allergies: Json | null
          avatar_url: string | null
          commission_config: Json | null
          dietary_profile: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          line_id: string | null
          managed_by: string | null
          nationality: string | null
          preferred_spiciness_id: number | null
          profile_kind: string
          quiz_points: number | null
          quiz_progress: Json | null
          quiz_show_explanations: boolean | null
          role: string | null
          updated_at: string | null
          whatsapp: boolean | null
          zoho_contact_id: string | null
        }
        Insert: {
          age?: number | null
          agency_address?: string | null
          agency_city?: string | null
          agency_company_name?: string | null
          agency_country?: string | null
          agency_phone?: string | null
          agency_postal_code?: string | null
          agency_province?: string | null
          agency_tax_id?: string | null
          allergies?: Json | null
          avatar_url?: string | null
          commission_config?: Json | null
          dietary_profile?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_active?: boolean | null
          line_id?: string | null
          managed_by?: string | null
          nationality?: string | null
          preferred_spiciness_id?: number | null
          profile_kind?: string
          quiz_points?: number | null
          quiz_progress?: Json | null
          quiz_show_explanations?: boolean | null
          role?: string | null
          updated_at?: string | null
          whatsapp?: boolean | null
          zoho_contact_id?: string | null
        }
        Update: {
          age?: number | null
          agency_address?: string | null
          agency_city?: string | null
          agency_company_name?: string | null
          agency_country?: string | null
          agency_phone?: string | null
          agency_postal_code?: string | null
          agency_province?: string | null
          agency_tax_id?: string | null
          allergies?: Json | null
          avatar_url?: string | null
          commission_config?: Json | null
          dietary_profile?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          line_id?: string | null
          managed_by?: string | null
          nationality?: string | null
          preferred_spiciness_id?: number | null
          profile_kind?: string
          quiz_points?: number | null
          quiz_progress?: Json | null
          quiz_show_explanations?: boolean | null
          role?: string | null
          updated_at?: string | null
          whatsapp?: boolean | null
          zoho_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_managed_by_fkey"
            columns: ["managed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_preferred_spiciness_id_fkey"
            columns: ["preferred_spiciness_id"]
            isOneToOne: false
            referencedRelation: "spiciness_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_levels: {
        Row: {
          category_id: string | null
          completion_bonus: number
          created_at: string | null
          display_order: number | null
          id: number
          image_asset_id: string | null
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          subtitle: string | null
          title: string
        }
        Insert: {
          category_id?: string | null
          completion_bonus?: number
          created_at?: string | null
          display_order?: number | null
          id?: number
          image_asset_id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          subtitle?: string | null
          title: string
        }
        Update: {
          category_id?: string | null
          completion_bonus?: number
          created_at?: string | null
          display_order?: number | null
          id?: number
          image_asset_id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          subtitle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quiz_levels_image_asset"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "quiz_levels_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_modules: {
        Row: {
          display_order: number | null
          icon: string | null
          id: string
          image_asset_id: string | null
          image_url: string | null
          level_id: number | null
          source_slug: string | null
          source_table: string | null
          theme: string | null
          title: string
        }
        Insert: {
          display_order?: number | null
          icon?: string | null
          id?: string
          image_asset_id?: string | null
          image_url?: string | null
          level_id?: number | null
          source_slug?: string | null
          source_table?: string | null
          theme?: string | null
          title: string
        }
        Update: {
          display_order?: number | null
          icon?: string | null
          id?: string
          image_asset_id?: string | null
          image_url?: string | null
          level_id?: number | null
          source_slug?: string | null
          source_table?: string | null
          theme?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quiz_modules_image_asset"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "quiz_modules_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "quiz_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: Json | null
          correct_index: number
          display_order: number | null
          explanation: string | null
          explanation_wrong: string | null
          hint_blocks: Json | null
          hint_prompt: string | null
          hint_response: string | null
          id: string
          image_asset_id: string | null
          module_id: string | null
          options: Json
          points: number | null
          question_type: string
          text: string
        }
        Insert: {
          correct_answer?: Json | null
          correct_index: number
          display_order?: number | null
          explanation?: string | null
          explanation_wrong?: string | null
          hint_blocks?: Json | null
          hint_prompt?: string | null
          hint_response?: string | null
          id?: string
          image_asset_id?: string | null
          module_id?: string | null
          options: Json
          points?: number | null
          question_type?: string
          text: string
        }
        Update: {
          correct_answer?: Json | null
          correct_index?: number
          display_order?: number | null
          explanation?: string | null
          explanation_wrong?: string | null
          hint_blocks?: Json | null
          hint_prompt?: string | null
          hint_response?: string | null
          id?: string
          image_asset_id?: string | null
          module_id?: string | null
          options?: Json
          points?: number | null
          question_type?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_quiz_questions_image_asset"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "quiz_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "quiz_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_rewards: {
        Row: {
          audio_url: string | null
          description: string | null
          icon_name: string
          id: number
          image_url: string | null
          is_active: boolean | null
          label: string
          required_points: number | null
        }
        Insert: {
          audio_url?: string | null
          description?: string | null
          icon_name: string
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          label: string
          required_points?: number | null
        }
        Update: {
          audio_url?: string | null
          description?: string | null
          icon_name?: string
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          label?: string
          required_points?: number | null
        }
        Relationships: []
      }
      recipe_composition: {
        Row: {
          display_order: number | null
          id: string
          ingredient_id: string
          prep_note: string | null
          quantity: number | null
          recipe_id: string
          unit: string | null
        }
        Insert: {
          display_order?: number | null
          id?: string
          ingredient_id: string
          prep_note?: string | null
          quantity?: number | null
          recipe_id: string
          unit?: string | null
        }
        Update: {
          display_order?: number | null
          id?: string
          ingredient_id?: string
          prep_note?: string | null
          quantity?: number | null
          recipe_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_composition_ingredient"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_composition_recipe"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_key_ingredients: {
        Row: {
          dietary_adaptations: Json | null
          display_order: number | null
          id: number
          ingredient: string
          ingredient_id: string | null
          recipe_id: string | null
          ui_role: string | null
        }
        Insert: {
          dietary_adaptations?: Json | null
          display_order?: number | null
          id?: number
          ingredient: string
          ingredient_id?: string | null
          recipe_id?: string | null
          ui_role?: string | null
        }
        Update: {
          dietary_adaptations?: Json | null
          display_order?: number | null
          id?: number
          ingredient?: string
          ingredient_id?: string | null
          recipe_id?: string | null
          ui_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_key_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_key_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_selection_categories: {
        Row: {
          id: string
          max_selections: number | null
          name: string
        }
        Insert: {
          id: string
          max_selections?: number | null
          name: string
        }
        Update: {
          id?: string
          max_selections?: number | null
          name?: string
        }
        Relationships: []
      }
      recipe_selections: {
        Row: {
          display_order: number | null
          id: number
          recipe_id: string | null
          selection_category_id: string | null
        }
        Insert: {
          display_order?: number | null
          id?: number
          recipe_id?: string | null
          selection_category_id?: string | null
        }
        Update: {
          display_order?: number | null
          id?: number
          recipe_id?: string | null
          selection_category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_selections_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_selections_selection_category_id_fkey"
            columns: ["selection_category_id"]
            isOneToOne: false
            referencedRelation: "recipe_selection_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          allergen_adaptations: Json | null
          audio_asset_id: string | null
          author_id: string | null
          author_note: string | null
          breadcrumbs: Json | null
          canonical_url: string | null
          category: string | null
          cherry_button_ids: string[] | null
          cherry_prompt: string | null
          cherry_response: string | null
          content_quality_score: number | null
          cook_time_min: number | null
          cooks_tip: string | null
          cover_asset_id: string | null
          created_at: string | null
          culture_asset_ids: string[] | null
          culture_link_label: string | null
          culture_link_url: string | null
          description: string
          dietary_variants: Json | null
          difficulty: string | null
          directions: Json | null
          essentials: Json | null
          excerpt: string | null
          faq: Json | null
          gallery_asset_ids: string[] | null
          garnish: string | null
          has_eggs: boolean | null
          has_fish: boolean | null
          has_fish_sauce: boolean | null
          has_gluten: boolean | null
          has_peanuts: boolean | null
          has_seafood: boolean | null
          has_sesame: boolean | null
          has_shellfish: boolean | null
          has_soy: boolean | null
          has_soy_sauce: boolean | null
          has_tree_nuts: boolean | null
          health_benefits: string | null
          id: string
          is_fixed_dish: boolean | null
          is_published: boolean | null
          is_signature: boolean | null
          is_sub_recipe: boolean | null
          json_ld: Json | null
          key_entities: Json | null
          last_content_audit_ai: string | null
          linked_sub_recipes: Json | null
          name: string
          notes: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          prep_time_min: number | null
          published_at: string | null
          recipe_type: string
          related_queries_geo: Json | null
          semantic_vector: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_robots: string | null
          seo_title: string | null
          servings: string | null
          slug: string | null
          spice_level_id: number | null
          subtitle: string | null
          summary_ai: string | null
          thai_name: string | null
          total_time_min: number | null
          twitter_card: string | null
          updated_at: string | null
        }
        Insert: {
          allergen_adaptations?: Json | null
          audio_asset_id?: string | null
          author_id?: string | null
          author_note?: string | null
          breadcrumbs?: Json | null
          canonical_url?: string | null
          category?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          content_quality_score?: number | null
          cook_time_min?: number | null
          cooks_tip?: string | null
          cover_asset_id?: string | null
          created_at?: string | null
          culture_asset_ids?: string[] | null
          culture_link_label?: string | null
          culture_link_url?: string | null
          description: string
          dietary_variants?: Json | null
          difficulty?: string | null
          directions?: Json | null
          essentials?: Json | null
          excerpt?: string | null
          faq?: Json | null
          gallery_asset_ids?: string[] | null
          garnish?: string | null
          has_eggs?: boolean | null
          has_fish?: boolean | null
          has_fish_sauce?: boolean | null
          has_gluten?: boolean | null
          has_peanuts?: boolean | null
          has_seafood?: boolean | null
          has_sesame?: boolean | null
          has_shellfish?: boolean | null
          has_soy?: boolean | null
          has_soy_sauce?: boolean | null
          has_tree_nuts?: boolean | null
          health_benefits?: string | null
          id: string
          is_fixed_dish?: boolean | null
          is_published?: boolean | null
          is_signature?: boolean | null
          is_sub_recipe?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          linked_sub_recipes?: Json | null
          name: string
          notes?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          prep_time_min?: number | null
          published_at?: string | null
          recipe_type?: string
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          servings?: string | null
          slug?: string | null
          spice_level_id?: number | null
          subtitle?: string | null
          summary_ai?: string | null
          thai_name?: string | null
          total_time_min?: number | null
          twitter_card?: string | null
          updated_at?: string | null
        }
        Update: {
          allergen_adaptations?: Json | null
          audio_asset_id?: string | null
          author_id?: string | null
          author_note?: string | null
          breadcrumbs?: Json | null
          canonical_url?: string | null
          category?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          content_quality_score?: number | null
          cook_time_min?: number | null
          cooks_tip?: string | null
          cover_asset_id?: string | null
          created_at?: string | null
          culture_asset_ids?: string[] | null
          culture_link_label?: string | null
          culture_link_url?: string | null
          description?: string
          dietary_variants?: Json | null
          difficulty?: string | null
          directions?: Json | null
          essentials?: Json | null
          excerpt?: string | null
          faq?: Json | null
          gallery_asset_ids?: string[] | null
          garnish?: string | null
          has_eggs?: boolean | null
          has_fish?: boolean | null
          has_fish_sauce?: boolean | null
          has_gluten?: boolean | null
          has_peanuts?: boolean | null
          has_seafood?: boolean | null
          has_sesame?: boolean | null
          has_shellfish?: boolean | null
          has_soy?: boolean | null
          has_soy_sauce?: boolean | null
          has_tree_nuts?: boolean | null
          health_benefits?: string | null
          id?: string
          is_fixed_dish?: boolean | null
          is_published?: boolean | null
          is_signature?: boolean | null
          is_sub_recipe?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          linked_sub_recipes?: Json | null
          name?: string
          notes?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          prep_time_min?: number | null
          published_at?: string | null
          recipe_type?: string
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          servings?: string | null
          slug?: string | null
          spice_level_id?: number | null
          subtitle?: string | null
          summary_ai?: string | null
          thai_name?: string | null
          total_time_min?: number | null
          twitter_card?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "recipes_spice_level_id_fkey"
            columns: ["spice_level_id"]
            isOneToOne: false
            referencedRelation: "spiciness_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_akha: {
        Row: {
          account_category: string | null
          catalog_image_url: string | null
          category_id: string | null
          cost_thb: number | null
          created_at: string | null
          description_internal: string | null
          id: string
          is_active: boolean | null
          is_visible_online: boolean | null
          item_name: string
          price_thb: number
          product_type: string | null
          purchase_account: string | null
          reorder_point: number | null
          sku: string
          stock_quantity: number | null
          sub_category: string | null
          tax_code: string | null
          updated_at: string | null
          zoho_item_id: string | null
        }
        Insert: {
          account_category?: string | null
          catalog_image_url?: string | null
          category_id?: string | null
          cost_thb?: number | null
          created_at?: string | null
          description_internal?: string | null
          id?: string
          is_active?: boolean | null
          is_visible_online?: boolean | null
          item_name: string
          price_thb?: number
          product_type?: string | null
          purchase_account?: string | null
          reorder_point?: number | null
          sku: string
          stock_quantity?: number | null
          sub_category?: string | null
          tax_code?: string | null
          updated_at?: string | null
          zoho_item_id?: string | null
        }
        Update: {
          account_category?: string | null
          catalog_image_url?: string | null
          category_id?: string | null
          cost_thb?: number | null
          created_at?: string | null
          description_internal?: string | null
          id?: string
          is_active?: boolean | null
          is_visible_online?: boolean | null
          item_name?: string
          price_thb?: number
          product_type?: string | null
          purchase_account?: string | null
          reorder_point?: number | null
          sku?: string
          stock_quantity?: number | null
          sub_category?: string | null
          tax_code?: string | null
          updated_at?: string | null
          zoho_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_shop_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "shop_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_categories: {
        Row: {
          description: string | null
          display_order: number | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          description?: string | null
          display_order?: number | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      shop_contacts: {
        Row: {
          contact_name: string | null
          line_id: string | null
          notes: string | null
          phone_number: string | null
          shop_name: string
        }
        Insert: {
          contact_name?: string | null
          line_id?: string | null
          notes?: string | null
          phone_number?: string | null
          shop_name: string
        }
        Update: {
          contact_name?: string | null
          line_id?: string | null
          notes?: string | null
          phone_number?: string | null
          shop_name?: string
        }
        Relationships: []
      }
      shop_orders: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          quantity: number
          sku: string | null
          staff_note: string | null
          status: string | null
          total_price: number | null
          unit_price_snapshot: number
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          quantity?: number
          sku?: string | null
          staff_note?: string | null
          status?: string | null
          total_price?: number | null
          unit_price_snapshot: number
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          quantity?: number
          sku?: string | null
          staff_note?: string | null
          status?: string | null
          total_price?: number | null
          unit_price_snapshot?: number
        }
        Relationships: [
          {
            foreignKeyName: "shop_orders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["internal_id"]
          },
          {
            foreignKeyName: "shop_orders_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "shop_akha"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "shop_orders_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "shop_public"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "shop_orders_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "view_shop_products"
            referencedColumns: ["sku"]
          },
        ]
      }
      shop_storefront: {
        Row: {
          badge_label: string | null
          color_theme: string | null
          created_at: string | null
          cultural_story: string | null
          display_name: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          linked_sku: string
        }
        Insert: {
          badge_label?: string | null
          color_theme?: string | null
          created_at?: string | null
          cultural_story?: string | null
          display_name: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          linked_sku: string
        }
        Update: {
          badge_label?: string | null
          color_theme?: string | null
          created_at?: string | null
          cultural_story?: string | null
          display_name?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          linked_sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_storefront_linked_sku_fkey"
            columns: ["linked_sku"]
            isOneToOne: false
            referencedRelation: "shop_akha"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "shop_storefront_linked_sku_fkey"
            columns: ["linked_sku"]
            isOneToOne: false
            referencedRelation: "shop_public"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "shop_storefront_linked_sku_fkey"
            columns: ["linked_sku"]
            isOneToOne: false
            referencedRelation: "view_shop_products"
            referencedColumns: ["sku"]
          },
        ]
      }
      site_metadata: {
        Row: {
          access_level: string | null
          author_id: string | null
          breadcrumbs: Json | null
          business_profile_id: string | null
          canonical_url: string | null
          cherry_button_ids: string[] | null
          cherry_prompt: string | null
          cherry_response: string | null
          content_quality_score: number | null
          cover_asset_id: string | null
          created_at: string
          date_modified: string | null
          faq: Json | null
          header_badge: string | null
          header_icon: string | null
          header_title_highlight: string | null
          header_title_main: string
          hreflang: Json | null
          id: string
          json_ld: Json | null
          key_entities: Json | null
          last_content_audit_ai: string | null
          last_seo_audit_at: string | null
          menu_label: string | null
          menu_location: string | null
          menu_order: number | null
          meta_robots_archive: boolean | null
          meta_robots_follow: boolean | null
          meta_robots_snippet: boolean | null
          og_description: string | null
          og_title: string | null
          og_type: string | null
          page_description: string | null
          page_essentials: Json | null
          page_slug: string
          parent_id: string | null
          related_queries_geo: Json | null
          semantic_vector: string | null
          seo_audit_logs: Json | null
          seo_description: string | null
          seo_health_score: number | null
          seo_keywords: string[] | null
          seo_robots: string | null
          seo_title: string | null
          show_in_menu: boolean | null
          sibling_slugs: string[] | null
          summary_ai: string | null
          summary_id: string | null
          twitter_card: string | null
        }
        Insert: {
          access_level?: string | null
          author_id?: string | null
          breadcrumbs?: Json | null
          business_profile_id?: string | null
          canonical_url?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          content_quality_score?: number | null
          cover_asset_id?: string | null
          created_at?: string
          date_modified?: string | null
          faq?: Json | null
          header_badge?: string | null
          header_icon?: string | null
          header_title_highlight?: string | null
          header_title_main: string
          hreflang?: Json | null
          id?: string
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          last_seo_audit_at?: string | null
          menu_label?: string | null
          menu_location?: string | null
          menu_order?: number | null
          meta_robots_archive?: boolean | null
          meta_robots_follow?: boolean | null
          meta_robots_snippet?: boolean | null
          og_description?: string | null
          og_title?: string | null
          og_type?: string | null
          page_description?: string | null
          page_essentials?: Json | null
          page_slug: string
          parent_id?: string | null
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_audit_logs?: Json | null
          seo_description?: string | null
          seo_health_score?: number | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          show_in_menu?: boolean | null
          sibling_slugs?: string[] | null
          summary_ai?: string | null
          summary_id?: string | null
          twitter_card?: string | null
        }
        Update: {
          access_level?: string | null
          author_id?: string | null
          breadcrumbs?: Json | null
          business_profile_id?: string | null
          canonical_url?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          content_quality_score?: number | null
          cover_asset_id?: string | null
          created_at?: string
          date_modified?: string | null
          faq?: Json | null
          header_badge?: string | null
          header_icon?: string | null
          header_title_highlight?: string | null
          header_title_main?: string
          hreflang?: Json | null
          id?: string
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          last_seo_audit_at?: string | null
          menu_label?: string | null
          menu_location?: string | null
          menu_order?: number | null
          meta_robots_archive?: boolean | null
          meta_robots_follow?: boolean | null
          meta_robots_snippet?: boolean | null
          og_description?: string | null
          og_title?: string | null
          og_type?: string | null
          page_description?: string | null
          page_essentials?: Json | null
          page_slug?: string
          parent_id?: string | null
          related_queries_geo?: Json | null
          semantic_vector?: string | null
          seo_audit_logs?: Json | null
          seo_description?: string | null
          seo_health_score?: number | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          show_in_menu?: boolean | null
          sibling_slugs?: string[] | null
          summary_ai?: string | null
          summary_id?: string | null
          twitter_card?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_metadata_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_metadata_business_profile_id_fkey"
            columns: ["business_profile_id"]
            isOneToOne: false
            referencedRelation: "business_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_metadata_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "site_metadata_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      site_metadata_admin: {
        Row: {
          access_level: string | null
          cache_ttl: number | null
          canonical_url: string | null
          created_at: string
          header_badge: string | null
          header_icon: string | null
          hero_image_url: string | null
          id: string
          is_active: boolean | null
          last_seo_audit_at: string | null
          menu_order: number | null
          og_image: string | null
          og_type: string | null
          page_slug: string
          parent_id: string | null
          seo_audit_logs: Json | null
          seo_health_score: number | null
          seo_robots: string | null
          show_in_menu: boolean | null
          template: string | null
          twitter_card: string | null
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          cache_ttl?: number | null
          canonical_url?: string | null
          created_at?: string
          header_badge?: string | null
          header_icon?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          last_seo_audit_at?: string | null
          menu_order?: number | null
          og_image?: string | null
          og_type?: string | null
          page_slug: string
          parent_id?: string | null
          seo_audit_logs?: Json | null
          seo_health_score?: number | null
          seo_robots?: string | null
          show_in_menu?: boolean | null
          template?: string | null
          twitter_card?: string | null
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          cache_ttl?: number | null
          canonical_url?: string | null
          created_at?: string
          header_badge?: string | null
          header_icon?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          last_seo_audit_at?: string | null
          menu_order?: number | null
          og_image?: string | null
          og_type?: string | null
          page_slug?: string
          parent_id?: string | null
          seo_audit_logs?: Json | null
          seo_health_score?: number | null
          seo_robots?: string | null
          show_in_menu?: boolean | null
          template?: string | null
          twitter_card?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_metadata_admin_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "site_metadata_admin"
            referencedColumns: ["id"]
          },
        ]
      }
      site_metadata_admin_translations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          language: string
          menu_label: string | null
          page_id: string
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          language: string
          menu_label?: string | null
          page_id: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          language?: string
          menu_label?: string | null
          page_id?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_metadata_admin_translations_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_metadata_admin"
            referencedColumns: ["id"]
          },
        ]
      }
      spiciness_levels: {
        Row: {
          akha_connection: string | null
          chef_note: string | null
          color_code: string | null
          created_at: string | null
          description: string
          icon: string
          id: number
          label: string | null
          philosophy_quote: string | null
          photo_asset_id: string | null
          photo_description: string | null
          subtitle: string | null
          title: string
        }
        Insert: {
          akha_connection?: string | null
          chef_note?: string | null
          color_code?: string | null
          created_at?: string | null
          description: string
          icon: string
          id: number
          label?: string | null
          philosophy_quote?: string | null
          photo_asset_id?: string | null
          photo_description?: string | null
          subtitle?: string | null
          title: string
        }
        Update: {
          akha_connection?: string | null
          chef_note?: string | null
          color_code?: string | null
          created_at?: string | null
          description?: string
          icon?: string
          id?: number
          label?: string | null
          philosophy_quote?: string | null
          photo_asset_id?: string | null
          photo_description?: string | null
          subtitle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "spiciness_levels_photo_asset_id_fkey"
            columns: ["photo_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
    }
    Views: {
      shop_public: {
        Row: {
          catalog_image_url: string | null
          category_id: string | null
          item_name: string | null
          price_thb: number | null
          product_type: string | null
          sku: string | null
          sub_category: string | null
        }
        Insert: {
          catalog_image_url?: string | null
          category_id?: string | null
          item_name?: string | null
          price_thb?: number | null
          product_type?: string | null
          sku?: string | null
          sub_category?: string | null
        }
        Update: {
          catalog_image_url?: string | null
          category_id?: string | null
          item_name?: string | null
          price_thb?: number | null
          product_type?: string | null
          sku?: string | null
          sub_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_shop_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "shop_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      view_shop_products: {
        Row: {
          accounting_name: string | null
          catalog_image_url: string | null
          category_id: string | null
          display_description: string | null
          display_name: string | null
          is_purchasable: boolean | null
          price_thb: number | null
          sku: string | null
          stock_quantity: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_shop_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "shop_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_managed_participant: {
        Args: { p_booking_id: string; p_profile_id: string }
        Returns: Json
      }
      approve_hotel_location: {
        Args: { target_hotel_id: string }
        Returns: undefined
      }
      calculate_agency_commission: {
        Args: {
          p_agency_id: string
          p_exclude_booking_id?: string
          p_pax: number
        }
        Returns: Json
      }
      calculate_driver_payout: {
        Args: { p_driver_id: string; p_run_date: string; p_session_id: string }
        Returns: {
          payout_amount: number
        }[]
      }
      can_manage_logistics: { Args: never; Returns: boolean }
      check_chat_rate_limit: {
        Args: { p_session_token: string; p_user_id: string }
        Returns: {
          allowed: boolean
          reason: string
          remaining: number
        }[]
      }
      cleanup_old_chat_messages: { Args: never; Returns: undefined }
      generate_weekly_payouts: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: undefined
      }
      get_calendar_availability: {
        Args: { end_date: string; start_date: string }
        Returns: {
          booking_date: string
          session_id: string
          total_occupied: number
        }[]
      }
      get_low_quality_content: {
        Args: { min_score?: number }
        Returns: {
          c_id: string
          score: number
          t_name: string
        }[]
      }
      get_my_role: { Args: never; Returns: string }
      inject_driver_payout_manual: {
        Args: {
          p_driver_id?: string
          p_run_date: string
          p_session_id: string
          p_total_pax: number
          p_total_stops: number
        }
        Returns: {
          payout_amount: number
          status: string
          total_stops: number
        }[]
      }
      delete_my_payout: {
        Args: { p_run_date: string; p_session_id: string }
        Returns: undefined
      }
      mark_driver_week_paid: {
        Args: { p_driver_id: string; p_week_monday: string }
        Returns: number
      }
      insert_recipe_with_ingredients: {
        Args: {
          p_category: string
          p_color_theme: string
          p_description: string
          p_has_gluten: boolean
          p_has_peanuts: boolean
          p_has_shellfish: boolean
          p_has_soy: boolean
          p_health_benefits: string
          p_image: string
          p_is_fixed_dish?: boolean
          p_is_signature?: boolean
          p_is_vegan: boolean
          p_is_vegetarian: boolean
          p_key_ingredients?: string[]
          p_name: string
          p_recipe_id: string
          p_spiciness: number
          p_thai_name?: string
        }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      join_booking_by_ref: {
        Args: { p_booking_ref: string; p_user_id: string }
        Returns: Json
      }
      manages_profile: { Args: { p_id: string }; Returns: boolean }
      match_semantic: {
        Args: {
          match_count?: number
          match_table: string
          query_embedding: string
        }
        Returns: {
          id: string
          similarity: number
        }[]
      }
      reject_hotel_location: {
        Args: { reason: string; target_hotel_id: string }
        Returns: undefined
      }
      split_booking_pax: {
        Args: {
          admin_user_id: string
          new_hotel_name: string
          new_pickup_time: string
          original_booking_id: string
          pax_to_move: number
        }
        Returns: Json
      }
      standardize_allergy_value: { Args: { allergy: string }; Returns: string }
      sync_asset_storage_metadata: {
        Args: { p_asset_id?: string; p_table?: string }
        Returns: {
          asset_id: string
          mime_type: string
          size_kb: number
          tbl: string
        }[]
      }
      validate_and_standardize_allergies: {
        Args: { user_allergies: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
