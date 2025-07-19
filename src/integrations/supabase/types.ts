export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      branding_info: {
        Row: {
          accountable_user: string | null
          brand_element_type: string | null
          client_id: string | null
          colors: Json | null
          completed_at: string | null
          completed_by: string | null
          completion_content: string | null
          consulted_at: string | null
          consulted_by: string | null
          consulted_content: string | null
          consulted_users: string[] | null
          correction_feedback: string | null
          correction_requested_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          fonts: Json | null
          id: string
          info_type: Database["public"]["Enums"]["info_type"]
          informed_users: string[] | null
          metadata: Json | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          responsible_user: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          accountable_user?: string | null
          brand_element_type?: string | null
          client_id?: string | null
          colors?: Json | null
          completed_at?: string | null
          completed_by?: string | null
          completion_content?: string | null
          consulted_at?: string | null
          consulted_by?: string | null
          consulted_content?: string | null
          consulted_users?: string[] | null
          correction_feedback?: string | null
          correction_requested_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          fonts?: Json | null
          id?: string
          info_type: Database["public"]["Enums"]["info_type"]
          informed_users?: string[] | null
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          responsible_user?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          accountable_user?: string | null
          brand_element_type?: string | null
          client_id?: string | null
          colors?: Json | null
          completed_at?: string | null
          completed_by?: string | null
          completion_content?: string | null
          consulted_at?: string | null
          consulted_by?: string | null
          consulted_content?: string | null
          consulted_users?: string[] | null
          correction_feedback?: string | null
          correction_requested_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          fonts?: Json | null
          id?: string
          info_type?: Database["public"]["Enums"]["info_type"]
          informed_users?: string[] | null
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          responsible_user?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branding_info_accountable_user_fkey"
            columns: ["accountable_user"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branding_info_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branding_info_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branding_info_consulted_by_fkey"
            columns: ["consulted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branding_info_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branding_info_responsible_user_fkey"
            columns: ["responsible_user"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branding_info_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          area: string
          client_id: string
          concepto: string
          created_at: string
          created_by: string | null
          descripcion: string | null
          dia: string
          horario_final: string
          horario_inicial: string
          id: string
          personas_asignadas: string[] | null
          updated_at: string
        }
        Insert: {
          area: string
          client_id: string
          concepto: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          dia: string
          horario_final: string
          horario_inicial: string
          id?: string
          personas_asignadas?: string[] | null
          updated_at?: string
        }
        Update: {
          area?: string
          client_id?: string
          concepto?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          dia?: string
          horario_final?: string
          horario_inicial?: string
          id?: string
          personas_asignadas?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          budget: number | null
          client_name: string
          created_at: string | null
          created_by: string | null
          deadline: string | null
          description: string | null
          id: string
          name: string
          phase: string | null
          progress: number | null
          start_date: string | null
          status: string | null
          team: string[] | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          client_name: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          phase?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          team?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          phase?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          team?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_content: {
        Row: {
          client_id: string | null
          comentarios_copies: string | null
          comentarios_diseno: string | null
          copy_grafica_video: string | null
          copy_publicacion: string | null
          created_at: string
          created_by: string | null
          disenadora: string | null
          estado_copies: string
          estado_diseno: string
          fecha: string
          id: string
          link: string | null
          pilar: string | null
          plataforma: string
          referencia: string | null
          semana: string
          tipo_publicacion: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          comentarios_copies?: string | null
          comentarios_diseno?: string | null
          copy_grafica_video?: string | null
          copy_publicacion?: string | null
          created_at?: string
          created_by?: string | null
          disenadora?: string | null
          estado_copies?: string
          estado_diseno?: string
          fecha: string
          id?: string
          link?: string | null
          pilar?: string | null
          plataforma: string
          referencia?: string | null
          semana: string
          tipo_publicacion: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          comentarios_copies?: string | null
          comentarios_diseno?: string | null
          copy_grafica_video?: string | null
          copy_publicacion?: string | null
          created_at?: string
          created_by?: string | null
          disenadora?: string | null
          estado_copies?: string
          estado_diseno?: string
          fecha?: string
          id?: string
          link?: string | null
          pilar?: string | null
          plataforma?: string
          referencia?: string | null
          semana?: string
          tipo_publicacion?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_task: {
        Row: {
          accountable_user: string | null
          client_id: string | null
          completed_at: string | null
          completed_by: string | null
          completion_content: string | null
          consulted_at: string | null
          consulted_by: string | null
          consulted_content: string | null
          consulted_users: string[] | null
          content_type: string | null
          correction_feedback: string | null
          correction_requested_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          info_type: Database["public"]["Enums"]["info_type"]
          informed_users: string[] | null
          metadata: Json | null
          pillar: string | null
          platform: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          responsible_user: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          accountable_user?: string | null
          client_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_content?: string | null
          consulted_at?: string | null
          consulted_by?: string | null
          consulted_content?: string | null
          consulted_users?: string[] | null
          content_type?: string | null
          correction_feedback?: string | null
          correction_requested_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          info_type: Database["public"]["Enums"]["info_type"]
          informed_users?: string[] | null
          metadata?: Json | null
          pillar?: string | null
          platform?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          responsible_user?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          accountable_user?: string | null
          client_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_content?: string | null
          consulted_at?: string | null
          consulted_by?: string | null
          consulted_content?: string | null
          consulted_users?: string[] | null
          content_type?: string | null
          correction_feedback?: string | null
          correction_requested_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          info_type?: Database["public"]["Enums"]["info_type"]
          informed_users?: string[] | null
          metadata?: Json | null
          pillar?: string | null
          platform?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          responsible_user?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_info_accountable_user_fkey"
            columns: ["accountable_user"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_info_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_info_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_info_consulted_by_fkey"
            columns: ["consulted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_info_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_info_responsible_user_fkey"
            columns: ["responsible_user"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_info_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      links_temporales: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          id: string
          link: string
          objetivos: Json | null
          pilares: Json | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          link: string
          objetivos?: Json | null
          pilares?: Json | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          link?: string
          objetivos?: Json | null
          pilares?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      marketing_task_camp: {
        Row: {
          accountable_user: string | null
          budget: number | null
          campaign_type: string | null
          client_id: string | null
          completed_at: string | null
          completed_by: string | null
          completion_content: string | null
          consulted_at: string | null
          consulted_by: string | null
          consulted_content: string | null
          consulted_users: string[] | null
          conversions: number | null
          correction_feedback: string | null
          correction_requested_at: string | null
          created_at: string | null
          created_by: string | null
          ctr_percentage: number | null
          description: string | null
          due_date: string | null
          end_date: string | null
          id: string
          info_type: Database["public"]["Enums"]["info_type"]
          informed_users: string[] | null
          metadata: Json | null
          metrics_period_end: string | null
          metrics_period_start: string | null
          metrics_updated_at: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          progress: number | null
          responsible_user: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          roi_percentage: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          target_audience: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          accountable_user?: string | null
          budget?: number | null
          campaign_type?: string | null
          client_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_content?: string | null
          consulted_at?: string | null
          consulted_by?: string | null
          consulted_content?: string | null
          consulted_users?: string[] | null
          conversions?: number | null
          correction_feedback?: string | null
          correction_requested_at?: string | null
          created_at?: string | null
          created_by?: string | null
          ctr_percentage?: number | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          info_type: Database["public"]["Enums"]["info_type"]
          informed_users?: string[] | null
          metadata?: Json | null
          metrics_period_end?: string | null
          metrics_period_start?: string | null
          metrics_updated_at?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          progress?: number | null
          responsible_user?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          roi_percentage?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          target_audience?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          accountable_user?: string | null
          budget?: number | null
          campaign_type?: string | null
          client_id?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_content?: string | null
          consulted_at?: string | null
          consulted_by?: string | null
          consulted_content?: string | null
          consulted_users?: string[] | null
          conversions?: number | null
          correction_feedback?: string | null
          correction_requested_at?: string | null
          created_at?: string | null
          created_by?: string | null
          ctr_percentage?: number | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          info_type?: Database["public"]["Enums"]["info_type"]
          informed_users?: string[] | null
          metadata?: Json | null
          metrics_period_end?: string | null
          metrics_period_start?: string | null
          metrics_updated_at?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          progress?: number | null
          responsible_user?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          roi_percentage?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          target_audience?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_info_accountable_user_fkey"
            columns: ["accountable_user"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_info_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_info_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_info_consulted_by_fkey"
            columns: ["consulted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_info_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_info_responsible_user_fkey"
            columns: ["responsible_user"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_info_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          notification_type: string
          read: boolean
          task_id: string
          task_table: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          notification_type: string
          read?: boolean
          task_id: string
          task_table: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          notification_type?: string
          read?: boolean
          task_id?: string
          task_table?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
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
      info_type:
        | "campaign"
        | "task"
        | "calendar_event"
        | "content_week"
        | "brand_element"
      priority_level: "low" | "medium" | "high"
      task_status:
        | "pending"
        | "in_progress"
        | "in_review"
        | "completed"
        | "correction_needed"
      user_role: "admin" | "user"
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
      info_type: [
        "campaign",
        "task",
        "calendar_event",
        "content_week",
        "brand_element",
      ],
      priority_level: ["low", "medium", "high"],
      task_status: [
        "pending",
        "in_progress",
        "in_review",
        "completed",
        "correction_needed",
      ],
      user_role: ["admin", "user"],
    },
  },
} as const
