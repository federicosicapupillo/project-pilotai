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
      agent_access: {
        Row: {
          accesso_agente_ai: boolean
          amount_cents: number | null
          created_at: string
          currency: string | null
          email: string | null
          id: string
          idea: string | null
          paid_at: string | null
          payment_status: string | null
          project_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accesso_agente_ai?: boolean
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          idea?: string | null
          paid_at?: string | null
          payment_status?: string | null
          project_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accesso_agente_ai?: boolean
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          idea?: string | null
          paid_at?: string | null
          payment_status?: string | null
          project_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_library: {
        Row: {
          base_prompt: string | null
          course_phase: string | null
          created_at: string
          expected_output: string | null
          icon: string | null
          id: string
          name: string
          recommended_tools: Json | null
          role: string | null
          sort_order: number | null
          updated_at: string
          when_to_use: string | null
        }
        Insert: {
          base_prompt?: string | null
          course_phase?: string | null
          created_at?: string
          expected_output?: string | null
          icon?: string | null
          id?: string
          name: string
          recommended_tools?: Json | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string
          when_to_use?: string | null
        }
        Update: {
          base_prompt?: string | null
          course_phase?: string | null
          created_at?: string
          expected_output?: string | null
          icon?: string | null
          id?: string
          name?: string
          recommended_tools?: Json | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string
          when_to_use?: string | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          created_at: string
          expected_output: string | null
          id: string
          name: string
          project_id: string
          prompt_text: string | null
          role: string | null
          when_to_use: string | null
        }
        Insert: {
          created_at?: string
          expected_output?: string | null
          id?: string
          name: string
          project_id: string
          prompt_text?: string | null
          role?: string | null
          when_to_use?: string | null
        }
        Update: {
          created_at?: string
          expected_output?: string | null
          id?: string
          name?: string
          project_id?: string
          prompt_text?: string | null
          role?: string | null
          when_to_use?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_hash: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_hash: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_hash?: string
        }
        Relationships: []
      }
      app_error_logs: {
        Row: {
          action_name: string
          browser: string | null
          created_at: string
          device: string | null
          email_sent: boolean
          error_message: string
          error_stack: string | null
          error_type: string | null
          id: string
          metadata: Json | null
          page_url: string | null
          project_id: string | null
          resolved_at: string | null
          route: string | null
          severity: string
          status: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action_name: string
          browser?: string | null
          created_at?: string
          device?: string | null
          email_sent?: boolean
          error_message: string
          error_stack?: string | null
          error_type?: string | null
          id?: string
          metadata?: Json | null
          page_url?: string | null
          project_id?: string | null
          resolved_at?: string | null
          route?: string | null
          severity?: string
          status?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action_name?: string
          browser?: string | null
          created_at?: string
          device?: string | null
          email_sent?: boolean
          error_message?: string
          error_stack?: string | null
          error_type?: string | null
          id?: string
          metadata?: Json | null
          page_url?: string | null
          project_id?: string | null
          resolved_at?: string | null
          route?: string | null
          severity?: string
          status?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversion_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          project_id: string | null
          source: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_creator: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          source?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_creator?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          source?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_creator?: string | null
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          checklist_items: Json | null
          content: string | null
          created_at: string
          description: string | null
          exercise_text: string | null
          id: string
          module_id: string
          objective: string | null
          order_index: number
          prompt_text: string | null
          recommended_agent: string | null
          recommended_tools: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          checklist_items?: Json | null
          content?: string | null
          created_at?: string
          description?: string | null
          exercise_text?: string | null
          id?: string
          module_id: string
          objective?: string | null
          order_index?: number
          prompt_text?: string | null
          recommended_agent?: string | null
          recommended_tools?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          checklist_items?: Json | null
          content?: string | null
          created_at?: string
          description?: string | null
          exercise_text?: string | null
          id?: string
          module_id?: string
          objective?: string | null
          order_index?: number
          prompt_text?: string | null
          recommended_agent?: string | null
          recommended_tools?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          created_at: string
          description: string | null
          final_output: string | null
          id: string
          objective: string | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          final_output?: string | null
          id?: string
          objective?: string | null
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          final_output?: string | null
          id?: string
          objective?: string | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      error_email_throttle: {
        Row: {
          count: number
          fingerprint: string
          id: string
          last_sent_at: string
        }
        Insert: {
          count?: number
          fingerprint: string
          id?: string
          last_sent_at?: string
        }
        Update: {
          count?: number
          fingerprint?: string
          id?: string
          last_sent_at?: string
        }
        Relationships: []
      }
      idea_calculator_runs: {
        Row: {
          ai_model_version: string | null
          created_at: string
          estimated_dev_cost_max: number | null
          estimated_dev_cost_min: number | null
          estimated_hours_max: number | null
          estimated_hours_min: number | null
          estimated_potential_revenue_max: number | null
          estimated_potential_revenue_min: number | null
          estimated_savings: number | null
          features_in_scope: Json | null
          features_out_of_scope: Json | null
          id: string
          idea_hash: string
          idea_text: string
          language: string | null
          normalized_idea_text: string
          optional_details: Json | null
          pricing_version: string
          prompt_version: string | null
          recommended_mvp_scope: string | null
          result_summary: Json | null
          revenue_model: string | null
          selected_budget_range: string | null
          session_id: string | null
          suggested_price: string | null
          target_user: string | null
          team_ai_cost: number | null
          traditional_cost_estimate: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_model_version?: string | null
          created_at?: string
          estimated_dev_cost_max?: number | null
          estimated_dev_cost_min?: number | null
          estimated_hours_max?: number | null
          estimated_hours_min?: number | null
          estimated_potential_revenue_max?: number | null
          estimated_potential_revenue_min?: number | null
          estimated_savings?: number | null
          features_in_scope?: Json | null
          features_out_of_scope?: Json | null
          id?: string
          idea_hash: string
          idea_text: string
          language?: string | null
          normalized_idea_text: string
          optional_details?: Json | null
          pricing_version?: string
          prompt_version?: string | null
          recommended_mvp_scope?: string | null
          result_summary?: Json | null
          revenue_model?: string | null
          selected_budget_range?: string | null
          session_id?: string | null
          suggested_price?: string | null
          target_user?: string | null
          team_ai_cost?: number | null
          traditional_cost_estimate?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_model_version?: string | null
          created_at?: string
          estimated_dev_cost_max?: number | null
          estimated_dev_cost_min?: number | null
          estimated_hours_max?: number | null
          estimated_hours_min?: number | null
          estimated_potential_revenue_max?: number | null
          estimated_potential_revenue_min?: number | null
          estimated_savings?: number | null
          features_in_scope?: Json | null
          features_out_of_scope?: Json | null
          id?: string
          idea_hash?: string
          idea_text?: string
          language?: string | null
          normalized_idea_text?: string
          optional_details?: Json | null
          pricing_version?: string
          prompt_version?: string | null
          recommended_mvp_scope?: string | null
          result_summary?: Json | null
          revenue_model?: string | null
          selected_budget_range?: string | null
          session_id?: string | null
          suggested_price?: string | null
          target_user?: string | null
          team_ai_cost?: number | null
          traditional_cost_estimate?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      improvement_backlog: {
        Row: {
          created_at: string
          description: string | null
          id: string
          project_id: string | null
          source: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          source?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          source?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "improvement_backlog_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_prompts: {
        Row: {
          agent_name: string
          copied: boolean
          created_at: string
          id: string
          instructions: string
          project_id: string | null
          prompt_text: string
          recommended_tool: string
          step_title: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_name: string
          copied?: boolean
          created_at?: string
          id?: string
          instructions: string
          project_id?: string | null
          prompt_text: string
          recommended_tool: string
          step_title: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_name?: string
          copied?: boolean
          created_at?: string
          id?: string
          instructions?: string
          project_id?: string | null
          prompt_text?: string
          recommended_tool?: string
          step_title?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pm_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          plan: string
          plan_expires_at: string | null
          plan_started_at: string | null
          plan_status: string
          referrer: string | null
          source: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_creator: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          plan?: string
          plan_expires_at?: string | null
          plan_started_at?: string | null
          plan_status?: string
          referrer?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_creator?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          plan?: string
          plan_expires_at?: string | null
          plan_started_at?: string | null
          plan_status?: string
          referrer?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_creator?: string | null
        }
        Relationships: []
      }
      project_analysis: {
        Row: {
          created_at: string
          data_to_save: Json | null
          id: string
          main_features: Json | null
          main_problem: string | null
          mvp_version: string | null
          not_to_build_now: Json | null
          project_id: string
          proposed_solution: string | null
          required_screens: Json | null
          risks: Json | null
          target_users: string | null
        }
        Insert: {
          created_at?: string
          data_to_save?: Json | null
          id?: string
          main_features?: Json | null
          main_problem?: string | null
          mvp_version?: string | null
          not_to_build_now?: Json | null
          project_id: string
          proposed_solution?: string | null
          required_screens?: Json | null
          risks?: Json | null
          target_users?: string | null
        }
        Update: {
          created_at?: string
          data_to_save?: Json | null
          id?: string
          main_features?: Json | null
          main_problem?: string | null
          mvp_version?: string | null
          not_to_build_now?: Json | null
          project_id?: string
          proposed_solution?: string | null
          required_screens?: Json | null
          risks?: Json | null
          target_users?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_manager_logs: {
        Row: {
          action_type: string
          backlog_item_id: string | null
          created_at: string
          decision: string | null
          id: string
          metadata: Json | null
          next_step_title: string | null
          operation_id: string | null
          project_id: string | null
          project_manager_prompt: string | null
          project_manager_response: string | null
          roadmap_step_id: string | null
          step_title: string | null
          user_id: string
          user_message: string | null
        }
        Insert: {
          action_type: string
          backlog_item_id?: string | null
          created_at?: string
          decision?: string | null
          id?: string
          metadata?: Json | null
          next_step_title?: string | null
          operation_id?: string | null
          project_id?: string | null
          project_manager_prompt?: string | null
          project_manager_response?: string | null
          roadmap_step_id?: string | null
          step_title?: string | null
          user_id: string
          user_message?: string | null
        }
        Update: {
          action_type?: string
          backlog_item_id?: string | null
          created_at?: string
          decision?: string | null
          id?: string
          metadata?: Json | null
          next_step_title?: string | null
          operation_id?: string | null
          project_id?: string | null
          project_manager_prompt?: string | null
          project_manager_response?: string | null
          roadmap_step_id?: string | null
          step_title?: string | null
          user_id?: string
          user_message?: string | null
        }
        Relationships: []
      }
      project_workbook: {
        Row: {
          agents_used: Json | null
          best_prompts: Json | null
          bugs_found: Json | null
          created_at: string
          data_to_save: Json | null
          decisions: Json | null
          errors_solved: Json | null
          id: string
          idea: string | null
          launch_materials: Json | null
          mvp: string | null
          next_agent: string | null
          next_steps: Json | null
          next_tool: string | null
          problem: string | null
          project_id: string
          prompts_used: Json | null
          screens: Json | null
          solution: string | null
          target: string | null
          tools_used: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agents_used?: Json | null
          best_prompts?: Json | null
          bugs_found?: Json | null
          created_at?: string
          data_to_save?: Json | null
          decisions?: Json | null
          errors_solved?: Json | null
          id?: string
          idea?: string | null
          launch_materials?: Json | null
          mvp?: string | null
          next_agent?: string | null
          next_steps?: Json | null
          next_tool?: string | null
          problem?: string | null
          project_id: string
          prompts_used?: Json | null
          screens?: Json | null
          solution?: string | null
          target?: string | null
          tools_used?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agents_used?: Json | null
          best_prompts?: Json | null
          bugs_found?: Json | null
          created_at?: string
          data_to_save?: Json | null
          decisions?: Json | null
          errors_solved?: Json | null
          id?: string
          idea?: string | null
          launch_materials?: Json | null
          mvp?: string | null
          next_agent?: string | null
          next_steps?: Json | null
          next_tool?: string | null
          problem?: string | null
          project_id?: string
          prompts_used?: Json | null
          screens?: Json | null
          solution?: string | null
          target?: string | null
          tools_used?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_workbook_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          deleted_at: string | null
          existing_tools: string | null
          experience_level: string | null
          id: string
          idea_description: string | null
          idea_run_id: string | null
          problem: string | null
          product_type: string | null
          solution: string | null
          status: string
          target: string | null
          title: string
          updated_at: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          existing_tools?: string | null
          experience_level?: string | null
          id?: string
          idea_description?: string | null
          idea_run_id?: string | null
          problem?: string | null
          product_type?: string | null
          solution?: string | null
          status?: string
          target?: string | null
          title: string
          updated_at?: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          existing_tools?: string | null
          experience_level?: string | null
          id?: string
          idea_description?: string | null
          idea_run_id?: string | null
          problem?: string | null
          product_type?: string | null
          solution?: string | null
          status?: string
          target?: string | null
          title?: string
          updated_at?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_idea_run_id_fkey"
            columns: ["idea_run_id"]
            isOneToOne: false
            referencedRelation: "idea_calculator_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          category: string
          created_at: string
          id: string
          project_id: string | null
          prompt_text: string
          recommended_tool: string | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          project_id?: string | null
          prompt_text: string
          recommended_tool?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          project_id?: string | null
          prompt_text?: string
          recommended_tool?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_items: {
        Row: {
          checklist_items: Json
          completed_at: string | null
          created_at: string
          description: string | null
          expected_output: string | null
          id: string
          order_index: number
          phase: string | null
          priority: number
          progress_weight: number
          project_id: string
          prompt_text: string | null
          recommended_agent: string | null
          recommended_tool: string | null
          status: string
          title: string
          updated_at: string
          user_notes: string | null
        }
        Insert: {
          checklist_items?: Json
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expected_output?: string | null
          id?: string
          order_index?: number
          phase?: string | null
          priority?: number
          progress_weight?: number
          project_id: string
          prompt_text?: string | null
          recommended_agent?: string | null
          recommended_tool?: string | null
          status?: string
          title: string
          updated_at?: string
          user_notes?: string | null
        }
        Update: {
          checklist_items?: Json
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expected_output?: string | null
          id?: string
          order_index?: number
          phase?: string | null
          priority?: number
          progress_weight?: number
          project_id?: string
          prompt_text?: string | null
          recommended_agent?: string | null
          recommended_tool?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_library: {
        Row: {
          category: string | null
          course_phase: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          example_use: string | null
          icon_color: string | null
          icon_slug: string | null
          id: string
          level: string | null
          name: string
          pairs_with_agents: Json | null
          phase_note: string | null
          requirement: string | null
          sort_order: number | null
          updated_at: string
          url: string | null
          use_case: string | null
        }
        Insert: {
          category?: string | null
          course_phase?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          example_use?: string | null
          icon_color?: string | null
          icon_slug?: string | null
          id?: string
          level?: string | null
          name: string
          pairs_with_agents?: Json | null
          phase_note?: string | null
          requirement?: string | null
          sort_order?: number | null
          updated_at?: string
          url?: string | null
          use_case?: string | null
        }
        Update: {
          category?: string | null
          course_phase?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          example_use?: string | null
          icon_color?: string | null
          icon_slug?: string | null
          id?: string
          level?: string | null
          name?: string
          pairs_with_agents?: Json | null
          phase_note?: string | null
          requirement?: string | null
          sort_order?: number | null
          updated_at?: string
          url?: string | null
          use_case?: string | null
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          notes: string | null
          project_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          notes?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          notes?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          currency: string | null
          expires_at: string | null
          id: string
          plan: string
          price_paid: number | null
          source: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_creator: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          plan: string
          price_paid?: number | null
          source?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_creator?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          plan?: string
          price_paid?: number | null
          source?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_creator?: string | null
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
