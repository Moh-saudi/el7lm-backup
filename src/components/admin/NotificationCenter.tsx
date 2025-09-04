'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, Shield, DollarSign, Users, Settings, Search, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminNotification {
  id?: string;
  type: 'payment' | 'user' | 'system' | 'security' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  adminId?: string;
  metadata?: any;
  createdAt: any;
  readAt?: any;
  action?: {
    label: string;
    url: string;
  };
}

interface NotificationCenterProps {
  adminId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ adminId, isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, adminId]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, priorityFilter, searchTerm]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // إشعارات تجريبية للعرض
      const sampleNotifications: AdminNotification[] = [
        {
          id: '1',
          type: 'payment',
          title: 'مدفوعات فاشلة تحتاج مراجعة',
          message: 'هناك 5 مدفوعات فاشلة في الساعة الماضية تحتاج إلى مراجعة فورية',
          priority: 'high',
          isRead: false,
          createdAt: { toDate: () => new Date(Date.now() - 10 * 60 * 1000) },
          action: { label: 'مراجعة المدفوعات', url: '/dashboard/admin/payments?status=failed' }
        },
        {
          id: '2',
          type: 'user',
          title: 'مستخدمين جدد في انتظار التحقق',
          message: 'هناك 3 مستخدمين جدد يحتاجون موافقة إدارية',
          priority: 'medium',
          isRead: false,
          createdAt: { toDate: () => new Date(Date.now() - 30 * 60 * 1000) },
          action: { label: 'مراجعة المستخدمين', url: '/dashboard/admin/users?verified=false' }
        },
        {
          id: '3',
          type: 'system',
          title: 'تحديث أسعار العملات مطلوب',
          message: 'لم يتم تحديث أسعار العملات لأكثر من 24 ساعة',
          priority: 'medium',
          isRead: true,
          createdAt: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) },
          action: { label: 'تحديث الأسعار', url: '/dashboard/admin/system' }
        },
        {
          id: '4',
          type: 'security',
          title: 'محاولة دخول مشبوهة',
          message: 'تم رصد محاولة دخول مشبوهة من IP غير معروف',
          priority: 'critical',
          isRead: false,
          createdAt: { toDate: () => new Date(Date.now() - 4 * 60 * 60 * 1000) },
          action: { label: 'فحص الأمان', url: '/dashboard/admin/security' }
        }
      ];
      
      setNotifications(sampleNotifications);
      
      const unread = sampleNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('خطأ في تحميل الإشعارات:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // فلترة حسب النوع
    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.isRead);
      } else {
        filtered = filtered.filter(n => n.type === filter);
      }
    }

    // فلترة حسب الأولوية
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(n => n.priority === priorityFilter);
    }

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('خطأ في تحديد الإشعار كمقروء:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('خطأ في تحديد جميع الإشعارات كمقروءة:', error);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-5 h-5 ${
      priority === 'critical' ? 'text-red-500' :
      priority === 'high' ? 'text-orange-500' :
      priority === 'medium' ? 'text-yellow-500' :
      'text-blue-500'
    }`;

    switch (type) {
      case 'payment':
        return <DollarSign className={iconClass} />;
      case 'user':
        return <Users className={iconClass} />;
      case 'system':
        return <Settings className={iconClass} />;
      case 'security':
        return <Shield className={iconClass} />;
      case 'error':
        return <AlertCircle className={iconClass} />;
      case 'warning':
        return <AlertCircle className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      payment: 'مدفوعات',
      user: 'مستخدمين',
      system: 'نظام',
      security: 'أمان',
      error: 'خطأ',
      warning: 'تحذير',
      info: 'معلومات'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      critical: 'حرج',
      high: 'مرتفع',
      medium: 'متوسط',
      low: 'منخفض'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const formatTimeAgo = (date: any) => {
    try {
      const now = new Date();
      const notificationDate = date.toDate ? date.toDate() : new Date(date);
      const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'الآن';
      if (diffInMinutes < 60) return `${diffInMinutes} دقيقة`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ساعة`;
      return `${Math.floor(diffInMinutes / 1440)} يوم`;
    } catch (error) {
      return 'منذ فترة';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-lg font-bold text-white">مركز الإشعارات</h2>
                <p className="text-sm text-blue-100">
                  {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Controls */}
          <div className="p-4 space-y-3 border-b bg-gray-50">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث في الإشعارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الإشعارات</SelectItem>
                  <SelectItem value="unread">غير مقروءة</SelectItem>
                  <SelectItem value="payment">مدفوعات</SelectItem>
                  <SelectItem value="user">مستخدمين</SelectItem>
                  <SelectItem value="system">نظام</SelectItem>
                  <SelectItem value="security">أمان</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأولويات</SelectItem>
                  <SelectItem value="critical">حرج</SelectItem>
                  <SelectItem value="high">مرتفع</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={markAllAsRead} 
                size="sm" 
                variant="outline" 
                className="flex-1"
                disabled={unreadCount === 0}
              >
                <Check className="w-4 h-4 ml-2" />
                تحديد الكل كمقروء
              </Button>
              <Button 
                onClick={loadNotifications} 
                size="sm" 
                variant="outline"
                disabled={loading}
              >
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
                <p className="text-sm text-gray-500">
                  {searchTerm || filter !== 'all' || priorityFilter !== 'all' 
                    ? 'لا توجد إشعارات تطابق الفلاتر المحددة' 
                    : 'لم يتم العثور على أي إشعارات'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                    onClick={() => notification.id && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium truncate ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </h4>
                          
                          <div className="flex items-center gap-2 ml-2">
                            <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                              {getPriorityLabel(notification.priority)}
                            </Badge>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 leading-relaxed mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                          </div>
                          
                          {notification.action && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (typeof window !== 'undefined') {
                                  window.open(notification.action!.url, '_blank');
                                }
                              }}
                            >
                              {notification.action.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                إجمالي: {notifications.length} إشعار
              </span>
              <span>
                معروض: {filteredNotifications.length} إشعار
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
