'use client';

import React, { useState } from 'react';
import { Bell, X, Check, AlertCircle, Info, Shield, DollarSign, Users, Settings, Search, Clock, Video } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/firebase/auth-provider';

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

export default function AdminNotificationCenterPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);

  React.useEffect(() => {
    if (user?.uid) {
      loadNotifications();
    }
  }, [user?.uid]);

  React.useEffect(() => {
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
          type: 'video',
          title: 'فيديوهات جديدة تحتاج مراجعة (3)',
          message: 'تم رفع 3 فيديوهات جديدة من قبل: أحمد محمد، سارة أحمد، محمد علي. يرجى مراجعة الفيديوهات الجديدة.',
          priority: 'medium',
          isRead: false,
          createdAt: { toDate: () => new Date(Date.now() - 45 * 60 * 1000) },
          action: { label: 'مراجعة الفيديوهات الجديدة', url: '/dashboard/admin/videos?status=pending&sort=newest' }
        },
        {
          id: '5',
          type: 'video',
          title: 'فيديو جديد: مهارات التمرير المتقدمة',
          message: 'تم رفع فيديو جديد من قبل أحمد محمد (لاعب). يرجى مراجعة الفيديو.',
          priority: 'medium',
          isRead: true,
          createdAt: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) },
          action: { label: 'مراجعة الفيديو', url: '/dashboard/admin/videos?video=123' }
        },
        {
          id: '6',
          type: 'security',
          title: 'محاولة دخول مشبوهة',
          message: 'تم رصد محاولة دخول مشبوهة من IP غير معروف',
          priority: 'critical',
          isRead: false,
          createdAt: { toDate: () => new Date(Date.now() - 4 * 60 * 60 * 1000) },
          action: { label: 'فحص الأمان', url: '/dashboard/admin/security' }
        },
        {
          id: '5',
          type: 'payment',
          title: 'اشتراكات منتهية الصلاحية',
          message: 'هناك 12 اشتراك منتهي الصلاحية يحتاج تجديد',
          priority: 'high',
          isRead: false,
          createdAt: { toDate: () => new Date(Date.now() - 6 * 60 * 60 * 1000) },
          action: { label: 'مراجعة الاشتراكات', url: '/dashboard/admin/subscriptions?status=expired' }
        },
        {
          id: '6',
          type: 'system',
          title: 'نسخة احتياطية مكتملة',
          message: 'تم إنشاء نسخة احتياطية جديدة بنجاح',
          priority: 'low',
          isRead: true,
          createdAt: { toDate: () => new Date(Date.now() - 8 * 60 * 60 * 1000) },
          action: { label: 'عرض النسخ الاحتياطية', url: '/dashboard/admin/system/backups' }
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
      case 'video':
        return <Video className={iconClass} />;
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
      video: 'فيديوهات',
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مركز الإشعارات الإداري</h1>
              <p className="text-gray-600 mt-1">إدارة ومراقبة جميع الإشعارات والتنبيهات المهمة</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            لوحة تحكم المدير
          </Badge>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              البحث والفلترة
            </CardTitle>
            <CardDescription>
              ابحث في الإشعارات وفلترها حسب النوع والأولوية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">نوع الإشعار</label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
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
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">الأولوية</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
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
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={markAllAsRead} 
                variant="outline" 
                className="flex-1"
                disabled={unreadCount === 0}
              >
                <Check className="w-4 h-4 ml-2" />
                تحديد الكل كمقروء
              </Button>
              <Button 
                onClick={loadNotifications} 
                variant="outline"
                disabled={loading}
              >
                <Bell className="w-4 h-4 ml-2" />
                تحديث الإشعارات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الإشعارات</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">غير مقروءة</p>
                  <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">حرجة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {notifications.filter(n => n.priority === 'critical').length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">معروض</p>
                  <p className="text-2xl font-bold text-green-600">{filteredNotifications.length}</p>
                </div>
                <Search className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>قائمة الإشعارات</span>
              <Badge variant="outline">
                {filteredNotifications.length} من {notifications.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mb-4" />
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
                    className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                    onClick={() => notification.id && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`text-lg font-semibold truncate ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </h4>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                              {getPriorityLabel(notification.priority)}
                            </Badge>
                            {!notification.isRead && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
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
                              className="text-xs"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

