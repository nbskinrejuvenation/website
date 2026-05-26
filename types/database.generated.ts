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
  public: {
    Tables: {
      navigation: {
        Row: {
          href: string | null
          id: string
          is_visible: boolean | null
          label: string
          parent_id: string | null
          sort_order: number | null
        }
        Insert: {
          href?: string | null
          id?: string
          is_visible?: boolean | null
          label: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Update: {
          href?: string | null
          id?: string
          is_visible?: boolean | null
          label?: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          body_html: string | null
          id: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body_html?: string | null
          id?: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body_html?: string | null
          id?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          booking_url: string | null
          business_name: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          lat: number | null
          lng: number | null
          phone: string | null
          postcode: string | null
          state: string | null
          suburb: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          booking_url?: string | null
          business_name?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          postcode?: string | null
          state?: string | null
          suburb?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          booking_url?: string | null
          business_name?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          postcode?: string | null
          state?: string | null
          suburb?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      specials: {
        Row: {
          description: string | null
          id: string
          image_url: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          image_url?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          image_url?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          body: string
          client_name: string
          id: string
          is_featured: boolean | null
          sort_order: number | null
          status: Database["public"]["Enums"]["content_status"] | null
          treatment_ref: string | null
        }
        Insert: {
          avatar_url?: string | null
          body: string
          client_name: string
          id?: string
          is_featured?: boolean | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          treatment_ref?: string | null
        }
        Update: {
          avatar_url?: string | null
          body?: string
          client_name?: string
          id?: string
          is_featured?: boolean | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          treatment_ref?: string | null
        }
        Relationships: []
      }
      treatments: {
        Row: {
          body_html: string | null
          category: Database["public"]["Enums"]["treatment_category"]
          created_at: string | null
          hero_image: string | null
          id: string
          og_image_url: string | null
          price_from: number | null
          what_to_expect: Json | null
          schema_faq: Json | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          status: Database["public"]["Enums"]["content_status"] | null
          subtitle: string | null
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body_html?: string | null
          category: Database["public"]["Enums"]["treatment_category"]
          created_at?: string | null
          hero_image?: string | null
          id?: string
          og_image_url?: string | null
          price_from?: number | null
          what_to_expect?: Json | null
          schema_faq?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          subtitle?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body_html?: string | null
          category?: Database["public"]["Enums"]["treatment_category"]
          created_at?: string | null
          hero_image?: string | null
          id?: string
          og_image_url?: string | null
          price_from?: number | null
          what_to_expect?: Json | null
          schema_faq?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          subtitle?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      content_status: "draft" | "published"
      treatment_category: "face" | "body"
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
    Enums: {
      content_status: ["draft", "published"],
      treatment_category: ["face", "body"],
    },
  },
} as const
