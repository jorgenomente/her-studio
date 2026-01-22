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
      appointment: {
        Row: {
          branch_id: string
          client_id: string | null
          created_at: string
          end_at: string
          id: string
          notes: string | null
          service_id: string
          staff_id: string
          start_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          branch_id: string
          client_id?: string | null
          created_at?: string
          end_at: string
          id?: string
          notes?: string | null
          service_id: string
          staff_id: string
          start_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          branch_id?: string
          client_id?: string | null
          created_at?: string
          end_at?: string
          id?: string
          notes?: string | null
          service_id?: string
          staff_id?: string
          start_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_clients_list"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointment_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      branch: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          organization_id: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_service: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          is_available: boolean
          is_enabled: boolean
          service_id: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          is_available?: boolean
          is_enabled?: boolean
          service_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          is_available?: boolean
          is_enabled?: boolean
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_service_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_service_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "branch_service_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      client: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          home_branch_id: string | null
          id: string
          organization_id: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          home_branch_id?: string | null
          id?: string
          organization_id: string
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          home_branch_id?: string | null
          id?: string
          organization_id?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_home_branch_id_fkey"
            columns: ["home_branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_home_branch_id_fkey"
            columns: ["home_branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "client_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string
          id: string
          proof_url: string | null
          status: Database["public"]["Enums"]["deposit_status"]
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string
          id?: string
          proof_url?: string | null
          status?: Database["public"]["Enums"]["deposit_status"]
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string
          id?: string
          proof_url?: string | null
          status?: Database["public"]["Enums"]["deposit_status"]
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposit_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "v_app_agenda_day"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "deposit_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "v_app_appointment_detail"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "deposit_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "v_app_client_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "deposit_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "v_app_pos_unpaid_appointments"
            referencedColumns: ["appointment_id"]
          },
        ]
      }
      migration_smoke_test: {
        Row: {
          created_at: string
          id: string
          note: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
        }
        Relationships: []
      }
      organization: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment: {
        Row: {
          amount: number
          appointment_id: string | null
          branch_id: string
          client_id: string | null
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          branch_id: string
          client_id?: string | null
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          branch_id?: string
          client_id?: string | null
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_agenda_day"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_appointment_detail"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_pos_unpaid_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_clients_list"
            referencedColumns: ["client_id"]
          },
        ]
      }
      payment_source: {
        Row: {
          created_at: string
          id: string
          is_recurrent: boolean
          payment_id: string
          referred_by: string | null
          source: Database["public"]["Enums"]["payment_source_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_recurrent?: boolean
          payment_id: string
          referred_by?: string | null
          source: Database["public"]["Enums"]["payment_source_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_recurrent?: boolean
          payment_id?: string
          referred_by?: string | null
          source?: Database["public"]["Enums"]["payment_source_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_source_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_source_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "v_app_appointment_detail"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "payment_source_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "v_app_client_payments"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "payment_source_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "v_app_pos_payment_detail"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "payment_source_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "v_app_pos_payments_day"
            referencedColumns: ["payment_id"]
          },
        ]
      }
      product: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          stock_min: number
          unit: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          stock_min?: number
          unit: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          stock_min?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          notes: string | null
          ordered_at: string
          received_at: string | null
          status: Database["public"]["Enums"]["purchase_status"]
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          notes?: string | null
          ordered_at?: string
          received_at?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          ordered_at?: string
          received_at?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      purchase_item: {
        Row: {
          created_at: string
          id: string
          product_id: string
          purchase_id: string
          quantity_ordered: number
          quantity_received: number | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          purchase_id: string
          quantity_ordered: number
          quantity_received?: number | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          purchase_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_app_stock_snapshot"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_item_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_item_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "v_app_purchase_detail"
            referencedColumns: ["purchase_id"]
          },
          {
            foreignKeyName: "purchase_item_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "v_app_purchases_list"
            referencedColumns: ["purchase_id"]
          },
        ]
      }
      receipt: {
        Row: {
          created_at: string
          id: string
          payment_id: string
          receipt_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_id: string
          receipt_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_id?: string
          receipt_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipt_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "v_app_appointment_detail"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "receipt_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "v_app_client_payments"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "receipt_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "v_app_pos_payment_detail"
            referencedColumns: ["payment_id"]
          },
          {
            foreignKeyName: "receipt_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "v_app_pos_payments_day"
            referencedColumns: ["payment_id"]
          },
        ]
      }
      recipe: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          is_active: boolean
          service_id: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          service_id: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "recipe_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_item: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          recipe_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          recipe_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          recipe_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_app_stock_snapshot"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipe_item_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe"
            referencedColumns: ["id"]
          },
        ]
      }
      service: {
        Row: {
          created_at: string
          duration_min: number
          id: string
          is_active: boolean
          name: string
          price_base: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_min: number
          id?: string
          is_active?: boolean
          name: string
          price_base?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_min?: number
          id?: string
          is_active?: boolean
          name?: string
          price_base?: number
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          branch_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      staff_availability: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          staff_id: string
          start_time: string
          updated_at: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          staff_id: string
          start_time: string
          updated_at?: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          staff_id?: string
          start_time?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_availability_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movement: {
        Row: {
          appointment_id: string | null
          branch_id: string
          created_at: string
          id: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          product_id: string
          purchase_id: string | null
          quantity: number
          reason: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          branch_id: string
          created_at?: string
          id?: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          product_id: string
          purchase_id?: string | null
          quantity: number
          reason?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          branch_id?: string
          created_at?: string
          id?: string
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          product_id?: string
          purchase_id?: string | null
          quantity?: number
          reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movement_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movement_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_agenda_day"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "stock_movement_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_appointment_detail"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "stock_movement_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "stock_movement_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_pos_unpaid_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "stock_movement_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movement_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "stock_movement_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movement_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_app_stock_snapshot"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movement_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movement_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "v_app_purchase_detail"
            referencedColumns: ["purchase_id"]
          },
          {
            foreignKeyName: "stock_movement_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "v_app_purchases_list"
            referencedColumns: ["purchase_id"]
          },
        ]
      }
      user_branch_role: {
        Row: {
          branch_id: string
          can_manage_agenda: boolean
          can_manage_payments: boolean
          can_manage_stock: boolean
          created_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_id: string
          can_manage_agenda?: boolean
          can_manage_payments?: boolean
          can_manage_stock?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_id?: string
          can_manage_agenda?: boolean
          can_manage_payments?: boolean
          can_manage_stock?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_branch_role_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_branch_role_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "user_branch_role_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      v_app_agenda_day: {
        Row: {
          appointment_id: string | null
          branch_id: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          end_at: string | null
          has_deposit: boolean | null
          has_payment: boolean | null
          service_id: string | null
          service_name: string | null
          staff_id: string | null
          staff_name: string | null
          start_at: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_clients_list"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointment_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      v_app_appointment_detail: {
        Row: {
          appointment_duration_min: number | null
          appointment_id: string | null
          branch_id: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          deposit_amount: number | null
          deposit_id: string | null
          deposit_proof_url: string | null
          deposit_status: Database["public"]["Enums"]["deposit_status"] | null
          deposit_verified_at: string | null
          end_at: string | null
          notes: string | null
          payment_amount: number | null
          payment_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_paid_at: string | null
          receipt_id: string | null
          receipt_number: string | null
          service_id: string | null
          service_name: string | null
          staff_id: string | null
          staff_name: string | null
          start_at: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_clients_list"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointment_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      v_app_client_appointments: {
        Row: {
          appointment_id: string | null
          branch_id: string | null
          client_id: string | null
          end_at: string | null
          service_id: string | null
          service_name: string | null
          staff_id: string | null
          staff_name: string | null
          start_at: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_clients_list"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointment_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      v_app_client_detail: {
        Row: {
          branch_id: string | null
          client_id: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          last_visit_at: string | null
          phone: string | null
          total_spent: number | null
          updated_at: string | null
          visits_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_home_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_home_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      v_app_client_payments: {
        Row: {
          amount: number | null
          appointment_id: string | null
          branch_id: string | null
          client_id: string | null
          is_recurrent: boolean | null
          method: Database["public"]["Enums"]["payment_method"] | null
          paid_at: string | null
          payment_id: string | null
          referred_by: string | null
          source: Database["public"]["Enums"]["payment_source_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_agenda_day"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_appointment_detail"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_pos_unpaid_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_clients_list"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_app_clients_list: {
        Row: {
          branch_id: string | null
          client_id: string | null
          email: string | null
          full_name: string | null
          last_visit_at: string | null
          phone: string | null
          total_spent: number | null
          visits_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_home_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_home_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      v_app_dashboard_day: {
        Row: {
          branch_id: string | null
          count_appointments_day: number | null
          count_cancelled_day: number | null
          count_completed_day: number | null
          count_no_show_day: number | null
          low_stock_count: number | null
          total_income_day: number | null
          unpaid_count: number | null
        }
        Relationships: []
      }
      v_app_pos_payment_detail: {
        Row: {
          amount: number | null
          appointment_id: string | null
          branch_id: string | null
          client_id: string | null
          is_recurrent: boolean | null
          method: Database["public"]["Enums"]["payment_method"] | null
          paid_at: string | null
          payment_id: string | null
          payment_source:
            | Database["public"]["Enums"]["payment_source_type"]
            | null
          payment_source_id: string | null
          receipt_id: string | null
          receipt_number: string | null
          referred_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_agenda_day"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_appointment_detail"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_pos_unpaid_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_clients_list"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_app_pos_payments_day: {
        Row: {
          amount: number | null
          appointment_id: string | null
          branch_id: string | null
          client_id: string | null
          method: Database["public"]["Enums"]["payment_method"] | null
          paid_at: string | null
          payment_id: string | null
        }
        Insert: {
          amount?: number | null
          appointment_id?: string | null
          branch_id?: string | null
          client_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          paid_at?: string | null
          payment_id?: string | null
        }
        Update: {
          amount?: number | null
          appointment_id?: string | null
          branch_id?: string | null
          client_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          paid_at?: string | null
          payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_agenda_day"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_appointment_detail"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_app_pos_unpaid_appointments"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "payment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_clients_list"
            referencedColumns: ["client_id"]
          },
        ]
      }
      v_app_pos_unpaid_appointments: {
        Row: {
          appointment_id: string | null
          branch_id: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          end_at: string | null
          service_id: string | null
          service_name: string | null
          staff_id: string | null
          staff_name: string | null
          start_at: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_client_detail"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_app_clients_list"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "appointment_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      v_app_purchase_detail: {
        Row: {
          branch_id: string | null
          notes: string | null
          ordered_at: string | null
          product_id: string | null
          product_name: string | null
          purchase_id: string | null
          purchase_item_id: string | null
          quantity_ordered: number | null
          quantity_received: number | null
          received_at: string | null
          status: Database["public"]["Enums"]["purchase_status"] | null
          unit_cost: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "purchase_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_app_stock_snapshot"
            referencedColumns: ["product_id"]
          },
        ]
      }
      v_app_purchases_list: {
        Row: {
          branch_id: string | null
          items_count: number | null
          notes: string | null
          ordered_at: string | null
          ordered_total_qty: number | null
          purchase_id: string | null
          received_at: string | null
          status: Database["public"]["Enums"]["purchase_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      v_app_stock_snapshot: {
        Row: {
          branch_id: string | null
          is_low_stock: boolean | null
          product_id: string | null
          product_name: string | null
          qty_on_hand: number | null
          stock_min: number | null
          unit: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "v_app_dashboard_day"
            referencedColumns: ["branch_id"]
          },
        ]
      }
    }
    Functions: {
      has_any_branch_access: { Args: never; Returns: boolean }
      has_branch_access: { Args: { branch_id: string }; Returns: boolean }
      has_permission: {
        Args: { branch_id: string; permission_flag: string }
        Returns: boolean
      }
      is_superadmin: { Args: never; Returns: boolean }
      rpc_accept_invite: {
        Args: { p_token: string; p_full_name?: string | null }
        Returns: undefined
      }
      rpc_create_invite: {
        Args: {
          p_branch_id: string
          p_email: string
          p_full_name?: string | null
          p_role: Database["public"]["Enums"]["user_role"]
          p_can_manage_agenda: boolean
          p_can_manage_payments: boolean
          p_can_manage_stock: boolean
        }
        Returns: { invite_id: string; token: string }[]
      }
      rpc_create_or_update_deposit: {
        Args: {
          p_amount: number
          p_appointment_id: string
          p_branch_id: string
          p_proof_url?: string
        }
        Returns: string
      }
      rpc_create_staff: {
        Args: {
          p_branch_id: string
          p_full_name: string
          p_email?: string | null
          p_phone?: string | null
        }
        Returns: string
      }
      rpc_create_payment_for_appointment: {
        Args: {
          p_amount: number
          p_appointment_id: string
          p_branch_id: string
          p_client_id?: string
          p_is_recurrent: boolean
          p_method: Database["public"]["Enums"]["payment_method"]
          p_paid_at?: string
          p_referred_by?: string
          p_source: Database["public"]["Enums"]["payment_source_type"]
        }
        Returns: string
      }
      rpc_create_purchase: {
        Args: { p_branch_id: string; p_items: Json; p_notes?: string }
        Returns: string
      }
      rpc_create_stock_movement: {
        Args: {
          p_appointment_id?: string
          p_branch_id: string
          p_movement_type: Database["public"]["Enums"]["stock_movement_type"]
          p_product_id: string
          p_purchase_id?: string
          p_quantity: number
          p_reason?: string
        }
        Returns: string
      }
      rpc_create_walkin_payment: {
        Args: {
          p_amount: number
          p_branch_id: string
          p_client_email?: string
          p_client_full_name?: string
          p_client_phone?: string
          p_is_recurrent: boolean
          p_method: Database["public"]["Enums"]["payment_method"]
          p_paid_at?: string
          p_referred_by?: string
          p_service_id?: string
          p_source: Database["public"]["Enums"]["payment_source_type"]
        }
        Returns: string
      }
      rpc_public_create_reservation: {
        Args: {
          p_branch_id: string
          p_email?: string
          p_full_name: string
          p_notes?: string
          p_phone: string
          p_service_id: string
          p_staff_id?: string
          p_staff_strategy?: string
          p_start_at: string
        }
        Returns: string
      }
      rpc_public_attach_deposit_proof: {
        Args: {
          p_appointment_id: string
          p_amount: number
          p_proof_path: string
        }
        Returns: undefined
      }
      rpc_public_list_branches: {
        Args: Record<PropertyKey, never>
        Returns: {
          branch_id: string
          name: string
          address: string | null
          timezone: string
        }[]
      }
      rpc_public_list_branch_services: {
        Args: { p_branch_id: string }
        Returns: {
          branch_id: string
          service_id: string
          service_name: string
          duration_min: number
          price_base: number
          is_available: boolean
        }[]
      }
      rpc_public_list_staff: {
        Args: { p_branch_id: string }
        Returns: {
          staff_id: string
          staff_name: string | null
        }[]
      }
      rpc_public_availability_day: {
        Args: { p_branch_id: string; p_service_id: string; p_date: string }
        Returns: {
          start_at: string | null
          end_at: string | null
          staff_id: string | null
          staff_name: string | null
        }[]
      }
      rpc_receive_purchase: {
        Args: { p_branch_id: string; p_items: Json; p_purchase_id: string }
        Returns: undefined
      }
      rpc_set_branch_service_state: {
        Args: {
          p_branch_id: string
          p_service_id: string
          p_is_enabled: boolean
          p_is_available: boolean
        }
        Returns: undefined
      }
      rpc_set_staff_availability: {
        Args: { p_staff_id: string; p_branch_id: string; p_availability: Json }
        Returns: undefined
      }
      rpc_update_appointment_status: {
        Args: {
          p_appointment_id: string
          p_branch_id: string
          p_new_status: Database["public"]["Enums"]["appointment_status"]
        }
        Returns: undefined
      }
      rpc_update_staff: {
        Args: {
          p_staff_id: string
          p_branch_id: string
          p_full_name?: string | null
          p_email?: string | null
          p_phone?: string | null
          p_status?: string | null
        }
        Returns: undefined
      }
      rpc_update_user_branch_role: {
        Args: {
          p_user_id: string
          p_branch_id: string
          p_role: Database["public"]["Enums"]["user_role"]
          p_can_manage_agenda: boolean
          p_can_manage_payments: boolean
          p_can_manage_stock: boolean
          p_is_active: boolean
        }
        Returns: undefined
      }
      rpc_verify_deposit: {
        Args: {
          p_branch_id: string
          p_deposit_id: string
          p_status: Database["public"]["Enums"]["deposit_status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "scheduled_deposit_pending"
        | "scheduled_deposit_verified"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      deposit_status: "pending" | "verified" | "rejected"
      payment_method: "cash" | "transfer" | "card" | "other"
      payment_source_type:
        | "recommendation"
        | "instagram"
        | "google_maps"
        | "walk_in"
        | "other"
      purchase_status: "pending" | "received"
      stock_movement_type: "in" | "out" | "waste" | "adjustment"
      user_role: "superadmin" | "admin" | "seller"
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
      appointment_status: [
        "scheduled",
        "scheduled_deposit_pending",
        "scheduled_deposit_verified",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      deposit_status: ["pending", "verified", "rejected"],
      payment_method: ["cash", "transfer", "card", "other"],
      payment_source_type: [
        "recommendation",
        "instagram",
        "google_maps",
        "walk_in",
        "other",
      ],
      purchase_status: ["pending", "received"],
      stock_movement_type: ["in", "out", "waste", "adjustment"],
      user_role: ["superadmin", "admin", "seller"],
    },
  },
} as const
