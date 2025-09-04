// نظام التصدير المتقدم للأدمن
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  dataType: 'users' | 'payments' | 'financial' | 'system' | 'comprehensive';
  fileName?: string;
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
    type?: string;
    country?: string;
  };
  includeCharts?: boolean;
  language?: 'ar' | 'en';
  compression?: boolean;
}

export interface ScheduledReport {
  id?: string;
  name: string;
  description: string;
  config: ExportConfig;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string; // HH:MM format
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    enabled: boolean;
  };
  recipients: string[]; // email addresses
  createdBy: string;
  lastRun?: Timestamp;
  nextRun?: Timestamp;
  isActive: boolean;
}

export interface ExportData {
  users?: any[];
  payments?: any[];
  statistics?: any;
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    totalRecords: number;
    filters: any;
  };
}

class AdminExportManager {
  private static instance: AdminExportManager;

  static getInstance(): AdminExportManager {
    if (!AdminExportManager.instance) {
      AdminExportManager.instance = new AdminExportManager();
    }
    return AdminExportManager.instance;
  }

  // تصدير البيانات الشامل
  async exportData(config: ExportConfig, adminId: string): Promise<Blob> {
    try {
      console.log(`🔄 [Export] بدء تصدير البيانات بتنسيق ${config.format}`);
      
      const data = await this.collectData(config);
      
      switch (config.format) {
        case 'pdf':
          return await this.generatePDF(data, config);
        case 'excel':
          return await this.generateExcel(data, config);
        case 'csv':
          return await this.generateCSV(data, config);
        case 'json':
          return await this.generateJSON(data, config);
        default:
          throw new Error(`نوع التصدير غير مدعوم: ${config.format}`);
      }
    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error);
      throw error;
    }
  }

  // جمع البيانات حسب النوع
  private async collectData(config: ExportConfig): Promise<ExportData> {
    const data: ExportData = {
      metadata: {
        exportedAt: new Date(),
        exportedBy: 'admin',
        totalRecords: 0,
        filters: config.filters || {}
      }
    };

    try {
      switch (config.dataType) {
        case 'users':
          data.users = await this.getUsersData(config.filters);
          data.metadata.totalRecords = data.users.length;
          break;
          
        case 'payments':
          data.payments = await this.getPaymentsData(config.filters);
          data.metadata.totalRecords = data.payments.length;
          break;
          
        case 'financial':
          data.payments = await this.getPaymentsData(config.filters);
          data.statistics = await this.getFinancialStats(config.filters);
          data.metadata.totalRecords = data.payments.length;
          break;
          
        case 'comprehensive':
          data.users = await this.getUsersData(config.filters);
          data.payments = await this.getPaymentsData(config.filters);
          data.statistics = await this.getSystemStats();
          data.metadata.totalRecords = (data.users?.length || 0) + (data.payments?.length || 0);
          break;
          
        case 'system':
          data.statistics = await this.getSystemStats();
          data.metadata.totalRecords = 1;
          break;
      }
      
      console.log(`✅ [Export] تم جمع ${data.metadata.totalRecords} سجل`);
      return data;
    } catch (error) {
      console.error('خطأ في جمع البيانات:', error);
      throw error;
    }
  }

  // جلب بيانات المستخدمين
  private async getUsersData(filters?: any): Promise<any[]> {
    try {
      const users: any[] = [];
      const collections = ['users', 'players', 'clubs', 'academies', 'trainers', 'agents'];
      
      for (const collectionName of collections) {
        let q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
        
        // تطبيق فلاتر التاريخ
        if (filters?.dateFrom) {
          q = query(q, where('createdAt', '>=', Timestamp.fromDate(filters.dateFrom)));
        }
        if (filters?.dateTo) {
          q = query(q, where('createdAt', '<=', Timestamp.fromDate(filters.dateTo)));
        }
        
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
          const userData = doc.data();
          users.push({
            id: doc.id,
            type: collectionName,
            name: userData.name || userData.full_name,
            email: userData.email,
            phone: userData.phone,
            country: userData.country,
            city: userData.city,
            accountType: userData.accountType || userData.role,
            isVerified: userData.isVerified || false,
            createdAt: userData.createdAt?.toDate?.() || new Date(),
            ...userData
          });
        });
      }
      
      return users;
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدمين:', error);
      return [];
    }
  }

  // جلب بيانات المدفوعات
  private async getPaymentsData(filters?: any): Promise<any[]> {
    try {
      let q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      
      // تطبيق الفلاتر
      if (filters?.dateFrom) {
        q = query(q, where('createdAt', '>=', Timestamp.fromDate(filters.dateFrom)));
      }
      if (filters?.dateTo) {
        q = query(q, where('createdAt', '<=', Timestamp.fromDate(filters.dateTo)));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      // إضافة بيانات من localStorage إذا متوفرة
      const localPayments = this.getLocalStoragePayments();
      return [...payments, ...localPayments];
    } catch (error) {
      console.error('خطأ في جلب بيانات المدفوعات:', error);
      return [];
    }
  }

  // جلب الإحصائيات المالية
  private async getFinancialStats(filters?: any): Promise<any> {
    try {
      const payments = await this.getPaymentsData(filters);
      
      const stats = {
        totalTransactions: payments.length,
        completedTransactions: payments.filter(p => p.status === 'completed').length,
        failedTransactions: payments.filter(p => p.status === 'failed').length,
        totalRevenue: payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + (p.amount || 0), 0),
        
        // تجميع حسب العملة
        byCurrency: this.groupByCurrency(payments),
        
        // تجميع حسب طريقة الدفع
        byPaymentMethod: this.groupByPaymentMethod(payments),
        
        // إحصائيات يومية
        dailyStats: this.getDailyStats(payments),
        
        // أعلى المستخدمين دفعاً
        topPayers: this.getTopPayers(payments)
      };
      
      return stats;
    } catch (error) {
      console.error('خطأ في حساب الإحصائيات المالية:', error);
      return {};
    }
  }

  // جلب إحصائيات النظام
  private async getSystemStats(): Promise<any> {
    try {
      const collections = ['users', 'players', 'clubs', 'academies', 'trainers', 'agents', 'payments'];
      const stats: any = {
        collectionCounts: {},
        totalUsers: 0,
        systemHealth: 'healthy',
        lastUpdate: new Date()
      };

      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          stats.collectionCounts[collectionName] = snapshot.size;
          if (collectionName !== 'payments') {
            stats.totalUsers += snapshot.size;
          }
        } catch (error) {
          console.warn(`فشل في جلب ${collectionName}:`, error);
          stats.collectionCounts[collectionName] = 0;
        }
      }

      return stats;
    } catch (error) {
      console.error('خطأ في جلب إحصائيات النظام:', error);
      return {};
    }
  }

  // إنشاء ملف CSV (مبسط للتوافق)
  private async generateCSV(data: ExportData, config: ExportConfig): Promise<Blob> {
    try {
      let csvContent = '';
      
      // تحديد البيانات المراد تصديرها
      let exportData: any[] = [];
      
      if (data.users && data.users.length > 0) {
        exportData = data.users;
      } else if (data.payments && data.payments.length > 0) {
        exportData = data.payments;
      }
      
      if (exportData.length > 0) {
        // عناوين الأعمدة
        const headers = Object.keys(exportData[0]);
        csvContent += headers.join(',') + '\n';
        
        // البيانات
        exportData.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value).replace(/,/g, ';'); // استبدال الفواصل
          });
          csvContent += values.join(',') + '\n';
        });
      }
      
      // إضافة BOM للدعم العربي
      const csvWithBOM = '\ufeff' + csvContent;
      return new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
      console.error('خطأ في إنشاء CSV:', error);
      throw error;
    }
  }

  // إنشاء ملف PDF (مبسط)
  private async generatePDF(data: ExportData, config: ExportConfig): Promise<Blob> {
    try {
      // PDF بسيط نصي
      let pdfContent = `تقرير ${this.getReportTitle(config.dataType, config.language || 'ar')}\n\n`;
      pdfContent += `تاريخ التصدير: ${data.metadata.exportedAt.toLocaleString('ar-EG')}\n`;
      pdfContent += `عدد السجلات: ${data.metadata.totalRecords}\n\n`;
      
      if (data.users) {
        pdfContent += `المستخدمين: ${data.users.length}\n`;
      }
      if (data.payments) {
        pdfContent += `المدفوعات: ${data.payments.length}\n`;
      }
      if (data.statistics) {
        pdfContent += `الإحصائيات: متوفرة\n`;
      }
      
      return new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      throw error;
    }
  }

  // إنشاء ملف Excel (مبسط)
  private async generateExcel(data: ExportData, config: ExportConfig): Promise<Blob> {
    try {
      // تحويل البيانات إلى تنسيق بسيط يشبه Excel
      let excelContent = `${this.getReportTitle(config.dataType, config.language || 'ar')}\n`;
      excelContent += `تاريخ التصدير: ${data.metadata.exportedAt.toLocaleString('ar-EG')}\n\n`;
      
      if (data.users && data.users.length > 0) {
        excelContent += 'المستخدمين:\n';
        excelContent += 'النوع\tالاسم\tالبريد\tالدولة\n';
        data.users.slice(0, 100).forEach(user => {
          excelContent += `${user.type || ''}\t${user.name || ''}\t${user.email || ''}\t${user.country || ''}\n`;
        });
        excelContent += '\n';
      }
      
      if (data.payments && data.payments.length > 0) {
        excelContent += 'المدفوعات:\n';
        excelContent += 'المبلغ\tالعملة\tالحالة\tالتاريخ\n';
        data.payments.slice(0, 100).forEach(payment => {
          excelContent += `${payment.amount || ''}\t${payment.currency || ''}\t${payment.status || ''}\t${payment.createdAt || ''}\n`;
        });
      }
      
      return new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    } catch (error) {
      console.error('خطأ في إنشاء Excel:', error);
      throw error;
    }
  }

  // إنشاء ملف JSON
  private async generateJSON(data: ExportData, config: ExportConfig): Promise<Blob> {
    try {
      const jsonData = {
        ...data,
        exportConfig: config,
        version: '1.0'
      };
      
      const jsonString = JSON.stringify(jsonData, null, 2);
      return new Blob([jsonString], { type: 'application/json' });
    } catch (error) {
      console.error('خطأ في إنشاء JSON:', error);
      throw error;
    }
  }

  // دوال مساعدة
  private getLocalStoragePayments(): any[] {
    try {
      const localData = localStorage.getItem('bulkPaymentHistory');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error('خطأ في قراءة بيانات localStorage:', error);
      return [];
    }
  }

  private groupByCurrency(payments: any[]): any {
    const grouped: { [key: string]: { count: number; total: number } } = {};
    
    payments.forEach(payment => {
      const currency = payment.currency || 'EGP';
      if (!grouped[currency]) {
        grouped[currency] = { count: 0, total: 0 };
      }
      grouped[currency].count++;
      grouped[currency].total += payment.amount || 0;
    });
    
    return grouped;
  }

  private groupByPaymentMethod(payments: any[]): any {
    const grouped: { [key: string]: number } = {};
    
    payments.forEach(payment => {
      const method = payment.paymentMethod || 'unknown';
      grouped[method] = (grouped[method] || 0) + 1;
    });
    
    return grouped;
  }

  private getDailyStats(payments: any[]): any[] {
    const dailyStats: { [key: string]: { count: number; revenue: number } } = {};
    
    payments.forEach(payment => {
      const date = payment.createdAt ? payment.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { count: 0, revenue: 0 };
      }
      dailyStats[date].count++;
      if (payment.status === 'completed') {
        dailyStats[date].revenue += payment.amount || 0;
      }
    });
    
    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats
    }));
  }

  private getTopPayers(payments: any[]): any[] {
    const payerStats: { [key: string]: { name: string; total: number; count: number } } = {};
    
    payments
      .filter(p => p.status === 'completed' && p.payerId)
      .forEach(payment => {
        const payerId = payment.payerId;
        if (!payerStats[payerId]) {
          payerStats[payerId] = { 
            name: payment.payerName || 'غير محدد', 
            total: 0, 
            count: 0 
          };
        }
        payerStats[payerId].total += payment.amount || 0;
        payerStats[payerId].count++;
      });
    
    return Object.entries(payerStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }

  private getReportTitle(dataType: string, language: string): string {
    const titles = {
      ar: {
        users: 'تقرير المستخدمين',
        payments: 'تقرير المدفوعات',
        financial: 'التقرير المالي',
        system: 'تقرير النظام',
        comprehensive: 'التقرير الشامل'
      },
      en: {
        users: 'Users Report',
        payments: 'Payments Report',
        financial: 'Financial Report',
        system: 'System Report',
        comprehensive: 'Comprehensive Report'
      }
    };
    
    return titles[language]?.[dataType] || 'تقرير عام';
  }

  // تنزيل الملف
  async downloadFile(blob: Blob, filename: string): Promise<void> {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`✅ [Export] تم تنزيل الملف: ${filename}`);
    } catch (error) {
      console.error('خطأ في تنزيل الملف:', error);
      throw error;
    }
  }
}

export const adminExportManager = AdminExportManager.getInstance();

// دوال مساعدة للاستخدام السريع
export const exportUsers = async (format: 'pdf' | 'excel' | 'csv' = 'excel', filters?: any) => {
  const config: ExportConfig = {
    format,
    dataType: 'users',
    fileName: `users_${format}_${new Date().toISOString().split('T')[0]}`,
    filters
  };
  
  const blob = await adminExportManager.exportData(config, 'admin');
  await adminExportManager.downloadFile(blob, `${config.fileName}.${format === 'excel' ? 'xls' : format}`);
};

export const exportPayments = async (format: 'pdf' | 'excel' | 'csv' = 'excel', filters?: any) => {
  const config: ExportConfig = {
    format,
    dataType: 'payments',
    fileName: `payments_${format}_${new Date().toISOString().split('T')[0]}`,
    filters
  };
  
  const blob = await adminExportManager.exportData(config, 'admin');
  await adminExportManager.downloadFile(blob, `${config.fileName}.${format === 'excel' ? 'xls' : format}`);
};

export const exportFinancialReport = async (format: 'pdf' | 'excel' = 'pdf', filters?: any) => {
  const config: ExportConfig = {
    format,
    dataType: 'financial',
    fileName: `financial_report_${new Date().toISOString().split('T')[0]}`,
    filters,
    includeCharts: true
  };
  
  const blob = await adminExportManager.exportData(config, 'admin');
  await adminExportManager.downloadFile(blob, `${config.fileName}.${format === 'excel' ? 'xls' : format}`);
};
