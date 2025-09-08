import { 
  BaseEntity, 
  DateOrTimestamp,
  MediaFile,
  Address,
  ContactInfo,
  PhoneNumber,
  EmailAddress
} from './common';

export interface PlayerFormData {
  full_name: string;
  birth_date?: DateOrTimestamp;
  age?: number;
  nationality: string;
  city: string;
  country: string;
  phone: string;
  whatsapp: string;
  email: string;
  brief: string;
  education_level: string;
  graduation_year: string;
  degree: string;
  english_level: string;
  arabic_level: string;
  spanish_level: string;
  blood_type: string;
  height: string;
  weight: string;
  chronic_conditions: boolean;
  chronic_details: string;
  injuries: Injury[];
  surgeries: Surgery[];
  allergies: string;
  medical_notes: string;
  primary_position: string;
  secondary_position: string;
  preferred_foot: string;
  club_history: ClubHistory[];
  experience_years: string;
  sports_notes?: string;
  technical_skills?: Record<string, number>;
  physical_skills?: Record<string, number>;
  social_skills?: Record<string, number>;
  objectives?: PlayerObjectives;
  profile_image?: string;
  additional_images: Image[];
  videos: Video[];
  video_urls?: string[];
  training_courses?: string[];
  has_passport: 'yes' | 'no';
  ref_source: string;
  contract_history?: ContractHistory[];
  agent_history?: AgentHistory[];
  official_contact?: OfficialContact;
  currently_contracted: 'yes' | 'no';
  achievements: Achievement[];
  medical_history?: MedicalHistory;
  current_club: string;
  previous_clubs: string[];
  documents?: Document[];
  updated_at: DateOrTimestamp;
  subscription_end?: DateOrTimestamp;
  profile_image_url?: string;
  subscription_status: string;
  subscription_type: string;
  address?: string;
  player_number?: string;
  favorite_jersey_number?: string;
}

export interface PlayerObjectives {
  professional: boolean;
  trials: boolean;
  local_leagues: boolean;
  arab_leagues: boolean;
  european_leagues: boolean;
  training: boolean;
  other: string;
}

export interface OfficialContact {
  name: string;
  title: string;
  phone: string;
  email: string;
}

export interface MedicalHistory {
  blood_type: string;
  chronic_conditions: string[];
  allergies: string[];
  injuries: Injury[];
  last_checkup: string;
}

export interface Injury {
  type: string;
  date: string;
  status?: string;
  recovery_status?: string;
}

export interface Surgery {
  type: string;
  date: string;
}

export interface ClubHistory {
  name: string;
  from: string;
  to: string;
}

export interface ContractHistory {
  club: string;
  from: string;
  to: string;
  role: string;
}

export interface AgentHistory {
  agent: string;
  from: string;
  to: string;
}

export interface Document {
  type: string;
  url: string;
  name: string;
}

export interface Image {
  url: string;
  name?: string;
  caption?: string; // إضافة caption للصور
}

export interface Video {
  url: string;
  desc?: string;
}

export interface Achievement {
  title: string;
  date: string;
  description?: string;
}

export interface Player extends BaseEntity, PlayerFormData {
  name?: string; // حقل بديل للـ full_name للتوافق مع البيانات القديمة
  position?: string; // موقع بديل للـ primary_position
  organizationId?: string;
  organizationType?: string;
  organizationName?: string;
  // حقول جديدة لربط المنظمات
  joinRequestId?: string;
  joinRequestStatus?: 'pending' | 'approved' | 'rejected';
  joinedViaReferral?: boolean;
  referralCodeUsed?: string;
  organizationJoinedAt?: DateOrTimestamp;
  organizationApprovedBy?: {
    userId: string;
    userName?: string;
    approvedAt: DateOrTimestamp;
  };
  addedBy?: {
    accountType: string;
    accountId: string;
    accountName: string;
    dateAdded: DateOrTimestamp;
  };
  // Legacy field names for backward compatibility
  created_at?: DateOrTimestamp;
  updated_at?: DateOrTimestamp;
  
  // Additional properties for PlayersSearchPage
  displayName?: string;
  accountType?: string;
  organizationInfo?: string;
  avatar?: string;
  club_id?: string;
  clubId?: string;
  academy_id?: string;
  academyId?: string;
  trainer_id?: string;
  trainerId?: string;
  agent_id?: string;
  agentId?: string;
  convertedToAccount?: boolean;
  firebaseUid?: string;
  club_name?: string;
  bio?: string;
  description?: string;
  age_category?: string;
  status?: string;
  skill_level?: string;
  objectives?: PlayerObjectives | string[] | Record<string, any>; // يمكن أن يكون PlayerObjectives أو string[] أو object
}

// Player search and filter types
export interface PlayerSearchFilters {
  name?: string;
  position?: string;
  nationality?: string;
  country?: string;
  city?: string;
  ageRange?: {
    min: number;
    max: number;
  };
  experienceRange?: {
    min: number;
    max: number;
  };
  subscriptionStatus?: string;
  organizationType?: string;
}

export interface PlayerSearchResult {
  player: Player;
  relevanceScore: number;
  matchDetails: {
    nameMatch: boolean;
    positionMatch: boolean;
    locationMatch: boolean;
    ageMatch: boolean;
  };
}

// Player statistics
export interface PlayerStats {
  totalViews: number;
  profileCompleteness: number;
  lastUpdated: DateOrTimestamp;
  subscriptionDaysRemaining: number;
  contactRequests: number;
  messagesReceived: number;
}

// Player organization info
export interface PlayerOrganizationInfo {
  organizationId: string;
  organizationType: string;
  organizationName: string;
  addedBy: {
    accountType: string;
    accountId: string;
    accountName: string;
    dateAdded: DateOrTimestamp;
  };
  isIndependent: boolean;
}

// Player login account info
export interface PlayerLoginAccount {
  email: string;
  phone: string;
  password: string;
  accountType: string;
  organizationId?: string;
  organizationType?: string;
  organizationName?: string;
}
