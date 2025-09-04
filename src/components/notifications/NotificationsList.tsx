'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  Eye,
  Check,
  Star,
  Zap,
  Search,
  Filter,
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationItem from './NotificationItem';
import NotificationDetailsModal from './NotificationDetailsModal';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
  scope: 'system' | 'club' | 'academy' | 'trainer' | string;
  organizationId?: string;
  createdAt: any;
  updatedAt: any;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  senderAccountType?: string;
  actionType?: 'profile_view' | 'message_sent' | 'connection_request' | 'follow' | 'like' | 'comment';
}

interface NotificationsListProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateToSender?: (senderId: string) => void;
  onNavigateToAction?: (notification: Notification) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReply?: (notification: Notification) => void;
  onForward?: (notification: Notification) => void;
  onCreateTestNotifications?: () => void;
  onCreateMultipleNotifications?: () => void;
  showSenderInfo?: boolean;
  title?: string;
  description?: string;
  showStats?: boolean;
  showFilters?: boolean;
  showTestButtons?: boolean;
}

export default function NotificationsList({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateToSender,
  onNavigateToAction,
  onArchive,
  onDelete,
  onReply,
  onForward,
  onCreateTestNotifications,
  onCreateMultipleNotifications,
  showSenderInfo = true,
  title = "الإشعارات",
  description = "تابع جميع الإشعارات والتنبيهات المهمة",
  showStats = true,
  showFilters = true,
  showTestButtons = false
}: NotificationsListProps) {
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [filterActionType, setFilterActionType] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // فتح موديل التفاصيل
  const openNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  // إغلاق موديل التفاصيل
  const closeNotificationDetails = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  // أرشفة الإشعار
  const archiveNotification = async (notificationId: string) => {
    try {
      // هنا يمكن إضافة منطق الأرشفة
      toast.success('تم أرشفة الإشعار');
      closeNotificationDetails();
    } catch (error) {
      console.error('خطأ في أرشفة الإشعار:', error);
      toast.error('حدث خطأ في أرشفة الإشعار');
    }
  };

  // حذف الإشعار
  const deleteNotification = async (notificationId: string) => {
    try {
      // هنا يمكن إضافة منطق الحذف
      toast.success('تم حذف الإشعار');
      closeNotificationDetails();
    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
      toast.error('حدث خطأ في حذف الإشعار');
    }
  };

  // الرد على الإشعار
  const replyToNotification = (notification: Notification) => {
    // هنا يمكن إضافة منطق الرد
    toast.success('سيتم فتح صفحة الرد');
    closeNotificationDetails();
  };

  // إعادة توجيه الإشعار
  const forwardNotification = (notification: Notification) => {
    // هنا يمكن إضافة منطق إعادة التوجيه
    toast.success('سيتم فتح صفحة إعادة التوجيه');
    closeNotificationDetails();
  };

  // تطبيق الفلاتر والبحث
  useEffect(() => {
    let filtered = [...notifications];

    // فلتر البحث
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.senderName && n.senderName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // فلتر النوع
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // فلتر حالة القراءة
    if (filterRead === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filterRead === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // فلتر نوع الإجراء
    if (filterActionType !== 'all') {
      filtered = filtered.filter(n => n.actionType === filterActionType);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, filterType, filterRead, filterActionType]);

  // إحصائيات سريعة
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    warnings: notifications.filter(n => n.type === 'warning').length,
    errors: notifications.filter(n => n.type === 'error').length,
    profileViews: notifications.filter(n => n.actionType === 'profile_view').length,
    messages: notifications.filter(n => n.actionType === 'message_sent').length,
    connections: notifications.filter(n => n.actionType === 'connection_request').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* إحصائيات سريعة */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">إجمالي</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                  </div>
                  <Bell className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">غير مقروءة</p>
                    <p className="text-2xl font-bold text-green-800">{stats.unread}</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">تحذيرات</p>
                    <p className="text-2xl font-bold text-orange-800">{stats.warnings}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">أخطاء</p>
                    <p className="text-2xl font-bold text-red-800">{stats.errors}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">مشاهدات</p>
                    <p className="text-2xl font-bold text-purple-800">{stats.profileViews}</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600">رسائل</p>
                    <p className="text-2xl font-bold text-indigo-800">{stats.messages}</p>
                  </div>
                  <Check className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-pink-50 border-pink-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-pink-600">اتصالات</p>
                    <p className="text-2xl font-bold text-pink-800">{stats.connections}</p>
                  </div>
                  <Star className="w-8 h-8 text-pink-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* الفلاتر والبحث */}
        {showFilters && (
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* البحث */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="ابحث في الإشعارات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-12"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* فلتر النوع */}
            <div className="w-full lg:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الإشعار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="info">معلومات</SelectItem>
                  <SelectItem value="success">نجح</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="error">خطأ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* فلتر حالة القراءة */}
            <div className="w-full lg:w-48">
              <Select value={filterRead} onValueChange={setFilterRead}>
                <SelectTrigger>
                  <SelectValue placeholder="حالة القراءة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الإشعارات</SelectItem>
                  <SelectItem value="unread">غير مقروءة</SelectItem>
                  <SelectItem value="read">مقروءة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* فلتر نوع الإجراء */}
            <div className="w-full lg:w-48">
              <Select value={filterActionType} onValueChange={setFilterActionType}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الإجراء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الإجراءات</SelectItem>
                  <SelectItem value="profile_view">مشاهدة الملف</SelectItem>
                  <SelectItem value="message_sent">رسالة</SelectItem>
                  <SelectItem value="connection_request">طلب اتصال</SelectItem>
                  <SelectItem value="follow">متابعة</SelectItem>
                  <SelectItem value="like">إعجاب</SelectItem>
                  <SelectItem value="comment">تعليق</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* الأزرار */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={onMarkAllAsRead}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                تحديد الكل كمقروء
              </Button>

              {showTestButtons && onCreateTestNotifications && (
                <Button 
                  onClick={onCreateTestNotifications}
                  variant="outline"
                  className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  <Zap className="w-4 h-4" />
                  إنشاء إشعارات تجريبية
                </Button>
              )}

              {showTestButtons && onCreateMultipleNotifications && (
                <Button 
                  onClick={onCreateMultipleNotifications}
                  variant="outline"
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  <Star className="w-4 h-4" />
                  إنشاء 10 إشعارات
                </Button>
              )}
            </div>
          </div>
        )}

        {/* قائمة الإشعارات */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد إشعارات</h3>
                <p className="text-gray-500">
                  {searchTerm || filterType !== 'all' || filterRead !== 'all' || filterActionType !== 'all'
                    ? 'لا توجد إشعارات تطابق الفلتر المحدد'
                    : 'ستظهر هنا الإشعارات الجديدة عند حدوث أحداث مهمة'
                  }
                </p>
                {(searchTerm || filterType !== 'all' || filterRead !== 'all' || filterActionType !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                      setFilterRead('all');
                      setFilterActionType('all');
                    }}
                    className="mt-4"
                  >
                    <X className="w-4 h-4 ml-2" />
                    مسح الفلاتر
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* عداد النتائج */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>
                  عرض {filteredNotifications.length} من {notifications.length} إشعار
                </span>
                {filteredNotifications.length !== notifications.length && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                      setFilterRead('all');
                      setFilterActionType('all');
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <X className="w-4 h-4 ml-1" />
                    مسح الفلاتر
                  </Button>
                )}
              </div>

              {/* الإشعارات */}
              {filteredNotifications.map((notification) => (
                              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onNavigateToSender={onNavigateToSender}
                onNavigateToAction={openNotificationDetails}
                showSenderInfo={showSenderInfo}
              />
              ))}
            </>
          )}
        </div>
      </div>

      {/* موديل تفاصيل الإشعارات */}
      <NotificationDetailsModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={closeNotificationDetails}
        onMarkAsRead={onMarkAsRead}
        onNavigateToSender={onNavigateToSender}
        onNavigateToAction={onNavigateToAction}
        onArchive={onArchive}
        onDelete={onDelete}
        onReply={onReply}
        onForward={onForward}
      />
    </div>
  );
}

