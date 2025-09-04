// Employee Management Types
import { 
  BaseEntity, 
  DateOrTimestamp,
  Address,
  ContactInfo,
  MediaFile
} from './common';

// أنواع الوظائف المتاحة
export type EmployeeRole = 
  | 'support' // موظف دعم فني
  | 'finance' // موظف مالية
  | 'sales' // مندوب مبيعات
  | 'content' // محرر محتوى
  | 'admin' // مدير نظام
  | 'supervisor'; // مشرف

// صلاحيات كل وظيفة
export interface RolePermissions {
  canViewUsers: boolean; // عرض المستخدمين
  canEditUsers: boolean; // تعديل بيانات المستخدمين
  canViewFinancials: boolean; // عرض التقارير المالية
  canManagePayments: boolean; // إدارة المدفوعات
  canViewReports: boolean; // عرض التقارير
  canManageContent: boolean; // إدارة المحتوى
  canManageEmployees: boolean; // إدارة الموظفين
  canViewSupport: boolean; // عرض تذاكر الدعم
  canManageSupport: boolean; // إدارة تذاكر الدعم
  allowedLocations: EmployeeLocation[]; // المناطق المسموح بها
}

// بيانات الموقع الجغرافي
export interface EmployeeLocation {
  countryId: string;
  countryName: string;
  cityId: string;
  cityName: string;
}

// بيانات الموظف
export interface Employee extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  permissions: RolePermissions;
  isActive: boolean;
  lastLoginAt?: DateOrTimestamp;
  department?: string; // القسم
  supervisor?: string; // المشرف المباشر
  avatar?: MediaFile; // الصورة الشخصية
  authUserId?: string; // معرف حساب المصادقة
  deactivatedAt?: DateOrTimestamp; // تاريخ تعطيل الحساب
  deactivationReason?: string; // سبب تعطيل الحساب
  locations: EmployeeLocation[]; // المناطق الجغرافية التي يعمل بها الموظف
  contactInfo?: ContactInfo;
  address?: Address;
}

// إحصائيات أداء الموظف
export interface EmployeeStats {
  totalTickets?: number; // عدد التذاكر (للدعم الفني)
  resolvedTickets?: number; // التذاكر المحلولة
  totalSales?: number; // إجمالي المبيعات
  activeClients?: number; // العملاء النشطين
  reportsGenerated?: number; // التقارير المستخرجة
  lastActivity?: DateOrTimestamp; // آخر نشاط
}

// حالة الموظف في النظام
export interface EmployeeStatus {
  isOnline: boolean;
  lastSeen?: DateOrTimestamp;
  currentTask?: string;
  workingHours?: {
    start: string;
    end: string;
  };
}

// تذاكر الدعم الفني
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  assignedTo?: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'account' | 'general';
  createdAt: DateOrTimestamp;
  updatedAt?: DateOrTimestamp;
  resolvedAt?: DateOrTimestamp;
  resolution?: string;
  attachments?: MediaFile[];
}

// تقارير الموظفين
export interface EmployeeReport {
  id: string;
  employeeId: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  period: {
    start: DateOrTimestamp;
    end: DateOrTimestamp;
  };
  stats: EmployeeStats;
  notes?: string;
  generatedAt: DateOrTimestamp;
  generatedBy: string;
}

// إعدادات الموظف
export interface EmployeeSettings {
  id: string;
  employeeId: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  workingHours: {
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: { start: string; end: string };
  };
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

// سجل نشاط الموظف
export interface EmployeeActivity {
  id: string;
  employeeId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: DateOrTimestamp;
}

// إشعارات الموظفين
export interface EmployeeNotification {
  id: string;
  employeeId: string;
  type: 'system' | 'task' | 'alert' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: DateOrTimestamp;
  actionUrl?: string;
  expiresAt?: DateOrTimestamp;
} 
