/** Types mirroring the API response schemas. */

export interface Page<T> {
  items: T[]
  total: number
  page: number
  pages: number
  page_size: number
}

export interface Property {
  id: number
  slug: string
  reference: string
  title: string
  excerpt: string
  description: string
  property_type: string
  transaction_type: 'buy' | 'rent'
  listing_status: 'available' | 'under_offer' | 'rented' | 'sold' | 'withdrawn'
  price: number | null
  currency: string
  price_period: string | null
  location: string
  address: string | null
  latitude: number | null
  longitude: number | null
  area_sqm: number | null
  bedrooms: number | null
  bathrooms: number | null
  furnished: string | null
  amenities: string[]
  images: string[]
  floor_plans: { label: string; url: string }[]
  documents: { label: string; url: string }[]
  featured: boolean
  is_demo: boolean
  project_id: number | null
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  slug: string
  title: string
  tagline: string
  overview: string
  description: string
  design_concept: string
  category: string
  location: string
  status: string
  hero_image: string | null
  gallery: string[]
  highlights: string[]
  sustainability: string[]
  amenities: string[]
  specifications: { label: string; value: string }[]
  services: string[]
  price_from: number | null
  currency: string
  total_area_sqm: number | null
  unit_count: number | null
  bedrooms_range: string | null
  completion_date: string | null
  developer: string | null
  architect: string | null
  availability_note: string | null
  featured: boolean
  published: boolean
  is_demo: boolean
  display_order: number
  seo_title: string | null
  seo_description: string | null
}

export interface Service {
  id: number
  slug: string
  title: string
  summary: string
  description: string
  icon: string
  image: string | null
  deliverables: string[]
  process: { step: string; title: string; copy: string }[]
  related_project_slugs: string[]
  published: boolean
  display_order: number
}

export interface ArticleSummary {
  id: number
  slug: string
  title: string
  excerpt: string
  cover_image: string | null
  category: string
  author: string
  published_at: string | null
  reading_minutes: number
}

export interface Article extends ArticleSummary {
  content: string
  status: 'draft' | 'published' | 'archived'
  is_demo: boolean
  seo_title: string | null
  seo_description: string | null
}

export interface Faq {
  id: number
  question: string
  answer: string
  display_order: number
  published: boolean
}

export interface GalleryImage {
  id: number
  image: string
  title: string
  caption: string
  credit: string
  category: string
  project_id: number | null
  display_order: number
  published: boolean
}

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  company: string | null
  role: 'admin' | 'editor' | 'customer'
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface Submission {
  id: number
  status: string
  message: string
}

export interface Inquiry {
  id: number
  name: string
  email: string
  phone: string | null
  company?: string | null
  inquiry_type: string
  message: string
  source?: string
  property_reference: string | null
  project_title: string | null
  status: string
  internal_notes?: string
  assigned_to?: string | null
  property_id?: number | null
  project_id?: number | null
  created_at: string
  updated_at?: string
}

export interface ConsultationRequest {
  id: number
  name: string
  email: string
  phone?: string | null
  company?: string | null
  inquiry_type: string
  preferred_date: string | null
  preferred_time: string | null
  timezone?: string | null
  project_location?: string | null
  budget?: string | null
  description?: string
  status: 'pending_confirmation' | 'confirmed' | 'completed' | 'cancelled'
  internal_notes?: string
  created_at: string
  updated_at?: string
}

export interface PropertyFacets {
  types: string[]
  locations: string[]
  statuses: string[]
  transaction_types: string[]
  min_price: number | null
  max_price: number | null
  max_area: number | null
}

export interface ProjectFacets {
  categories: string[]
  locations: string[]
  statuses: string[]
}

export interface NavLink {
  label: string
  to: string
}

export interface SiteSettings {
  brand: { name: string; tagline: string; legal_name?: string; disclosure?: string }
  contact: { email: string; phone: string; address: string; hours?: string; map_note?: string }
  social: Record<string, string>
  locale: { currency: string; timezone: string }
  navigation: NavLink[]
  footer: {
    statement: string
    columns: { title: string; links: NavLink[] }[]
  }
  seo: { title_suffix: string; default_description: string }
  press: { enabled: boolean; note?: string; publications: string[] }
  hero: {
    eyebrow: string
    headline: string
    description: string
    image: string
    side_label: string[]
    features: { title: string; copy: string; icon: string }[]
  }
  stats: { note?: string; items: { value: string; label: string }[]; image?: string }
  process: { step: string; title: string; copy: string }[]
  philosophy: { quote: string; attribution: string; image: string }
}

export interface AdminStats {
  properties_total: number
  properties_available: number
  properties_sold_or_rented: number
  projects_total: number
  projects_published: number
  inquiries_total: number
  inquiries_new: number
  consultations_pending: number
  articles_published: number
  articles_draft: number
  registered_users: number
}

export interface AdminOverview {
  recent_inquiries: Inquiry[]
  recent_properties: { id: number; title: string; slug: string; status: string; updated_at: string }[]
  listing_status_summary: { status: string; count: number }[]
}

export interface Meta {
  inquiry_types: string[]
  property_types: string[]
  project_categories: string[]
  project_statuses: string[]
  listing_statuses: string[]
  demo_notice: string
}
