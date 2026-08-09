/* ── Shared API response envelope ── */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { page: number; per_page: number; total: number; total_pages: number } | null;
}

/* ── Project ── */
export interface Plant {
  id: string;
  common_name: string;
  scientific_name?: string;
  category: string;
  growth_duration_days: number;
  local_name?: string;
  description?: string;
  image_url?: string;
}

export interface PlantStage {
  id: string;
  plant_id: string;
  stage_name: string;
  stage_order: number;
  start_day: number;
  end_day: number;
}

export interface Project {
  id: string;
  farmer_id: string;
  plant_id: string;
  location_id: string;
  land_detail_id?: string;
  name: string;
  area: number;
  area_unit: string;
  farming_method: string;
  planting_date: string;
  status: string;
  current_stage_id?: string;
  plan_generation_status: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
}

/* ── Activity ── */
export interface Activity {
  id: string;
  plan_id: string;
  activity_type: string;
  title: string;
  description?: string;
  planned_date: string;
  due_date: string;
  status: string;
  completed_at?: string;
  is_ai_recommended: boolean;
  ai_reasoning?: string;
}

/* ── Disease ── */
export interface DiseaseSearch {
  id: string;
  plant_id: string;
  name: string;
  scientific_name?: string;
  description?: string;
  symptoms: string[];
  severity: string;
  image_url?: string;
}

export interface DiseaseSolution {
  id: string;
  farming_method: string;
  solution_type: string;
  treatment_name: string;
  dosage: string;
  instructions: string;
}

export interface Issue {
  id: string;
  project_id: string;
  issue_type: string;
  title: string;
  description?: string;
  severity: string;
  reported_date: string;
  status: string;
  resolved_date?: string;
  images?: string[];
  ai_diagnosis?: string;
  identified_disease_id?: string;
  is_shared_to_community?: boolean;
}

/* ── Weather ── */
export interface WeatherCondition {
  temp_celsius: number;
  humidity: number;
  rain_mm: number;
  wind_kph: number;
  description: string;
  icon_code: string;
}

export interface ForecastDay {
  forecast_date: string;
  condition: WeatherCondition;
}

export interface WeatherResponse {
  location_id: string;
  current: WeatherCondition;
  forecast: ForecastDay[];
}

/* ── Farming Method ── */
export interface FarmingMethod {
  id: string;
  name: string;
  description: string;
}

/* ── Location ── */
export interface Location {
  id: string;
  farmer_id: string;
  name: string;
  district: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  is_primary: boolean;
}

/* ── Land Detail ── */
export interface LandDetail {
  id: string;
  location_id: string;
  total_area: number;
  area_unit: string;
  soil_type?: string;
  irrigation_type?: string;
}

/* ── Community ── */
export interface CommentAuthor {
  id: string;
  full_name: string;
  avatar_url?: string;
}

export interface CommunityComment {
  id: string;
  issue_id: string;
  parent_id: string | null;
  author: CommentAuthor;
  body: string;
  images?: string[];
  created_at: string;
  replies: CommunityComment[];
}

export interface CommunityFeedItem {
  id: string;
  title: string;
  issue_type: string;
  severity: string;
  status: string;
  images?: string[];
  author_name: string;
  author_avatar_url?: string;
  plant_name?: string;
  created_at: string;
  comment_count: number;
}

/* ── Transaction ── */
export interface TransactionProduct {
  id: string;
  title: string;
  unit: string;
  images?: string[];
  status: string;
}

export interface TransactionParty {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

export interface TransactionReview {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name?: string;
  reviewee_name?: string;
}

export interface Transaction {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  status: string;
  notes?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  product?: TransactionProduct;
  seller_info?: TransactionParty;
  buyer_info?: TransactionParty;
  reviews?: TransactionReview[];
}

export interface TransactionSummary {
  total_sales: number;
  total_purchases: number;
  net_balance: number;
  sales_count: number;
  purchases_count: number;
  pending_count: number;
}
