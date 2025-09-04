export type DreamAcademyCategoryId =
  | 'english'
  | 'french'
  | 'spanish'
  | 'portuguese'
  | 'skills'
  | 'life_skills'
  | 'living_skills'
  | 'life_coach'
  | 'tactics'
  | 'therapeutic_nutrition'
  | 'physical_preparation';

export interface DreamAcademyCategory {
  id: DreamAcademyCategoryId;
  title: string; // fallback/display title
  titleAr?: string; // Arabic title
  titleEn?: string; // English title
  group?: 'languages' | 'life_skills' | 'living_skills' | 'career' | 'other';
  color?: string; // hex/tailwind class hint
  // Base price in USD; will be converted at runtime using currency-rates
  basePriceUSD: number;
  currency?: string; // default currency label for display/pricing (e.g., 'USD')
  allowedPaymentMethods: Array<'wallet' | 'geidea'>;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface DreamAcademySource {
  id?: string;
  provider: 'youtube';
  sourceType: 'video' | 'playlist';
  url: string;
  // Extracted identifiers for faster rendering
  videoId?: string;
  playlistId?: string;
  title?: string; // admin-provided title override
  resolvedTitle?: string;
  resolvedDescription?: string;
  durationSec?: number; // for videos
  itemCount?: number; // for playlists
  channelTitle?: string;
  thumbnailUrl?: string;
  categoryId: DreamAcademyCategoryId;
  order?: number;
  isActive: boolean;
  createdAt?: any;
  createdBy?: string;
}

export interface PrivateSessionRequest {
  id?: string;
  userId?: string | null;
  name: string;
  whatsapp: string;
  categoryId: DreamAcademyCategoryId;
  durationMinutes: number;
  notes?: string;
  currency: string; // selected currency, e.g., 'USD', 'EGP', ...
  amount: number; // amount in selected currency
  amountEGP?: number; // computed EGP amount for Geidea or reporting
  paymentMethod: 'wallet' | 'geidea';
  paymentStatus: 'pending_review' | 'paid' | 'failed';
  gatewayRef?: string;
  receiptUrl?: string;
  createdAt?: any;
}

export interface DreamAcademyStats {
  views: number;
  likes: number;
}


