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
      consent_audit_log: {
        Row: {
          action: string
          consent_record_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          consent_record_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          consent_record_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_audit_log_consent_record_id_fkey"
            columns: ["consent_record_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          child_user_id: string | null
          consent_audio: boolean | null
          consent_hash: string
          consent_sensor_data: boolean | null
          consent_version: string
          consent_video_upload: boolean | null
          created_at: string | null
          granted_at: string | null
          id: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          child_user_id?: string | null
          consent_audio?: boolean | null
          consent_hash: string
          consent_sensor_data?: boolean | null
          consent_version?: string
          consent_video_upload?: boolean | null
          created_at?: string | null
          granted_at?: string | null
          id?: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          child_user_id?: string | null
          consent_audio?: boolean | null
          consent_hash?: string
          consent_sensor_data?: boolean | null
          consent_version?: string
          consent_video_upload?: boolean | null
          created_at?: string | null
          granted_at?: string | null
          id?: string
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_retention_settings: {
        Row: {
          child_user_id: string | null
          id: string
          retention_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          child_user_id?: string | null
          id?: string
          retention_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          child_user_id?: string | null
          id?: string
          retention_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      experiment_participants: {
        Row: {
          allocation_code: string
          arm: string
          created_at: string | null
          experiment_id: string
          id: string
          participant_id: string
          stratum: string | null
          user_id: string | null
        }
        Insert: {
          allocation_code: string
          arm: string
          created_at?: string | null
          experiment_id: string
          id?: string
          participant_id?: string
          stratum?: string | null
          user_id?: string | null
        }
        Update: {
          allocation_code?: string
          arm?: string
          created_at?: string | null
          experiment_id?: string
          id?: string
          participant_id?: string
          stratum?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_participants_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_session_logs: {
        Row: {
          arm: string
          completion_flag: boolean | null
          created_at: string | null
          duration_seconds: number | null
          end_timestamp: string | null
          experiment_id: string
          id: string
          participant_id: string
          session_id: string | null
          start_timestamp: string
          teacher_rating: number | null
        }
        Insert: {
          arm: string
          completion_flag?: boolean | null
          created_at?: string | null
          duration_seconds?: number | null
          end_timestamp?: string | null
          experiment_id: string
          id?: string
          participant_id: string
          session_id?: string | null
          start_timestamp: string
          teacher_rating?: number | null
        }
        Update: {
          arm?: string
          completion_flag?: boolean | null
          created_at?: string | null
          duration_seconds?: number | null
          end_timestamp?: string | null
          experiment_id?: string
          id?: string
          participant_id?: string
          session_id?: string | null
          start_timestamp?: string
          teacher_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "experiment_session_logs_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_session_logs_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "experiment_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          arms: Json
          created_at: string | null
          description: string | null
          id: string
          name: string
          researcher_id: string
          seed: number
          status: string
          strata: Json | null
        }
        Insert: {
          arms?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          researcher_id: string
          seed?: number
          status?: string
          strata?: Json | null
        }
        Update: {
          arms?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          researcher_id?: string
          seed?: number
          status?: string
          strata?: Json | null
        }
        Relationships: []
      }
      movements: {
        Row: {
          animation_url: string | null
          child_instruction: string | null
          created_at: string | null
          description: string
          difficulty_level: string
          domain: string
          duration_seconds: number
          equipment: string | null
          id: string
          illustration: string | null
          motor_goal: string | null
          name: string
          parent_instruction: string | null
          safety_note: string | null
          week_introduced: number | null
        }
        Insert: {
          animation_url?: string | null
          child_instruction?: string | null
          created_at?: string | null
          description: string
          difficulty_level?: string
          domain: string
          duration_seconds?: number
          equipment?: string | null
          id?: string
          illustration?: string | null
          motor_goal?: string | null
          name: string
          parent_instruction?: string | null
          safety_note?: string | null
          week_introduced?: number | null
        }
        Update: {
          animation_url?: string | null
          child_instruction?: string | null
          created_at?: string | null
          description?: string
          difficulty_level?: string
          domain?: string
          duration_seconds?: number
          equipment?: string | null
          id?: string
          illustration?: string | null
          motor_goal?: string | null
          name?: string
          parent_instruction?: string | null
          safety_note?: string | null
          week_introduced?: number | null
        }
        Relationships: []
      }
      report_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          report_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          report_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          report_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      report_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          report_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          report_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          report_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_notifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "session_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      session_reports: {
        Row: {
          activity_score: number | null
          child_name: string | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number | null
          exercises_summary: Json | null
          id: string
          session_date: string | null
          session_id: string | null
          started_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          activity_score?: number | null
          child_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          exercises_summary?: Json | null
          id?: string
          session_date?: string | null
          session_id?: string | null
          started_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          activity_score?: number | null
          child_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          exercises_summary?: Json | null
          id?: string
          session_date?: string | null
          session_id?: string | null
          started_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "session_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_assessments: {
        Row: {
          assessed_at: string
          domain: string
          id: string
          notes: string | null
          rating: number
          skill_id: string
          user_id: string
        }
        Insert: {
          assessed_at?: string
          domain: string
          id?: string
          notes?: string | null
          rating?: number
          skill_id: string
          user_id: string
        }
        Update: {
          assessed_at?: string
          domain?: string
          id?: string
          notes?: string | null
          rating?: number
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          activity_name: string
          category: string
          created_at: string
          date: string
          id: string
          notes: string | null
          score: number | null
          user_id: string
          username: string
        }
        Insert: {
          activity_name: string
          category: string
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          score?: number | null
          user_id: string
          username: string
        }
        Update: {
          activity_name?: string
          category?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          score?: number | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          age: number | null
          avatar: string | null
          created_at: string
          current_level: number
          current_week: number
          email: string | null
          id: string
          research_mode: boolean
          username: string
          weekly_schedule: number[] | null
        }
        Insert: {
          age?: number | null
          avatar?: string | null
          created_at?: string
          current_level?: number
          current_week?: number
          email?: string | null
          id: string
          research_mode?: boolean
          username: string
          weekly_schedule?: number[] | null
        }
        Update: {
          age?: number | null
          avatar?: string | null
          created_at?: string
          current_level?: number
          current_week?: number
          email?: string | null
          id?: string
          research_mode?: boolean
          username?: string
          weekly_schedule?: number[] | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completed: boolean | null
          created_at: string
          date: string
          duration: number | null
          exercises: string[] | null
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          date: string
          duration?: number | null
          exercises?: string[] | null
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          date?: string
          duration?: number | null
          exercises?: string[] | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_username_available: {
        Args: { username_input: string }
        Returns: boolean
      }
      check_weekly_session_limit: {
        Args: { user_id_input: string }
        Returns: boolean
      }
      complete_training_session: {
        Args: { session_id_input: string }
        Returns: undefined
      }
      erase_child_pii: {
        Args: { child_user_id_input: string }
        Returns: undefined
      }
      generate_session_report: {
        Args: {
          child_name_input: string
          duration_input: number
          exercises_input: Json
          score_input: number
          session_id_input: string
          user_id_input: string
        }
        Returns: string
      }
      get_weekly_sessions_remaining: {
        Args: { user_id_input: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      randomize_participant: {
        Args: {
          experiment_id_input: string
          stratum_input?: string
          user_id_input?: string
        }
        Returns: Json
      }
      start_training_session: {
        Args: { user_id_input: string }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "developer"
        | "teacher"
        | "parent"
        | "researcher"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "developer",
        "teacher",
        "parent",
        "researcher",
      ],
    },
  },
} as const
