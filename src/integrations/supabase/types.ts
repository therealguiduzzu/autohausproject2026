export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      leads: {
        Row: {
          consent_given: boolean;
          created_at: string;
          details: Json;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          source_url: string | null;
          status: Database["public"]["Enums"]["lead_status"];
          subject: string;
          type: Database["public"]["Enums"]["lead_type"];
          updated_at: string;
          vehicle_id: string | null;
        };
        Insert: {
          consent_given?: boolean;
          created_at?: string;
          details?: Json;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          source_url?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          subject: string;
          type: Database["public"]["Enums"]["lead_type"];
          updated_at?: string;
          vehicle_id?: string | null;
        };
        Update: {
          consent_given?: boolean;
          created_at?: string;
          details?: Json;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          source_url?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          subject?: string;
          type?: Database["public"]["Enums"]["lead_type"];
          updated_at?: string;
          vehicle_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_subscribers: {
        Row: {
          confirmation_sent_at: string | null;
          confirmation_token: string | null;
          confirmed_at: string | null;
          consent_ip: string | null;
          consent_user_agent: string | null;
          created_at: string;
          email: string;
          id: string;
          source: string | null;
          status: string;
          unsubscribe_token: string;
          unsubscribed_at: string | null;
          updated_at: string;
        };
        Insert: {
          confirmation_sent_at?: string | null;
          confirmation_token?: string | null;
          confirmed_at?: string | null;
          consent_ip?: string | null;
          consent_user_agent?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          source?: string | null;
          status?: string;
          unsubscribe_token?: string;
          unsubscribed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          confirmation_sent_at?: string | null;
          confirmation_token?: string | null;
          confirmed_at?: string | null;
          consent_ip?: string | null;
          consent_user_agent?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          source?: string | null;
          status?: string;
          unsubscribe_token?: string;
          unsubscribed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      email_send_log: {
        Row: {
          created_at: string;
          error_message: string | null;
          id: string;
          message_id: string | null;
          metadata: Json | null;
          recipient_email: string | null;
          status: string;
          template_name: string | null;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          message_id?: string | null;
          metadata?: Json | null;
          recipient_email?: string | null;
          status: string;
          template_name?: string | null;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          message_id?: string | null;
          metadata?: Json | null;
          recipient_email?: string | null;
          status?: string;
          template_name?: string | null;
        };
        Relationships: [];
      };
      newsletter_campaigns: {
        Row: {
          id: string;
          template_id: string;
          subject: string;
          recipient_count: number;
          queued_count: number;
          sent_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          subject: string;
          recipient_count?: number;
          queued_count?: number;
          sent_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          subject?: string;
          recipient_count?: number;
          queued_count?: number;
          sent_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          author: string;
          rating: number;
          text: string;
          source: string;
          source_url: string | null;
          review_date: string | null;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          author: string;
          rating: number;
          text: string;
          source?: string;
          source_url?: string | null;
          review_date?: string | null;
          published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          author?: string;
          rating?: number;
          text?: string;
          source?: string;
          source_url?: string | null;
          review_date?: string | null;
          published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      workshop_appointments: {
        Row: {
          id: string;
          slot_date: string;
          slot_time: string;
          service: string;
          cancel_token: string;
          category: string;
          vehicle: string;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string | null;
          status: string;
          source: string;
          consent_given: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slot_date: string;
          slot_time: string;
          service: string;
          cancel_token?: string;
          category?: string;
          vehicle?: string;
          customer_name: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          status?: string;
          source?: string;
          consent_given?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slot_date?: string;
          slot_time?: string;
          service?: string;
          cancel_token?: string;
          category?: string;
          vehicle?: string;
          customer_name?: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          status?: string;
          source?: string;
          consent_given?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          badge: string | null;
          brand: Database["public"]["Enums"]["vehicle_brand"];
          co2_class: string | null;
          co2_emissions: number | null;
          condition: Database["public"]["Enums"]["vehicle_condition"];
          consumption_combined: number | null;
          created_at: string;
          discount_price: number | null;
          features: string[];
          financing_monthly: number | null;
          first_registration: string | null;
          fuel_type: Database["public"]["Enums"]["vehicle_fuel"];
          id: string;
          image_keys: string[];
          image_urls: string[];
          mileage: number;
          mobile_de_id: string | null;
          model: string;
          power_consumption: number | null;
          power_hp: number;
          price: number;
          slug: string | null;
          status: Database["public"]["Enums"]["vehicle_status"];
          transmission: Database["public"]["Enums"]["vehicle_transmission"];
          updated_at: string;
          vat_deductible: boolean;
          version: string;
        };
        Insert: {
          badge?: string | null;
          brand: Database["public"]["Enums"]["vehicle_brand"];
          co2_class?: string | null;
          co2_emissions?: number | null;
          condition: Database["public"]["Enums"]["vehicle_condition"];
          consumption_combined?: number | null;
          created_at?: string;
          discount_price?: number | null;
          features?: string[];
          financing_monthly?: number | null;
          first_registration?: string | null;
          fuel_type: Database["public"]["Enums"]["vehicle_fuel"];
          id?: string;
          image_keys?: string[];
          image_urls?: string[];
          mileage?: number;
          mobile_de_id?: string | null;
          model: string;
          power_consumption?: number | null;
          power_hp: number;
          price: number;
          slug?: string | null;
          status?: Database["public"]["Enums"]["vehicle_status"];
          transmission: Database["public"]["Enums"]["vehicle_transmission"];
          updated_at?: string;
          vat_deductible?: boolean;
          version?: string;
        };
        Update: {
          badge?: string | null;
          brand?: Database["public"]["Enums"]["vehicle_brand"];
          co2_class?: string | null;
          co2_emissions?: number | null;
          condition?: Database["public"]["Enums"]["vehicle_condition"];
          consumption_combined?: number | null;
          created_at?: string;
          discount_price?: number | null;
          features?: string[];
          financing_monthly?: number | null;
          first_registration?: string | null;
          fuel_type?: Database["public"]["Enums"]["vehicle_fuel"];
          id?: string;
          image_keys?: string[];
          image_urls?: string[];
          mileage?: number;
          mobile_de_id?: string | null;
          model?: string;
          power_consumption?: number | null;
          power_hp?: number;
          price?: number;
          slug?: string | null;
          status?: Database["public"]["Enums"]["vehicle_status"];
          transmission?: Database["public"]["Enums"]["vehicle_transmission"];
          updated_at?: string;
          vat_deductible?: boolean;
          version?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "admin" | "staff" | "user";
      lead_status: "Neu" | "In Bearbeitung" | "Erledigt";
      lead_type: "Probefahrt" | "Werkstattermin" | "Fahrzeugankauf" | "Kontakt";
      vehicle_brand: "Alfa Romeo" | "Fiat" | "Abarth" | "Fiat Professional";
      vehicle_condition: "Neuwagen" | "Tageszulassung" | "Gebrauchtwagen";
      vehicle_fuel: "Benzin" | "Diesel" | "Hybrid" | "Elektro";
      vehicle_status: "Verfügbar" | "Reserviert" | "Verkauft";
      vehicle_transmission: "Automatik" | "Schaltgetriebe";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "user"],
      lead_status: ["Neu", "In Bearbeitung", "Erledigt"],
      lead_type: ["Probefahrt", "Werkstattermin", "Fahrzeugankauf", "Kontakt"],
      vehicle_brand: ["Alfa Romeo", "Fiat", "Abarth", "Fiat Professional"],
      vehicle_condition: ["Neuwagen", "Tageszulassung", "Gebrauchtwagen"],
      vehicle_fuel: ["Benzin", "Diesel", "Hybrid", "Elektro"],
      vehicle_status: ["Verfügbar", "Reserviert", "Verkauft"],
      vehicle_transmission: ["Automatik", "Schaltgetriebe"],
    },
  },
} as const;
