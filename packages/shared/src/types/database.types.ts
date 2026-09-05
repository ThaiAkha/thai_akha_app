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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      agency_invoices: {
        Row: {
          agency_id: string
          amount: number
          booking_ids: Json
          confirmed_by: string | null
          created_at: string
          declared_at: string | null
          id: string
          paid_at: string | null
          payment_proof_url: string | null
          status: string
          updated_at: string
          zoho_invoice_id: string | null
          zoho_invoice_number: string | null
        }
        Insert: {
          agency_id: string
          amount?: number
          booking_ids?: Json
          confirmed_by?: string | null
          created_at?: string
          declared_at?: string | null
          id?: string
          paid_at?: string | null
          payment_proof_url?: string | null
          status?: string
          updated_at?: string
          zoho_invoice_id?: string | null
          zoho_invoice_number?: string | null
        }
        Update: {
          agency_id?: string
          amount?: number
          booking_ids?: Json
          confirmed_by?: string | null
          created_at?: string
          declared_at?: string | null
          id?: string
          paid_at?: string | null
          payment_proof_url?: string | null
          status?: string
          updated_at?: string
          zoho_invoice_id?: string | null
          zoho_invoice_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_invoices_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_invoices_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          hreflang: Json | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          json_ld: Json | null
          key_entities: Json | null
          last_content_audit_ai: string | null
          news_id: string | null
          og_description: string | null
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
          hreflang?: Json | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          news_id?: string | null
          og_description?: string | null
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
          hreflang?: Json | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          last_content_audit_ai?: string | null
          news_id?: string | null
          og_description?: string | null
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
      akha_news_translations: {
        Row: {
          content: string | null
          created_at: string | null
          excerpt: string | null
          human_reviewed: boolean
          id: string
          key_entities: Json | null
          lang: string
          news_id: string
          og_description: string | null
          og_title: string | null
          related_queries_geo: Json | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string | null
          source_hash: string | null
          subtitle: string | null
          summary_ai: string | null
          title: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang: string
          news_id: string
          og_description?: string | null
          og_title?: string | null
          related_queries_geo?: Json | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          source_hash?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang?: string
          news_id?: string
          og_description?: string | null
          og_title?: string | null
          related_queries_geo?: Json | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          source_hash?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "akha_news_translations_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "akha_news"
            referencedColumns: ["id"]
          },
        ]
      }
      app_manuals: {
        Row: {
          body: string
          created_at: string
          icon: string | null
          id: string
          images: Json
          is_active: boolean
          lang: string
          role: string | null
          section_order: number
          slug: string
          source_manual: string | null
          source_path: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body?: string
          created_at?: string
          icon?: string | null
          id?: string
          images?: Json
          is_active?: boolean
          lang?: string
          role?: string | null
          section_order?: number
          slug: string
          source_manual?: string | null
          source_path?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          icon?: string | null
          id?: string
          images?: Json
          is_active?: boolean
          lang?: string
          role?: string | null
          section_order?: number
          slug?: string
          source_manual?: string | null
          source_path?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
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
          app_role: string | null
          avatar_asset_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          expertise_tags: string[] | null
          id: string
          is_active: boolean | null
          is_ai_agent: boolean | null
          is_organization: boolean | null
          json_ld: Json
          metadata: Json | null
          name: string
          profile_id: string | null
          salary_thb: number | null
          same_as: string[] | null
          slug: string
          staff_group: string | null
          terminated_at: string | null
          title: string | null
        }
        Insert: {
          app_role?: string | null
          avatar_asset_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          expertise_tags?: string[] | null
          id?: string
          is_active?: boolean | null
          is_ai_agent?: boolean | null
          is_organization?: boolean | null
          json_ld?: Json
          metadata?: Json | null
          name: string
          profile_id?: string | null
          salary_thb?: number | null
          same_as?: string[] | null
          slug: string
          staff_group?: string | null
          terminated_at?: string | null
          title?: string | null
        }
        Update: {
          app_role?: string | null
          avatar_asset_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          expertise_tags?: string[] | null
          id?: string
          is_active?: boolean | null
          is_ai_agent?: boolean | null
          is_organization?: boolean | null
          json_ld?: Json
          metadata?: Json | null
          name?: string
          profile_id?: string | null
          salary_thb?: number | null
          same_as?: string[] | null
          slug?: string
          staff_group?: string | null
          terminated_at?: string | null
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
          {
            foreignKeyName: "authors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
          kitchen_id: string | null
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
          pos_saved_at: string | null
          pos_tender: string | null
          reminder_sent_at: string | null
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
          kitchen_id?: string | null
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
          pos_saved_at?: string | null
          pos_tender?: string | null
          reminder_sent_at?: string | null
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
          kitchen_id?: string | null
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
          pos_saved_at?: string | null
          pos_tender?: string | null
          reminder_sent_at?: string | null
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
            foreignKeyName: "bookings_kitchen_id_fkey"
            columns: ["kitchen_id"]
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
          contact_channels: Json
          created_at: string
          email: string | null
          founding_date: string | null
          google_place_id: string | null
          has_map: string | null
          id: string
          latitude: number | null
          legal_name: string | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          postal_code: string | null
          price_range: string | null
          same_as: Json | null
          service_radius: number | null
          service_type: string[] | null
          street_address: string | null
          tax_id: string | null
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
          contact_channels?: Json
          created_at?: string
          email?: string | null
          founding_date?: string | null
          google_place_id?: string | null
          has_map?: string | null
          id?: string
          latitude?: number | null
          legal_name?: string | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          postal_code?: string | null
          price_range?: string | null
          same_as?: Json | null
          service_radius?: number | null
          service_type?: string[] | null
          street_address?: string | null
          tax_id?: string | null
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
          contact_channels?: Json
          created_at?: string
          email?: string | null
          founding_date?: string | null
          google_place_id?: string | null
          has_map?: string | null
          id?: string
          latitude?: number | null
          legal_name?: string | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          postal_code?: string | null
          price_range?: string | null
          same_as?: Json | null
          service_radius?: number | null
          service_type?: string[] | null
          street_address?: string | null
          tax_id?: string | null
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
      class_sections_translations: {
        Row: {
          created_at: string | null
          description: string | null
          human_reviewed: boolean
          id: string
          lang: string
          section_id: string
          source_hash: string | null
          subtitle: string | null
          tag_badge: string | null
          title: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          human_reviewed?: boolean
          id?: string
          lang: string
          section_id: string
          source_hash?: string | null
          subtitle?: string | null
          tag_badge?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          human_reviewed?: boolean
          id?: string
          lang?: string
          section_id?: string
          source_hash?: string | null
          subtitle?: string | null
          tag_badge?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_sections_translations_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "class_sections"
            referencedColumns: ["id"]
          },
        ]
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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled_at: string | null
          id: string
          message: string
          name: string
          source: string
          status: string
          topic: string
        }
        Insert: {
          created_at?: string
          email: string
          handled_at?: string | null
          id?: string
          message: string
          name: string
          source?: string
          status?: string
          topic?: string
        }
        Update: {
          created_at?: string
          email?: string
          handled_at?: string | null
          id?: string
          message?: string
          name?: string
          source?: string
          status?: string
          topic?: string
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
      content_categories_translations: {
        Row: {
          category_id: string
          content_body: string | null
          created_at: string | null
          description: string | null
          human_reviewed: boolean
          id: string
          key_entities: Json | null
          lang: string
          og_description: string | null
          og_title: string | null
          related_queries_geo: Json | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string | null
          source_hash: string | null
          subtitle: string | null
          summary_ai: string | null
          tab_label: string | null
          title: string | null
          title_highlight: string | null
          translated_at: string | null
          ui_quote: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          category_id: string
          content_body?: string | null
          created_at?: string | null
          description?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang: string
          og_description?: string | null
          og_title?: string | null
          related_queries_geo?: Json | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          source_hash?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          tab_label?: string | null
          title?: string | null
          title_highlight?: string | null
          translated_at?: string | null
          ui_quote?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          category_id?: string
          content_body?: string | null
          created_at?: string | null
          description?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang?: string
          og_description?: string | null
          og_title?: string | null
          related_queries_geo?: Json | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          source_hash?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          tab_label?: string | null
          title?: string | null
          title_highlight?: string | null
          translated_at?: string | null
          ui_quote?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_categories_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
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
          cover_asset_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          duration_text: string | null
          highlights: string[] | null
          id: string
          inclusions: string[] | null
          is_active: boolean | null
          key_entities: Json | null
          schedule_items: Json | null
          semantic_vector: string | null
          summary_ai: string | null
          tagline: string | null
          tags: string[] | null
          theme_color: string | null
          title: string
          unit: string | null
          youtube_video_id: string | null
        }
        Insert: {
          badge?: string | null
          capacity_text?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          cover_asset_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_text?: string | null
          highlights?: string[] | null
          id: string
          inclusions?: string[] | null
          is_active?: boolean | null
          key_entities?: Json | null
          schedule_items?: Json | null
          semantic_vector?: string | null
          summary_ai?: string | null
          tagline?: string | null
          tags?: string[] | null
          theme_color?: string | null
          title: string
          unit?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          badge?: string | null
          capacity_text?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          cover_asset_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_text?: string | null
          highlights?: string[] | null
          id?: string
          inclusions?: string[] | null
          is_active?: boolean | null
          key_entities?: Json | null
          schedule_items?: Json | null
          semantic_vector?: string | null
          summary_ai?: string | null
          tagline?: string | null
          tags?: string[] | null
          theme_color?: string | null
          title?: string
          unit?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cooking_classes_cover"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      cooking_classes_translations: {
        Row: {
          badge: string | null
          capacity_text: string | null
          class_id: string
          created_at: string | null
          description: string | null
          duration_text: string | null
          highlights: Json | null
          human_reviewed: boolean
          id: string
          inclusions: Json | null
          key_entities: Json | null
          lang: string
          schedule_items: Json | null
          source_hash: string | null
          summary_ai: string | null
          tagline: string | null
          title: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          badge?: string | null
          capacity_text?: string | null
          class_id: string
          created_at?: string | null
          description?: string | null
          duration_text?: string | null
          highlights?: Json | null
          human_reviewed?: boolean
          id?: string
          inclusions?: Json | null
          key_entities?: Json | null
          lang: string
          schedule_items?: Json | null
          source_hash?: string | null
          summary_ai?: string | null
          tagline?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          badge?: string | null
          capacity_text?: string | null
          class_id?: string
          created_at?: string | null
          description?: string | null
          duration_text?: string | null
          highlights?: Json | null
          human_reviewed?: boolean
          id?: string
          inclusions?: Json | null
          key_entities?: Json | null
          lang?: string
          schedule_items?: Json | null
          source_hash?: string | null
          summary_ai?: string | null
          tagline?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cooking_classes_translations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "cooking_classes"
            referencedColumns: ["id"]
          },
        ]
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
          featured: boolean | null
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
          featured?: boolean | null
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
          featured?: boolean | null
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
      culture_sections_translations: {
        Row: {
          content: string | null
          created_at: string | null
          human_reviewed: boolean
          id: string
          key_entities: Json | null
          lang: string
          og_description: string | null
          og_title: string | null
          quote: string | null
          related_queries_geo: Json | null
          section_id: string
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string | null
          source_hash: string | null
          subtitle: string | null
          summary_ai: string | null
          title: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang: string
          og_description?: string | null
          og_title?: string | null
          quote?: string | null
          related_queries_geo?: Json | null
          section_id: string
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          source_hash?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang?: string
          og_description?: string | null
          og_title?: string | null
          quote?: string | null
          related_queries_geo?: Json | null
          section_id?: string
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          source_hash?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "culture_sections_translations_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "culture_sections"
            referencedColumns: ["id"]
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
          image_asset_id: string | null
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
          image_asset_id?: string | null
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
          image_asset_id?: string | null
          introduction?: string | null
          name?: string
          slug?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_dietary_profiles_image"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      dietary_profiles_translations: {
        Row: {
          created_at: string | null
          description_long: string | null
          experience: string | null
          human_reviewed: boolean
          id: string
          introduction: string | null
          lang: string
          name: string | null
          profile_id: string
          source_hash: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          description_long?: string | null
          experience?: string | null
          human_reviewed?: boolean
          id?: string
          introduction?: string | null
          lang: string
          name?: string | null
          profile_id: string
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          description_long?: string | null
          experience?: string | null
          human_reviewed?: boolean
          id?: string
          introduction?: string | null
          lang?: string
          name?: string | null
          profile_id?: string
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dietary_profiles_translations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "dietary_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          zoho_expense_id: string | null
          zoho_synced_at: string | null
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
          zoho_expense_id?: string | null
          zoho_synced_at?: string | null
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
          zoho_expense_id?: string | null
          zoho_synced_at?: string | null
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
      faq_categories: {
        Row: {
          audience: string[]
          avatar_asset_id: string | null
          category_key: string
          created_at: string
          display_order: number
          id: string
          image_asset_id: string | null
          is_active: boolean
          parent_id: string | null
          section_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string[]
          avatar_asset_id?: string | null
          category_key: string
          created_at?: string
          display_order?: number
          id?: string
          image_asset_id?: string | null
          is_active?: boolean
          parent_id?: string | null
          section_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string[]
          avatar_asset_id?: string | null
          category_key?: string
          created_at?: string
          display_order?: number
          id?: string
          image_asset_id?: string | null
          is_active?: boolean
          parent_id?: string | null
          section_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_categories_avatar_asset_fk"
            columns: ["avatar_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "faq_categories_image_asset_fk"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "faq_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_categories_translations: {
        Row: {
          category_id: string
          created_at: string
          id: string
          lang: string
          source_hash: string | null
          title: string | null
          translated_at: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          lang: string
          source_hash?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          lang?: string
          source_hash?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_categories_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_questions: {
        Row: {
          answer: string
          audience: string[]
          avatar_asset_id: string | null
          category_id: string | null
          created_at: string
          cta: Json | null
          display_order: number
          entity_slug: string | null
          entity_type: string | null
          faq_key: string | null
          faq_style: string
          id: string
          is_active: boolean
          question: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          answer: string
          audience?: string[]
          avatar_asset_id?: string | null
          category_id?: string | null
          created_at?: string
          cta?: Json | null
          display_order?: number
          entity_slug?: string | null
          entity_type?: string | null
          faq_key?: string | null
          faq_style?: string
          id?: string
          is_active?: boolean
          question: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          answer?: string
          audience?: string[]
          avatar_asset_id?: string | null
          category_id?: string | null
          created_at?: string
          cta?: Json | null
          display_order?: number
          entity_slug?: string | null
          entity_type?: string | null
          faq_key?: string | null
          faq_style?: string
          id?: string
          is_active?: boolean
          question?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_questions_avatar_asset_fk"
            columns: ["avatar_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "faq_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_questions_translations: {
        Row: {
          answer: string | null
          created_at: string
          cta: Json | null
          id: string
          lang: string
          question: string | null
          question_id: string
          source_hash: string | null
          translated_at: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          cta?: Json | null
          id?: string
          lang: string
          question?: string | null
          question_id: string
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          cta?: Json | null
          id?: string
          lang?: string
          question?: string | null
          question_id?: string
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_questions_translations_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "faq_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_tags: {
        Row: {
          axis: string
          created_at: string
          is_active: boolean
          label: string
          tag: string
        }
        Insert: {
          axis: string
          created_at?: string
          is_active?: boolean
          label: string
          tag: string
        }
        Update: {
          axis?: string
          created_at?: string
          is_active?: boolean
          label?: string
          tag?: string
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
      gallery_items_translations: {
        Row: {
          created_at: string | null
          human_reviewed: boolean
          id: string
          item_id: string
          lang: string
          quote: string | null
          source_hash: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          human_reviewed?: boolean
          id?: string
          item_id: string
          lang: string
          quote?: string | null
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          human_reviewed?: boolean
          id?: string
          item_id?: string
          lang?: string
          quote?: string | null
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_translations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "gallery_items"
            referencedColumns: ["id"]
          },
        ]
      }
      herb_teas: {
        Row: {
          botanical_name: string | null
          code: string | null
          cover_asset_id: string | null
          created_at: string | null
          display_order: number | null
          emoji: string | null
          id: string
          is_published: boolean | null
          json_ld: Json | null
          og_type: string | null
          slug: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          botanical_name?: string | null
          code?: string | null
          cover_asset_id?: string | null
          created_at?: string | null
          display_order?: number | null
          emoji?: string | null
          id?: string
          is_published?: boolean | null
          json_ld?: Json | null
          og_type?: string | null
          slug: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          botanical_name?: string | null
          code?: string | null
          cover_asset_id?: string | null
          created_at?: string | null
          display_order?: number | null
          emoji?: string | null
          id?: string
          is_published?: boolean | null
          json_ld?: Json | null
          og_type?: string | null
          slug?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      herb_teas_translations: {
        Row: {
          author_note: string | null
          benefits: Json | null
          brews: Json | null
          canonical_url: string | null
          conclusion: string | null
          created_at: string | null
          general_benefit_description: string | null
          general_description: string | null
          herb_tea_id: string
          id: string
          ingredient_sheet: Json | null
          lang: string
          name: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          source_hash: string | null
          subtitle: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          author_note?: string | null
          benefits?: Json | null
          brews?: Json | null
          canonical_url?: string | null
          conclusion?: string | null
          created_at?: string | null
          general_benefit_description?: string | null
          general_description?: string | null
          herb_tea_id: string
          id?: string
          ingredient_sheet?: Json | null
          lang: string
          name?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          source_hash?: string | null
          subtitle?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          author_note?: string | null
          benefits?: Json | null
          brews?: Json | null
          canonical_url?: string | null
          conclusion?: string | null
          created_at?: string | null
          general_benefit_description?: string | null
          general_description?: string | null
          herb_tea_id?: string
          id?: string
          ingredient_sheet?: Json | null
          lang?: string
          name?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          source_hash?: string | null
          subtitle?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "herb_teas_translations_herb_tea_id_fkey"
            columns: ["herb_tea_id"]
            isOneToOne: false
            referencedRelation: "herb_teas"
            referencedColumns: ["id"]
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
          card_type: string
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
          card_type?: string
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
          card_type?: string
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
      home_cards_front_translations: {
        Row: {
          card_id: string
          created_at: string | null
          description: string | null
          extra_1: string | null
          extra_2: string | null
          human_reviewed: boolean
          id: string
          lang: string
          link_label: string | null
          source_hash: string | null
          suffix_extra_1: string | null
          suffix_extra_2: string | null
          title: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          card_id: string
          created_at?: string | null
          description?: string | null
          extra_1?: string | null
          extra_2?: string | null
          human_reviewed?: boolean
          id?: string
          lang: string
          link_label?: string | null
          source_hash?: string | null
          suffix_extra_1?: string | null
          suffix_extra_2?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          card_id?: string
          created_at?: string | null
          description?: string | null
          extra_1?: string | null
          extra_2?: string | null
          human_reviewed?: boolean
          id?: string
          lang?: string
          link_label?: string | null
          source_hash?: string | null
          suffix_extra_1?: string | null
          suffix_extra_2?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_cards_front_translations_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "home_cards_front"
            referencedColumns: ["id"]
          },
        ]
      }
      home_cards_translations: {
        Row: {
          card_id: number
          created_at: string | null
          description: string
          id: string
          lang: string
          language: string | null
          link_label: string | null
          source_hash: string | null
          title: string
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          card_id: number
          created_at?: string | null
          description: string
          id?: string
          lang: string
          language?: string | null
          link_label?: string | null
          source_hash?: string | null
          title: string
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          card_id?: number
          created_at?: string | null
          description?: string
          id?: string
          lang?: string
          language?: string | null
          link_label?: string | null
          source_hash?: string | null
          title?: string
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
      info_page_sections: {
        Row: {
          anchor: string | null
          body: Json | null
          created_at: string
          heading: string | null
          id: string
          is_active: boolean
          page_slug: string | null
          section_order: number
          updated_at: string
        }
        Insert: {
          anchor?: string | null
          body?: Json | null
          created_at?: string
          heading?: string | null
          id?: string
          is_active?: boolean
          page_slug?: string | null
          section_order: number
          updated_at?: string
        }
        Update: {
          anchor?: string | null
          body?: Json | null
          created_at?: string
          heading?: string | null
          id?: string
          is_active?: boolean
          page_slug?: string | null
          section_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      info_page_sections_translations: {
        Row: {
          body: Json | null
          created_at: string
          heading: string | null
          id: string
          lang: string
          section_id: string
          source_hash: string | null
          translated_at: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          body?: Json | null
          created_at?: string
          heading?: string | null
          id?: string
          lang: string
          section_id: string
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          body?: Json | null
          created_at?: string
          heading?: string | null
          id?: string
          lang?: string
          section_id?: string
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "info_page_sections_translations_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "info_page_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients_library: {
        Row: {
          author_id: string | null
          breadcrumbs: Json | null
          canonical_url: string | null
          category_id: string | null
          cherry_button_ids: string[] | null
          cherry_prompt: string | null
          cherry_response: string | null
          conclusion: string | null
          content_quality_score: number | null
          created_at: string | null
          culinary_uses: string | null
          default_unit: string | null
          description: string | null
          health_benefits: string | null
          hreflang: Json | null
          id: string
          image_asset_id: string | null
          is_logistics_item: boolean | null
          is_published: boolean
          is_teacher_item: boolean | null
          is_visible_public: boolean | null
          json_ld: Json | null
          key_entities: Json | null
          kitchen_usage: string | null
          last_content_audit_ai: string | null
          logistics_shop: string | null
          name: string
          name_th: string | null
          og_description: string | null
          og_title: string | null
          og_type: string | null
          phonetic: string | null
          primary_focus_keyword: string | null
          published_at: string | null
          purchase_group: string | null
          purchase_pack_label: string
          purchase_pack_size: number
          reading_time_minutes: number | null
          related_ingredients: string[] | null
          related_queries_geo: Json | null
          season_months: number[] | null
          season_note: string | null
          season_source: string | null
          season_status: string | null
          season_verified_at: string | null
          semantic_vector: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_robots: string | null
          seo_title: string | null
          slug: string | null
          storage_area: string | null
          summary_ai: string | null
          teacher_shop: string | null
          the_essential: Json | null
          twitter_card: string | null
          updated_at: string | null
          usage_note: Json | null
        }
        Insert: {
          author_id?: string | null
          breadcrumbs?: Json | null
          canonical_url?: string | null
          category_id?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          conclusion?: string | null
          content_quality_score?: number | null
          created_at?: string | null
          culinary_uses?: string | null
          default_unit?: string | null
          description?: string | null
          health_benefits?: string | null
          hreflang?: Json | null
          id?: string
          image_asset_id?: string | null
          is_logistics_item?: boolean | null
          is_published?: boolean
          is_teacher_item?: boolean | null
          is_visible_public?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          kitchen_usage?: string | null
          last_content_audit_ai?: string | null
          logistics_shop?: string | null
          name: string
          name_th?: string | null
          og_description?: string | null
          og_title?: string | null
          og_type?: string | null
          phonetic?: string | null
          primary_focus_keyword?: string | null
          published_at?: string | null
          purchase_group?: string | null
          purchase_pack_label?: string
          purchase_pack_size?: number
          reading_time_minutes?: number | null
          related_ingredients?: string[] | null
          related_queries_geo?: Json | null
          season_months?: number[] | null
          season_note?: string | null
          season_source?: string | null
          season_status?: string | null
          season_verified_at?: string | null
          semantic_vector?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          slug?: string | null
          storage_area?: string | null
          summary_ai?: string | null
          teacher_shop?: string | null
          the_essential?: Json | null
          twitter_card?: string | null
          updated_at?: string | null
          usage_note?: Json | null
        }
        Update: {
          author_id?: string | null
          breadcrumbs?: Json | null
          canonical_url?: string | null
          category_id?: string | null
          cherry_button_ids?: string[] | null
          cherry_prompt?: string | null
          cherry_response?: string | null
          conclusion?: string | null
          content_quality_score?: number | null
          created_at?: string | null
          culinary_uses?: string | null
          default_unit?: string | null
          description?: string | null
          health_benefits?: string | null
          hreflang?: Json | null
          id?: string
          image_asset_id?: string | null
          is_logistics_item?: boolean | null
          is_published?: boolean
          is_teacher_item?: boolean | null
          is_visible_public?: boolean | null
          json_ld?: Json | null
          key_entities?: Json | null
          kitchen_usage?: string | null
          last_content_audit_ai?: string | null
          logistics_shop?: string | null
          name?: string
          name_th?: string | null
          og_description?: string | null
          og_title?: string | null
          og_type?: string | null
          phonetic?: string | null
          primary_focus_keyword?: string | null
          published_at?: string | null
          purchase_group?: string | null
          purchase_pack_label?: string
          purchase_pack_size?: number
          reading_time_minutes?: number | null
          related_ingredients?: string[] | null
          related_queries_geo?: Json | null
          season_months?: number[] | null
          season_note?: string | null
          season_source?: string | null
          season_status?: string | null
          season_verified_at?: string | null
          semantic_vector?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_robots?: string | null
          seo_title?: string | null
          slug?: string | null
          storage_area?: string | null
          summary_ai?: string | null
          teacher_shop?: string | null
          the_essential?: Json | null
          twitter_card?: string | null
          updated_at?: string | null
          usage_note?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_library_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
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
      ingredients_library_translations: {
        Row: {
          conclusion: string | null
          created_at: string | null
          culinary_uses: string | null
          description: string | null
          health_benefits: string | null
          human_reviewed: boolean
          id: string
          ingredient_id: string
          key_entities: Json | null
          kitchen_usage: string | null
          lang: string
          name: string | null
          og_description: string | null
          og_title: string | null
          related_queries_geo: Json | null
          season_note: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string | null
          source_hash: string | null
          summary_ai: string | null
          the_essential: Json | null
          translated_at: string | null
          updated_at: string | null
          usage_note: Json | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          conclusion?: string | null
          created_at?: string | null
          culinary_uses?: string | null
          description?: string | null
          health_benefits?: string | null
          human_reviewed?: boolean
          id?: string
          ingredient_id: string
          key_entities?: Json | null
          kitchen_usage?: string | null
          lang: string
          name?: string | null
          og_description?: string | null
          og_title?: string | null
          related_queries_geo?: Json | null
          season_note?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          source_hash?: string | null
          summary_ai?: string | null
          the_essential?: Json | null
          translated_at?: string | null
          updated_at?: string | null
          usage_note?: Json | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          conclusion?: string | null
          created_at?: string | null
          culinary_uses?: string | null
          description?: string | null
          health_benefits?: string | null
          human_reviewed?: boolean
          id?: string
          ingredient_id?: string
          key_entities?: Json | null
          kitchen_usage?: string | null
          lang?: string
          name?: string | null
          og_description?: string | null
          og_title?: string | null
          related_queries_geo?: Json | null
          season_note?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          source_hash?: string | null
          summary_ai?: string | null
          the_essential?: Json | null
          translated_at?: string | null
          updated_at?: string | null
          usage_note?: Json | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_library_translations_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_library"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          audience: string
          body: Json
          brain_ref: string
          changelog: Json
          created_at: string
          date_modified: string
          date_published: string | null
          doc_key: string
          doc_type: string
          id: string
          is_published: boolean
          legal_version: string
          page_slug: string
          title: string
          updated_at: string
        }
        Insert: {
          audience: string
          body?: Json
          brain_ref: string
          changelog?: Json
          created_at?: string
          date_modified: string
          date_published?: string | null
          doc_key: string
          doc_type: string
          id?: string
          is_published?: boolean
          legal_version: string
          page_slug: string
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          body?: Json
          brain_ref?: string
          changelog?: Json
          created_at?: string
          date_modified?: string
          date_published?: string | null
          doc_key?: string
          doc_type?: string
          id?: string
          is_published?: boolean
          legal_version?: string
          page_slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_documents_translations: {
        Row: {
          body: Json
          created_at: string
          document_id: string
          human_reviewed: boolean
          id: string
          is_published: boolean
          lang: string
          source_hash: string | null
          source_version: string
          title: string | null
          translated_at: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          body?: Json
          created_at?: string
          document_id: string
          human_reviewed?: boolean
          id?: string
          is_published?: boolean
          lang: string
          source_hash?: string | null
          source_version: string
          title?: string | null
          translated_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          body?: Json
          created_at?: string
          document_id?: string
          human_reviewed?: boolean
          id?: string
          is_published?: boolean
          lang?: string
          source_hash?: string | null
          source_version?: string
          title?: string | null
          translated_at?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_translations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      market_runs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          id: string
          items_snapshot: Json | null
          notes: string | null
          run_date: string
          shopper_role: string
          spent_on: string | null
          status: string | null
          total_cost: number | null
          updated_at: string | null
          worker_id: string | null
          zoho_expense_id: string | null
          zoho_synced_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          items_snapshot?: Json | null
          notes?: string | null
          run_date?: string
          shopper_role: string
          spent_on?: string | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
          worker_id?: string | null
          zoho_expense_id?: string | null
          zoho_synced_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          items_snapshot?: Json | null
          notes?: string | null
          run_date?: string
          shopper_role?: string
          spent_on?: string | null
          status?: string | null
          total_cost?: number | null
          updated_at?: string | null
          worker_id?: string | null
          zoho_expense_id?: string | null
          zoho_synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_runs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_runs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
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
          dropoff_description: string | null
          evening_pickup_end: string | null
          evening_pickup_time: string | null
          google_maps_link: string | null
          icon_url: string | null
          id: string
          image_asset_id: string | null
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
          dropoff_description?: string | null
          evening_pickup_end?: string | null
          evening_pickup_time?: string | null
          google_maps_link?: string | null
          icon_url?: string | null
          id: string
          image_asset_id?: string | null
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
          dropoff_description?: string | null
          evening_pickup_end?: string | null
          evening_pickup_time?: string | null
          google_maps_link?: string | null
          icon_url?: string | null
          id?: string
          image_asset_id?: string | null
          image_url?: string | null
          is_dropoff_point?: boolean
          latitude?: number | null
          longitude?: number | null
          morning_pickup_end?: string | null
          morning_pickup_time?: string | null
          name?: string
          point_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_meeting_points_image"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      meeting_points_translations: {
        Row: {
          created_at: string | null
          description: string | null
          dropoff_description: string | null
          human_reviewed: boolean
          id: string
          lang: string
          name: string | null
          point_id: string
          source_hash: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          dropoff_description?: string | null
          human_reviewed?: boolean
          id?: string
          lang: string
          name?: string | null
          point_id: string
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          dropoff_description?: string | null
          human_reviewed?: boolean
          id?: string
          lang?: string
          name?: string | null
          point_id?: string
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_points_translations_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "meeting_points"
            referencedColumns: ["id"]
          },
        ]
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
          bullets: Json | null
          button_link_url: string | null
          button_text: string | null
          cards: Json | null
          cherry_prompt: string | null
          cherry_response: string | null
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
          youtube_video_id: string | null
        }
        Insert: {
          audio_asset_id?: string | null
          bullets?: Json | null
          button_link_url?: string | null
          button_text?: string | null
          cards?: Json | null
          cherry_prompt?: string | null
          cherry_response?: string | null
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
          youtube_video_id?: string | null
        }
        Update: {
          audio_asset_id?: string | null
          bullets?: Json | null
          button_link_url?: string | null
          button_text?: string | null
          cards?: Json | null
          cherry_prompt?: string | null
          cherry_response?: string | null
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
          youtube_video_id?: string | null
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
      page_sections_translations: {
        Row: {
          bullets: Json | null
          button_text: string | null
          cards: Json | null
          created_at: string | null
          description: string | null
          highlight: string | null
          human_reviewed: boolean
          id: string
          key_entities: Json | null
          lang: string
          section_id: string
          source_hash: string | null
          subtitle: string | null
          summary_ai: string | null
          tag_badge: string | null
          title: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          bullets?: Json | null
          button_text?: string | null
          cards?: Json | null
          created_at?: string | null
          description?: string | null
          highlight?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang: string
          section_id: string
          source_hash?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          tag_badge?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          bullets?: Json | null
          button_text?: string | null
          cards?: Json | null
          created_at?: string | null
          description?: string | null
          highlight?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang?: string
          section_id?: string
          source_hash?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          tag_badge?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_translations_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "page_sections"
            referencedColumns: ["section_id"]
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
      pickup_zones_translations: {
        Row: {
          created_at: string | null
          description: string | null
          human_reviewed: boolean
          id: string
          lang: string
          name: string | null
          source_hash: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
          zone_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          human_reviewed?: boolean
          id?: string
          lang: string
          name?: string | null
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          zone_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          human_reviewed?: boolean
          id?: string
          lang?: string
          name?: string | null
          source_hash?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pickup_zones_translations_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "pickup_zones"
            referencedColumns: ["id"]
          },
        ]
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
          auto_invoice: boolean
          avatar_url: string | null
          base_salary: number | null
          commission_config: Json | null
          default_kitchen_id: string | null
          dietary_profile: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          legal_accepted: Json
          line_id: string | null
          managed_by: string | null
          nationality: string | null
          preferred_language: string
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
          auto_invoice?: boolean
          avatar_url?: string | null
          base_salary?: number | null
          commission_config?: Json | null
          default_kitchen_id?: string | null
          dietary_profile?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_active?: boolean | null
          legal_accepted?: Json
          line_id?: string | null
          managed_by?: string | null
          nationality?: string | null
          preferred_language?: string
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
          auto_invoice?: boolean
          avatar_url?: string | null
          base_salary?: number | null
          commission_config?: Json | null
          default_kitchen_id?: string | null
          dietary_profile?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          legal_accepted?: Json
          line_id?: string | null
          managed_by?: string | null
          nationality?: string | null
          preferred_language?: string
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
            foreignKeyName: "profiles_default_kitchen_id_fkey"
            columns: ["default_kitchen_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      quiz_questions_translations: {
        Row: {
          created_at: string | null
          explanation: string | null
          explanation_wrong: string | null
          hint_blocks: Json | null
          hint_response: string | null
          human_reviewed: boolean
          id: string
          lang: string
          options: Json | null
          question_id: string
          source_hash: string | null
          text: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          explanation?: string | null
          explanation_wrong?: string | null
          hint_blocks?: Json | null
          hint_response?: string | null
          human_reviewed?: boolean
          id?: string
          lang: string
          options?: Json | null
          question_id: string
          source_hash?: string | null
          text?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          explanation?: string | null
          explanation_wrong?: string | null
          hint_blocks?: Json | null
          hint_response?: string | null
          human_reviewed?: boolean
          id?: string
          lang?: string
          options?: Json | null
          question_id?: string
          source_hash?: string | null
          text?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_translations_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
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
          image_asset_id: string | null
          is_active: boolean | null
          label: string
          required_points: number | null
        }
        Insert: {
          audio_url?: string | null
          description?: string | null
          icon_name: string
          id?: number
          image_asset_id?: string | null
          is_active?: boolean | null
          label: string
          required_points?: number | null
        }
        Update: {
          audio_url?: string | null
          description?: string | null
          icon_name?: string
          id?: number
          image_asset_id?: string | null
          is_active?: boolean | null
          label?: string
          required_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_quiz_rewards_image"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
        ]
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
          culture_link_label: string | null
          culture_link_url: string | null
          description: string
          dietary_variants: Json | null
          difficulty: string | null
          directions: Json | null
          essentials: Json | null
          excerpt: string | null
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
          culture_link_label?: string | null
          culture_link_url?: string | null
          description: string
          dietary_variants?: Json | null
          difficulty?: string | null
          directions?: Json | null
          essentials?: Json | null
          excerpt?: string | null
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
          culture_link_label?: string | null
          culture_link_url?: string | null
          description?: string
          dietary_variants?: Json | null
          difficulty?: string | null
          directions?: Json | null
          essentials?: Json | null
          excerpt?: string | null
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
      recipes_translations: {
        Row: {
          author_note: string | null
          cooks_tip: string | null
          created_at: string | null
          description: string | null
          dietary_variants: Json | null
          directions: Json | null
          essentials: Json | null
          excerpt: string | null
          garnish: string | null
          health_benefits: string | null
          human_reviewed: boolean
          id: string
          key_entities: Json | null
          lang: string
          name: string | null
          notes: string | null
          og_description: string | null
          og_title: string | null
          recipe_id: string
          related_queries_geo: Json | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          servings: string | null
          slug: string | null
          source_hash: string | null
          subtitle: string | null
          summary_ai: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          author_note?: string | null
          cooks_tip?: string | null
          created_at?: string | null
          description?: string | null
          dietary_variants?: Json | null
          directions?: Json | null
          essentials?: Json | null
          excerpt?: string | null
          garnish?: string | null
          health_benefits?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang: string
          name?: string | null
          notes?: string | null
          og_description?: string | null
          og_title?: string | null
          recipe_id: string
          related_queries_geo?: Json | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          servings?: string | null
          slug?: string | null
          source_hash?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          author_note?: string | null
          cooks_tip?: string | null
          created_at?: string | null
          description?: string | null
          dietary_variants?: Json | null
          directions?: Json | null
          essentials?: Json | null
          excerpt?: string | null
          garnish?: string | null
          health_benefits?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang?: string
          name?: string | null
          notes?: string | null
          og_description?: string | null
          og_title?: string | null
          recipe_id?: string
          related_queries_geo?: Json | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          servings?: string | null
          slug?: string | null
          source_hash?: string | null
          subtitle?: string | null
          summary_ai?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_translations_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
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
      shop_catalog_public: {
        Row: {
          catalog_image_url: string | null
          category_id: string | null
          id: string
          item_name: string
          price_thb: number
          product_type: string | null
          sku: string
          sub_category: string | null
        }
        Insert: {
          catalog_image_url?: string | null
          category_id?: string | null
          id: string
          item_name: string
          price_thb?: number
          product_type?: string | null
          sku: string
          sub_category?: string | null
        }
        Update: {
          catalog_image_url?: string | null
          category_id?: string | null
          id?: string
          item_name?: string
          price_thb?: number
          product_type?: string | null
          sku?: string
          sub_category?: string | null
        }
        Relationships: []
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
          image_asset_id: string | null
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
          image_asset_id?: string | null
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
          image_asset_id?: string | null
          is_active?: boolean | null
          linked_sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_shop_storefront_image"
            columns: ["image_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
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
            referencedRelation: "view_shop_products"
            referencedColumns: ["sku"]
          },
        ]
      }
      shop_storefront_translations: {
        Row: {
          badge_label: string | null
          created_at: string | null
          cultural_story: string | null
          display_name: string | null
          human_reviewed: boolean
          id: string
          lang: string
          source_hash: string | null
          storefront_id: string
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          badge_label?: string | null
          created_at?: string | null
          cultural_story?: string | null
          display_name?: string | null
          human_reviewed?: boolean
          id?: string
          lang: string
          source_hash?: string | null
          storefront_id: string
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          badge_label?: string | null
          created_at?: string | null
          cultural_story?: string | null
          display_name?: string | null
          human_reviewed?: boolean
          id?: string
          lang?: string
          source_hash?: string | null
          storefront_id?: string
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_storefront_translations_storefront_id_fkey"
            columns: ["storefront_id"]
            isOneToOne: false
            referencedRelation: "shop_storefront"
            referencedColumns: ["id"]
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
          date_published: string | null
          faq_refs: Json
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
          legal_version: string | null
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
          date_published?: string | null
          faq_refs?: Json
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
          legal_version?: string | null
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
          date_published?: string | null
          faq_refs?: Json
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
          legal_version?: string | null
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
          cover_asset_id: string | null
          created_at: string
          header_badge: string | null
          header_icon: string | null
          hero_image_url: string | null
          id: string
          is_active: boolean | null
          last_seo_audit_at: string | null
          menu_label: string | null
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
          cover_asset_id?: string | null
          created_at?: string
          header_badge?: string | null
          header_icon?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          last_seo_audit_at?: string | null
          menu_label?: string | null
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
          cover_asset_id?: string | null
          created_at?: string
          header_badge?: string | null
          header_icon?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          last_seo_audit_at?: string | null
          menu_label?: string | null
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
            foreignKeyName: "fk_site_metadata_admin_cover"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["asset_id"]
          },
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
          lang: string
          language: string | null
          menu_label: string | null
          page_id: string
          source_hash: string | null
          subtitle: string | null
          title: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          lang: string
          language?: string | null
          menu_label?: string | null
          page_id: string
          source_hash?: string | null
          subtitle?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          lang?: string
          language?: string | null
          menu_label?: string | null
          page_id?: string
          source_hash?: string | null
          subtitle?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
      site_metadata_translations: {
        Row: {
          created_at: string | null
          header_badge: string | null
          header_title_highlight: string | null
          header_title_main: string | null
          human_reviewed: boolean
          id: string
          key_entities: Json | null
          lang: string
          menu_label: string | null
          og_description: string | null
          og_title: string | null
          page_description: string | null
          page_essentials: Json | null
          page_id: string
          page_slug: string | null
          related_queries_geo: Json | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          source_hash: string | null
          summary_ai: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          header_badge?: string | null
          header_title_highlight?: string | null
          header_title_main?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang: string
          menu_label?: string | null
          og_description?: string | null
          og_title?: string | null
          page_description?: string | null
          page_essentials?: Json | null
          page_id: string
          page_slug?: string | null
          related_queries_geo?: Json | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          source_hash?: string | null
          summary_ai?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          header_badge?: string | null
          header_title_highlight?: string | null
          header_title_main?: string | null
          human_reviewed?: boolean
          id?: string
          key_entities?: Json | null
          lang?: string
          menu_label?: string | null
          og_description?: string | null
          og_title?: string | null
          page_description?: string | null
          page_essentials?: Json | null
          page_id?: string
          page_slug?: string | null
          related_queries_geo?: Json | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          source_hash?: string | null
          summary_ai?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_metadata_translations_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_metadata"
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
      spiciness_levels_translations: {
        Row: {
          akha_connection: string | null
          chef_note: string | null
          created_at: string | null
          description: string | null
          human_reviewed: boolean
          id: string
          label: string | null
          lang: string
          level_id: number
          philosophy_quote: string | null
          source_hash: string | null
          subtitle: string | null
          title: string | null
          translated_at: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          akha_connection?: string | null
          chef_note?: string | null
          created_at?: string | null
          description?: string | null
          human_reviewed?: boolean
          id?: string
          label?: string | null
          lang: string
          level_id: number
          philosophy_quote?: string | null
          source_hash?: string | null
          subtitle?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          akha_connection?: string | null
          chef_note?: string | null
          created_at?: string | null
          description?: string | null
          human_reviewed?: boolean
          id?: string
          label?: string | null
          lang?: string
          level_id?: number
          philosophy_quote?: string | null
          source_hash?: string | null
          subtitle?: string | null
          title?: string | null
          translated_at?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spiciness_levels_translations_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "spiciness_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_details: {
        Row: {
          created_at: string | null
          pay_notes: string | null
          salary_thb: number | null
          updated_at: string | null
          worker_id: string
          zoho_vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          pay_notes?: string | null
          salary_thb?: number | null
          updated_at?: string | null
          worker_id: string
          zoho_vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          pay_notes?: string | null
          salary_thb?: number | null
          updated_at?: string | null
          worker_id?: string
          zoho_vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_details_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: true
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_salaries: {
        Row: {
          base_amount: number
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          net_amount: number | null
          other_deduction: number
          overtime_amount: number
          paid_at: string | null
          pay_method: string
          period: string
          ssf_amount: number
          status: string
          zoho_expense_id: string | null
          zoho_synced_at: string | null
        }
        Insert: {
          base_amount?: number
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          net_amount?: number | null
          other_deduction?: number
          overtime_amount?: number
          paid_at?: string | null
          pay_method?: string
          period: string
          ssf_amount?: number
          status?: string
          zoho_expense_id?: string | null
          zoho_synced_at?: string | null
        }
        Update: {
          base_amount?: number
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          net_amount?: number | null
          other_deduction?: number
          overtime_amount?: number
          paid_at?: string | null
          pay_method?: string
          period?: string
          ssf_amount?: number
          status?: string
          zoho_expense_id?: string | null
          zoho_synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_roles: {
        Row: {
          created_at: string | null
          is_primary: boolean
          role: string
          worker_id: string
        }
        Insert: {
          created_at?: string | null
          is_primary?: boolean
          role: string
          worker_id: string
        }
        Update: {
          created_at?: string | null
          is_primary?: boolean
          role?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_roles_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
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
        Relationships: []
      }
      v_translated_slugs: {
        Row: {
          entity_type: string | null
          lang: string | null
          slug_en: string | null
          slug_translated: string | null
        }
        Relationships: []
      }
      v_translation_pairs: {
        Row: {
          madre: string | null
          madre_key_col: string | null
          sidecar: string | null
          sidecar_fk_col: string | null
        }
        Relationships: []
      }
      v_translation_pairs_info: {
        Row: {
          madre: string | null
          madre_key_col: string | null
          sidecar: string | null
          sidecar_autonomo: boolean | null
          sidecar_fk_col: string | null
          traducibili: string[] | null
        }
        Relationships: []
      }
      v_translation_status: {
        Row: {
          base_rows: number | null
          complete: boolean | null
          in_matrix: boolean | null
          lang: string | null
          pct: number | null
          table_name: string | null
          translated_rows: number | null
        }
        Relationships: []
      }
      v_translations_stale: {
        Row: {
          lang: string | null
          madre: string | null
          madre_key: string | null
          motivo: string | null
          sidecar: string | null
        }
        Relationships: []
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
      admin_delete_payout: {
        Args: { p_driver_id: string; p_run_date: string; p_session_id: string }
        Returns: undefined
      }
      agency_declare_payment: {
        Args: { p_invoice_ids: string[]; p_proof_url?: string }
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
      delete_my_payout: {
        Args: { p_run_date: string; p_session_id: string }
        Returns: undefined
      }
      driver_route: {
        Args: never
        Returns: {
          avatar_url: string
          booking_date: string
          customer_note: string
          dropoff_driver_uid: string
          dropoff_hotel: string
          guest_name: string
          hotel_name: string
          internal_id: string
          pax_count: number
          phone_number: string
          pickup_driver_uid: string
          pickup_time: string
          pickup_zone: string
          requires_dropoff: boolean
          route_order: number
          session_id: string
          status: string
          transport_status: string
          visitor_count: number
        }[]
      }
      driver_update_pickup: {
        Args: { p_internal_id: string; p_status: string }
        Returns: undefined
      }
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
      get_market_expense_report: {
        Args: { p_end: string; p_start: string }
        Returns: {
          period_end: string
          period_label: string
          period_start: string
          run_ids: string[]
          runs: number
          shop: string
          status: string
          stream: string
          total: number
          zoho_expense_id: string
        }[]
      }
      get_market_pending_expenses: {
        Args: never
        Returns: {
          period_label: string
          run_ids: string[]
          runs: number
          stream: string
          total: number
        }[]
      }
      get_my_role: { Args: never; Returns: string }
      get_pos_daily_invoice: {
        Args: { p_day: string }
        Returns: {
          amount: number
          booking_id: string
          line_type: string
          quantity: number
          session: string
          sku: string
          tender: string
        }[]
      }
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
      is_booking_participant: {
        Args: { p_booking_id: string }
        Returns: boolean
      }
      is_staff: { Args: never; Returns: boolean }
      join_booking_by_ref: {
        Args: { p_booking_ref: string; p_user_id: string }
        Returns: Json
      }
      manages_profile: { Args: { p_id: string }; Returns: boolean }
      mark_driver_week_paid: {
        Args: { p_driver_id: string; p_week_monday: string }
        Returns: number
      }
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
      merge_split_child: { Args: { p_child: string }; Returns: Json }
      record_legal_acceptance: {
        Args: { p_doc_key: string; p_lang: string; p_shown_version?: string }
        Returns: Json
      }
      reject_hotel_location: {
        Args: { reason: string; target_hotel_id: string }
        Returns: undefined
      }
      set_agency_auto_invoice: {
        Args: { p_agency_id: string; p_value: boolean }
        Returns: Json
      }
      set_booking_kitchen: {
        Args: { p_internal_id: string; p_kitchen_id: string }
        Returns: undefined
      }
      split_booking_participants: {
        Args: { p_parent: string; p_user_ids: string[] }
        Returns: Json
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
      split_booking_pax_payment: {
        Args: { p_parent: string; p_pax: number }
        Returns: Json
      }
      split_booking_seats: {
        Args: { p_parent: string; p_pax: number; p_user_ids: string[] }
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
      translatable_columns: {
        Args: { p_madre: string; p_sidecar: string }
        Returns: string[]
      }
      translation_hash_sql: {
        Args: { p_madre: string; p_sidecar: string }
        Returns: string
      }
      translation_mark_fresh: {
        Args: { p_keys?: string[]; p_lang?: string; p_sidecar: string }
        Returns: number
      }
      translation_source_columns: {
        Args: { p_madre: string; p_sidecar: string }
        Returns: string[]
      }
      translation_source_hash: {
        Args: { p_key: string; p_madre: string; p_sidecar: string }
        Returns: string
      }
      translations_stale: {
        Args: never
        Returns: {
          lang: string
          madre: string
          madre_key: string
          motivo: string
          sidecar: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
