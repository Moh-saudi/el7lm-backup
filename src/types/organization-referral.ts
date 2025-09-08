import { DateOrTimestamp } from './common';

// نظام إحالة المنظمات
export interface OrganizationReferral {
  id: string;
  organizationId: string;
  organizationType: 'club' | 'academy' | 'trainer' | 'agent';
  organizationName: string;
  organizationEmail?: string;
  referralCode: string;
  inviteLink: string;
  description?: string;
  isActive: boolean;
  maxUsage?: number; // عدد مرات الاستخدام المسموح (اختياري)
  currentUsage: number;
  createdAt: DateOrTimestamp;
  updatedAt: DateOrTimestamp;
  expiresAt?: DateOrTimestamp; // تاريخ انتهاء الصلاحية (اختياري)
}

// طلبات انضمام اللاعبين
export interface PlayerJoinRequest {
  id: string;
  playerId: string;
  playerName: string;
  playerEmail: string;
  playerPhone?: string;
  organizationId: string;
  organizationType: 'club' | 'academy' | 'trainer' | 'agent';
  organizationName: string;
  referralCode: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requestedAt: DateOrTimestamp;
  processedAt?: DateOrTimestamp;
  processedBy?: string;
  notes?: string;
  playerData?: {
    position?: string;
    age?: number;
    nationality?: string;
    experience?: string;
  };
}

// إشعارات طلبات الانضمام
export interface JoinRequestNotification {
  id: string;
  organizationId: string;
  organizationType: string;
  requestId: string;
  playerId: string;
  playerName: string;
  type: 'new_join_request' | 'request_approved' | 'request_rejected';
  message: string;
  isRead: boolean;
  createdAt: DateOrTimestamp;
}

// إحصائيات المنظمة
export interface OrganizationStats {
  organizationId: string;
  totalPlayers: number;
  pendingRequests: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  activeReferralCodes: number;
  mostUsedReferralCode?: string;
  lastUpdated: DateOrTimestamp;
}


