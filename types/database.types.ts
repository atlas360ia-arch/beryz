// Types générés depuis la base de données Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      seller_profiles: {
        Row: {
          id: string
          user_id: string
          business_name: string | null
          description: string | null
          avatar_url: string | null
          phone: string | null
          city: string | null
          rating: number
          verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name?: string | null
          description?: string | null
          avatar_url?: string | null
          phone?: string | null
          city?: string | null
          rating?: number
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string | null
          description?: string | null
          avatar_url?: string | null
          phone?: string | null
          city?: string | null
          rating?: number
          verified?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          description?: string | null
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category_id: string
          price: number | null
          currency: string
          location_city: string
          images: Json | null
          status: string
          views_count: number
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category_id: string
          price?: number | null
          currency?: string
          location_city: string
          images?: Json | null
          status?: string
          views_count?: number
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category_id?: string
          price?: number | null
          currency?: string
          location_city?: string
          images?: Json | null
          status?: string
          views_count?: number
          created_at?: string
          expires_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          listing_id: string | null
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          listing_id?: string | null
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          listing_id?: string | null
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          listing_id: string
          reported_by: string
          reason: string
          description: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          reported_by: string
          reason: string
          description?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          reported_by?: string
          reason?: string
          description?: string | null
          status?: string
          created_at?: string
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_id: string | null
          target_type: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_id?: string | null
          target_type?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_id?: string | null
          target_type?: string | null
          description?: string | null
          created_at?: string
        }
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
  }
}
