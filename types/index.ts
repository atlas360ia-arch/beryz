import { Database } from './database.types'

// Types extraits de la database
export type SellerProfile = Database['public']['Tables']['seller_profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type AdminLog = Database['public']['Tables']['admin_logs']['Row']

// Types pour les inserts
export type NewSellerProfile = Database['public']['Tables']['seller_profiles']['Insert']
export type NewListing = Database['public']['Tables']['listings']['Insert']
export type NewMessage = Database['public']['Tables']['messages']['Insert']
export type NewReport = Database['public']['Tables']['reports']['Insert']

// Types étendus pour l'application
export interface ListingWithDetails extends Listing {
  category?: Category
  seller_profile?: SellerProfile
  is_favorite?: boolean
}

export interface ConversationWithDetails {
  id: string
  other_user: {
    id: string
    email: string
    seller_profile?: SellerProfile
  }
  listing?: Listing
  last_message: Message
  unread_count: number
}

// Enums
export type ListingStatus = 'draft' | 'published' | 'expired' | 'deleted'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type UserRole = 'user' | 'admin'

// Types pour les formulaires
export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  business_name?: string
}

export interface ListingFormData {
  title: string
  description: string
  category_id: string
  price?: number
  location_city: string
  images?: File[]
}
