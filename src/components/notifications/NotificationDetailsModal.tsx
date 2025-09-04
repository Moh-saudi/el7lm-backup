'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  X, 
  Eye, 
  EyeOff, 
  Check, 
  Star, 
  MessageSquare, 
  UserPlus, 
  Heart, 
  MessageCircle,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Building,
  GraduationCap,
  Target,
  Briefcase,
  TrendingUp,
  User,
  Shield,
  Bell,
  Zap,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Share2,
  Bookmark,
  Flag,
  Archive,
  Trash2,
  Reply,
  Forward
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale/ar';
import toast from 'react-hot-toast';

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

interface NotificationDetailsModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onNavigateToSender?: (senderId: string) => void;
  onNavigateToAction?: (notification: Notification) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReply?: (notification: Notification) => void;
  onForward?: (notification: Notification) => void;
}

export default function NotificationDetailsModal({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
  onNavigateToSender,
  onNavigateToAction,
  onArchive,
  onDelete,
  onReply,
  onForward
}: NotificationDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !notification) return null;

  // دالة لتنسيق التاريخ
  const getFormattedDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch {
      return 'الآن';
    }
  };

  // دالة لتنسيق التاريخ الكامل
  const getFullDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'تاريخ غير محدد';
    }
  };

  // دالة للحصول على أيقونة النوع
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // دالة للحصول على أيقونة نوع الإجراء
  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'profile_view':
        return <Eye className="w-4 h-4" />;
      case 'message_sent':
        return <MessageSquare className="w-4 h-4" />;
      case 'connection_request':
        return <UserPlus className="w-4 h-4" />;
      case 'follow':
        return <User className="w-4 h-4" />;
      case 'like':
        return <Heart className="w-4 h-4" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // دالة للحصول على أيقونة نوع الحساب
  const getAccountTypeIcon = (accountType?: string) => {
    switch (accountType) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'player':
        return <User className="w-4 h-4" />;
      case 'club':
        return <Building className="w-4 h-4" />;
      case 'academy':
        return <GraduationCap className="w-4 h-4" />;
      case 'trainer':
        return <Target className="w-4 h-4" />;
      case 'agent':
        return <Briefcase className="w-4 h-4" />;
      case 'marketer':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  // دالة لنسخ النص
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ النص');
  };

  // دالة لمشاركة الإشعار
  const shareNotification = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: notification.title,
          text: notification.message,
          url: window.location.href
        });
      } catch (error) {
        console.error('خطأ في المشاركة:', error);
      }
    } else {
      copyToClipboard(`${notification.title}\n\n${notification.message}`);
    }
  };

  // دالة لحفظ الإشعار
  const bookmarkNotification = () => {
    toast.success('تم حفظ الإشعار');
  };

  // دالة للإبلاغ عن الإشعار
  const reportNotification = () => {
    toast.success('تم الإبلاغ عن الإشعار');
  };

  // دالة لمعالجة الإجراءات
  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'markAsRead':
          if (!notification.isRead) {
            await onMarkAsRead(notification.id);
          }
          break;
        case 'navigateToSender':
          if (onNavigateToSender && notification.senderId) {
            onNavigateToSender(notification.senderId);
          }
          break;
        case 'navigateToAction':
          if (onNavigateToAction) {
            onNavigateToAction(notification);
          }
          break;
        case 'archive':
          if (onArchive) {
            await onArchive(notification.id);
          }
          break;
        case 'delete':
          if (onDelete) {
            await onDelete(notification.id);
          }
          break;
        case 'reply':
          if (onReply) {
            onReply(notification);
          }
          break;
        case 'forward':
          if (onForward) {
            onForward(notification);
          }
          break;
      }
    } catch (error) {
      console.error('خطأ في معالجة الإجراء:', error);
      toast.error('حدث خطأ في معالجة الإجراء');
    } finally {
      setIsLoading(false);
    }
  };

  // دالة للتحقق من أن المرسل من الإدارة
  const isAdminSender = (accountType?: string) => {
    return accountType === 'admin' || 
           accountType === 'system' || 
           accountType === 'support' ||
           accountType === 'management';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getTypeIcon(notification.type)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">تفاصيل الإشعار</h2>
              <p className="text-sm text-gray-600">معلومات مفصلة عن الإشعار</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* العنوان والرسالة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getActionIcon(notification.actionType)}
                {notification.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{notification.message}</p>
            </CardContent>
          </Card>

          {/* معلومات المرسل */}
          {notification.senderId && notification.senderName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات المرسل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={notification.senderAvatar} />
                    <AvatarFallback className="text-lg">
                      {notification.senderName?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {notification.senderName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      {getAccountTypeIcon(notification.senderAccountType)}
                      <span className="capitalize">
                        {notification.senderAccountType === 'admin' ? 'مدير' :
                         notification.senderAccountType === 'player' ? 'لاعب' :
                         notification.senderAccountType === 'club' ? 'نادي' :
                         notification.senderAccountType === 'academy' ? 'أكاديمية' :
                         notification.senderAccountType === 'trainer' ? 'مدرب' :
                         notification.senderAccountType === 'agent' ? 'وكيل' :
                         notification.senderAccountType === 'marketer' ? 'مسوق' :
                         notification.senderAccountType}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleAction('navigateToSender')}
                    disabled={isLoading}
                    className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:border-blue-600"
                  >
                    {isAdminSender(notification.senderAccountType) ? (
                      <>
                        <MessageSquare className="w-4 h-4 ml-2" />
                        رسالة الدعم الفني
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 ml-2" />
                        عرض الملف الشخصي
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* معلومات الإشعار */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات الإشعار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">تاريخ الإنشاء:</span>
                  <span className="text-sm font-medium">{getFullDate(notification.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">منذ:</span>
                  <span className="text-sm font-medium">{getFormattedDate(notification.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">النوع:</span>
                  <Badge variant={notification.type === 'success' ? 'default' : 
                                   notification.type === 'warning' ? 'secondary' :
                                   notification.type === 'error' ? 'destructive' : 'outline'}>
                    {notification.type === 'success' ? 'نجاح' :
                     notification.type === 'warning' ? 'تحذير' :
                     notification.type === 'error' ? 'خطأ' : 'معلومات'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">الحالة:</span>
                  <Badge variant={notification.isRead ? 'default' : 'secondary'}>
                    {notification.isRead ? 'مقروء' : 'غير مقروء'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* البيانات الوصفية */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">البيانات الوصفية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(notification.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">{key}:</span>
                      <span className="text-sm text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* الإجراءات */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {!notification.isRead && (
                  <Button
                    variant="default"
                    onClick={() => handleAction('markAsRead')}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-0"
                  >
                    <Check className="w-4 h-4" />
                    تحديد كمقروء
                  </Button>
                )}
                
                {notification.link && (
                  <Button
                    variant="default"
                    onClick={() => handleAction('navigateToAction')}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                    فتح الرابط
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={bookmarkNotification}
                  className="flex items-center gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-600"
                >
                  <Bookmark className="w-4 h-4" />
                  حفظ
                </Button>

                <Button
                  variant="outline"
                  onClick={shareNotification}
                  className="flex items-center gap-2 border-purple-500 text-purple-700 hover:bg-purple-50 hover:border-purple-600"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </Button>

                {onReply && (
                  <Button
                    variant="outline"
                    onClick={() => handleAction('reply')}
                    disabled={isLoading}
                    className="flex items-center gap-2 border-indigo-500 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-600"
                  >
                    <Reply className="w-4 h-4" />
                    رد
                  </Button>
                )}

                {onForward && (
                  <Button
                    variant="outline"
                    onClick={() => handleAction('forward')}
                    disabled={isLoading}
                    className="flex items-center gap-2 border-teal-500 text-teal-700 hover:bg-teal-50 hover:border-teal-600"
                  >
                    <Forward className="w-4 h-4" />
                    إعادة توجيه
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={reportNotification}
                  className="flex items-center gap-2 border-orange-500 text-orange-700 hover:bg-orange-50 hover:border-orange-600"
                >
                  <Flag className="w-4 h-4" />
                  إبلاغ
                </Button>

                {onArchive && (
                  <Button
                    variant="outline"
                    onClick={() => handleAction('archive')}
                    disabled={isLoading}
                    className="flex items-center gap-2 border-gray-500 text-gray-700 hover:bg-gray-50 hover:border-gray-600"
                  >
                    <Archive className="w-4 h-4" />
                    أرشفة
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="destructive"
                    onClick={() => handleAction('delete')}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500 px-6 py-2"
          >
            <X className="w-4 h-4 ml-2" />
            إغلاق
          </Button>
          {notification.link && (
            <Button 
              onClick={() => handleAction('navigateToAction')} 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4 ml-2" />
              فتح الرابط
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
