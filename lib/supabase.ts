import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          role: "client" | "caregiver" | "admin"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          role?: "client" | "caregiver" | "admin"
          avatar_url?: string | null
        }
        Update: {
          first_name?: string
          last_name?: string
          phone?: string | null
          avatar_url?: string | null
        }
      }
      client_profiles: {
        Row: {
          id: string
          user_id: string
          address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_conditions: string[] | null
          special_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_conditions?: string[] | null
          special_instructions?: string | null
        }
        Update: {
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_conditions?: string[] | null
          special_instructions?: string | null
        }
      }
      caregiver_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          experience_years: number | null
          hourly_rate: number | null
          service_radius: number | null
          zip_code: string | null
          status: "pending_approval" | "approved" | "suspended" | "rejected"
          rating: number
          total_reviews: number
          total_jobs_completed: number
          background_check_verified: boolean
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          bio?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          service_radius?: number | null
          zip_code?: string | null
          status?: "pending_approval" | "approved" | "suspended" | "rejected"
        }
        Update: {
          bio?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          service_radius?: number | null
          zip_code?: string | null
          is_available?: boolean
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          base_price: number
          created_at: string
        }
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          caregiver_id: string
          service_date: string
          start_time: string
          end_time: string
          duration_hours: number
          total_amount: number
          status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
          service_address: string
          special_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          client_id: string
          caregiver_id: string
          service_date: string
          start_time: string
          end_time: string
          duration_hours: number
          total_amount: number
          service_address: string
          special_instructions?: string | null
        }
      }
    }
  }
}
