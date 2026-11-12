export type TripMemberRole = 'owner' | 'editor' | 'viewer';
export type InviteStatus = 'active' | 'pending';
export type ItineraryItemType = 'destination' | 'transit' | 'meal' | 'stay';
export type ItineraryItemStatus = 'scheduled' | 'wishlist' | 'completed';
export type ExpenseCategory = 'transport' | 'lodging' | 'food' | 'tickets' | 'shopping' | 'other';
export type SplitType = 'equal' | 'exact' | 'percentage';
export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'SETTLE';

export type JawaTengahCluster =
  | 'Semarang'
  | 'Dieng'
  | 'Magelang'
  | 'Solo'
  | 'Yogyakarta'
  | 'Karimunjawa';

export type TravelVibe = 'alam' | 'kuliner' | 'heritage' | 'relax';
export type TripPace = 'santai' | 'seimbang' | 'padat';
export type PrimaryTransport =
  | 'mobil_pribadi'
  | 'rental_mobil'
  | 'kereta_sewa'
  | 'umum_travel'
  | 'motor_touring'
  | 'kapal_laut'
  | 'pesawat';

export interface BudgetInclusionConfig {
  originCity?: string;             // Kota Asal, e.g. "Pontianak", "Jakarta", "Surabaya", "Balikpapan"
  originProvince?: string;         // Provinsi Asal, e.g. "Kalimantan Barat"
  destinationProvince?: string;    // Provinsi Tujuan, e.g. "Jawa Tengah"
  transportSubtype?: 'dlu' | 'pelni' | 'flight_regular' | 'flight_transit' | 'kai' | 'private_car' | 'bus';
  oneWayFarePerPerson?: number;    // Tarif tiket sekali jalan per orang (contoh: Rp 585.000 DLU)
  returnTicketFarePerPerson?: number; // Tarif tiket PP per orang (contoh: Rp 1.170.000)
  includesReturnTicket: boolean;   // Apakah sudah termasuk tiket PP / Tol-BBM PP?
  returnTicketEstimate: number;    // Total grup estimasi biaya tiket PP / BBM PP grup
  includesLodging: boolean;        // Apakah sudah termasuk penginapan?
  includesEntranceTickets: boolean;// Apakah sudah termasuk tiket wisata?
  includesEmergencyFund: boolean;  // Apakah sudah termasuk dana darurat / oleh-oleh?
  vehicleDetails: string;          // Contoh: "Kapal DLU KM Dharma Ferry II PP (Pontianak - Semarang)"
  participantCount: number;        // 1 s/d 4 orang
}

export interface OnboardingAnswers {
  clusters: JawaTengahCluster[];
  vibe: TravelVibe;
  pace: TripPace;
  transport: PrimaryTransport;
  vibeScores: {
    alam: number;
    kuliner: number;
    heritage: number;
    relax: number;
  };
  categoryBudgetPlan: Record<ExpenseCategory, number>;
  budgetInclusion?: BudgetInclusionConfig;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bank_info?: string;
  created_at: string;
}

export interface Trip {
  id: string;
  owner_id: string;
  title: string;
  region: string;
  origin_city?: string;
  start_date: string;
  end_date: string;
  total_budget_plan: number; // integer IDR (BIGINT in PostgreSQL)
  onboarding_answers: OnboardingAnswers;
  created_at: string;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string | null;
  invited_email: string;
  display_name: string;
  role: TripMemberRole;
  invite_status: InviteStatus;
  personal_budget: number; // Budget yang dibawa masing-masing orang (IDR)
  bank_info?: string;
  avatar_color?: string;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  day_number: number;
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  item_type: ItineraryItemType;
  title: string;
  location_name: string;
  city_cluster: JawaTengahCluster;
  estimated_cost: number; // integer IDR
  transit_mode?: string;
  transit_duration_mins?: number;
  notes?: string;
  status: ItineraryItemStatus;
  is_locked: boolean;
  created_by: string;
  created_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  share_amount: number; // integer IDR
  percentage?: number;
  is_settled: boolean;
}

export interface Expense {
  id: string;
  trip_id: string;
  itinerary_item_id: string | null;
  title: string;
  category: ExpenseCategory;
  amount: number; // integer IDR
  paid_by_member_id: string;
  split_type: SplitType;
  splits: ExpenseSplit[];
  incurred_at: string; // YYYY-MM-DD
  day_number?: number; // Hari ke-1, ke-2, dst untuk grafik garis harian
  created_by_member_id: string;
  updated_at: string;
}

export interface Settlement {
  id: string;
  trip_id: string;
  from_member_id: string;
  to_member_id: string;
  amount: number; // integer IDR
  settled_at: string;
  notes?: string;
}

export interface ExpenseAuditLog {
  id: string;
  trip_id: string;
  expense_id: string | null;
  actor_email: string;
  actor_name: string;
  action: AuditActionType;
  summary: string;
  previous_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}
