'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  User, 
  Video, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Flag, 
  Upload, 
  Search, 
  Filter,
  Calendar,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { actionLogService } from '@/lib/admin/action-logs';
import { VideoLogEntry, PlayerLogEntry } from '@/types/admin';
import { toast } from 'sonner';

export default function VideoLogsPage() {
  const { user } = useAuth();
  const [videoLogs, setVideoLogs] = useState<VideoLogEntry[]>([]);
  const [playerLogs, setPlayerLogs] = useState<PlayerLogEntry[]>([]);
  const [filteredVideoLogs, setFilteredVideoLogs] = useState<VideoLogEntry[]>([]);
  const [filteredPlayerLogs, setFilteredPlayerLogs] = useState<PlayerLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [playerFilter, setPlayerFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [urlVideoId, setUrlVideoId] = useState<string | null>(null);
  const [urlPlayerId, setUrlPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // قراءة معاملات URL
      const urlParams = new URLSearchParams(window.location.search);
      const videoId = urlParams.get('videoId');
      const playerId = urlParams.get('playerId');
      
      if (videoId) setUrlVideoId(videoId);
      if (playerId) setUrlPlayerId(playerId);
    }
    
    if (user?.uid) {
      loadLogs();
    }
  }, [user?.uid]);

  useEffect(() => {
    filterLogs();
  }, [videoLogs, playerLogs, searchTerm, actionFilter, playerFilter, dateFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      let videoLogsData: VideoLogEntry[] = [];
      let playerLogsData: PlayerLogEntry[] = [];
      
      // إذا كان هناك videoId محدد، احمل سجلات هذا الفيديو فقط
      if (urlVideoId) {
        videoLogsData = await actionLogService.getVideoLogs(urlVideoId, 100);
        // احصل على playerId من أول سجل
        if (videoLogsData.length > 0) {
          const playerId = videoLogsData[0].playerId;
          playerLogsData = await actionLogService.getPlayerLogs(playerId, 100);
        }
      } else if (urlPlayerId) {
        // إذا كان هناك playerId محدد، احمل سجلات هذا اللاعب فقط
        playerLogsData = await actionLogService.getPlayerLogs(urlPlayerId, 100);
        // احمل سجلات الفيديوهات لهذا اللاعب
        const allVideoLogs = await actionLogService.getAllVideoLogs(200);
        videoLogsData = allVideoLogs.filter(log => log.playerId === urlPlayerId);
      } else {
        // تحميل جميع السجلات
        [videoLogsData, playerLogsData] = await Promise.all([
          actionLogService.getAllVideoLogs(200),
          actionLogService.getAllPlayerLogs(200)
        ]);
      }

      setVideoLogs(videoLogsData);
      setPlayerLogs(playerLogsData);
      
      // إذا كان هناك فلترة من URL، طبقها
      if (urlVideoId || urlPlayerId) {
        toast.info(urlVideoId ? `تم عرض سجلات الفيديو المحدد` : `تم عرض سجلات اللاعب المحدد`);
      }
    } catch (error) {
      console.error('خطأ في تحميل السجلات:', error);
      toast.error('حدث خطأ أثناء تحميل السجلات');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filteredVideos = [...videoLogs];
    let filteredPlayers = [...playerLogs];

    // فلترة حسب البحث
    if (searchTerm) {
      filteredVideos = filteredVideos.filter(log => 
        log.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.videoTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      filteredPlayers = filteredPlayers.filter(log => 
        log.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة حسب الإجراء
    if (actionFilter !== 'all') {
      filteredVideos = filteredVideos.filter(log => log.action === actionFilter);
      filteredPlayers = filteredPlayers.filter(log => log.action === actionFilter);
    }

    // فلترة حسب اللاعب
    if (playerFilter !== 'all') {
      filteredVideos = filteredVideos.filter(log => log.playerId === playerFilter);
      filteredPlayers = filteredPlayers.filter(log => log.playerId === playerFilter);
    }

    // فلترة حسب التاريخ
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filteredVideos = filteredVideos.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
        return logDate >= filterDate;
      });

      filteredPlayers = filteredPlayers.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
        return logDate >= filterDate;
      });
    }

    setFilteredVideoLogs(filteredVideos);
    setFilteredPlayerLogs(filteredPlayers);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload':
        return <Upload className="w-4 h-4" />;
      case 'status_change':
        return <CheckCircle className="w-4 h-4" />;
      case 'notification_sent':
        return <MessageSquare className="w-4 h-4" />;
      case 'video_upload':
        return <Video className="w-4 h-4" />;
      case 'video_review':
        return <Eye className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'upload':
      case 'video_upload':
        return 'bg-blue-100 text-blue-800';
      case 'status_change':
      case 'video_review':
        return 'bg-green-100 text-green-800';
      case 'notification_sent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'upload':
        return 'رفع فيديو';
      case 'status_change':
        return 'تغيير الحالة';
      case 'notification_sent':
        return 'إرسال إشعار';
      case 'video_upload':
        return 'رفع فيديو';
      case 'video_review':
        return 'مراجعة فيديو';
      default:
        return action;
    }
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'غير محدد';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['التاريخ', 'اللاعب', 'الفيديو', 'الإجراء', 'الملاحظات', 'نوع الإشعار'].join(','),
      ...filteredVideoLogs.map(log => [
        formatDate(log.timestamp),
        log.playerName,
        log.videoTitle,
        getActionLabel(log.action),
        log.notes || '',
        log.notificationType || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `video-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-600">جاري تحميل السجلات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {urlVideoId ? 'سجل الفيديو المحدد' : urlPlayerId ? 'سجل اللاعب المحدد' : 'سجلات الفيديوهات والإجراءات'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {urlVideoId ? 'تتبع جميع الإجراءات المتخذة على هذا الفيديو' : 
                   urlPlayerId ? 'تتبع جميع الإجراءات المتعلقة بهذا اللاعب' :
                   'تتبع جميع الإجراءات المتخذة على الفيديوهات واللاعبين'}
                </p>
              </div>
            </div>
            
            {(urlVideoId || urlPlayerId) && (
              <Button
                onClick={() => {
                  setUrlVideoId(null);
                  setUrlPlayerId(null);
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', '/dashboard/admin/video-logs');
                  }
                  loadLogs();
                }}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                عرض جميع السجلات
              </Button>
            )}
          </div>
          <Badge variant="secondary" className="text-sm">
            لوحة تحكم المدير
          </Badge>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              البحث والفلترة
            </CardTitle>
            <CardDescription>
              ابحث في السجلات وفلترها حسب الإجراء واللاعب والتاريخ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث في السجلات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">نوع الإجراء</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الإجراءات</SelectItem>
                    <SelectItem value="upload">رفع فيديو</SelectItem>
                    <SelectItem value="status_change">تغيير الحالة</SelectItem>
                    <SelectItem value="notification_sent">إرسال إشعار</SelectItem>
                    <SelectItem value="video_review">مراجعة فيديو</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">اللاعب</label>
                <Select value={playerFilter} onValueChange={setPlayerFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع اللاعبين</SelectItem>
                    {Array.from(new Set(videoLogs.map(log => log.playerId))).map(playerId => {
                      const player = videoLogs.find(log => log.playerId === playerId);
                      return (
                        <SelectItem key={playerId} value={playerId}>
                          {player?.playerName || playerId}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">التاريخ</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التواريخ</SelectItem>
                    <SelectItem value="today">اليوم</SelectItem>
                    <SelectItem value="week">آخر أسبوع</SelectItem>
                    <SelectItem value="month">آخر شهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={exportLogs} className="w-full">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير السجلات
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={loadLogs} variant="outline" disabled={loading}>
                <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث السجلات
              </Button>
              
              {/* زر تجريبي لإنشاء سجل تجريبي */}
              <Button 
                onClick={async () => {
                  try {
                    await actionLogService.logNotificationSent({
                      videoId: 'test-video-id',
                      playerId: 'TnSvLJgehmftXNY024Y0cjib6NI3',
                      playerName: 'لاعب تجريبي',
                      videoTitle: 'فيديو تجريبي',
                      actionBy: 'admin',
                      actionByType: 'admin',
                      notificationType: 'sms',
                      notificationMessage: 'رسالة تجريبية للاختبار'
                    });
                    toast.success('تم إنشاء سجل تجريبي بنجاح');
                    loadLogs();
                  } catch (error) {
                    console.error('خطأ في إنشاء السجل التجريبي:', error);
                    toast.error('فشل في إنشاء السجل التجريبي');
                  }
                }} 
                variant="outline"
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              >
                إنشاء سجل تجريبي
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
                  <p className="text-sm font-medium text-gray-600">إجمالي السجلات</p>
                  <p className="text-2xl font-bold text-gray-900">{videoLogs.length + playerLogs.length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">سجلات الفيديوهات</p>
                  <p className="text-2xl font-bold text-green-600">{videoLogs.length}</p>
                </div>
                <Video className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">سجلات اللاعبين</p>
                  <p className="text-2xl font-bold text-purple-600">{playerLogs.length}</p>
                </div>
                <User className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">معروض</p>
                  <p className="text-2xl font-bold text-orange-600">{filteredVideoLogs.length + filteredPlayerLogs.length}</p>
                </div>
                <Filter className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              سجلات الفيديوهات ({filteredVideoLogs.length})
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              سجلات اللاعبين ({filteredPlayerLogs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle>سجلات الفيديوهات</CardTitle>
                <CardDescription>
                  جميع الإجراءات المتخذة على الفيديوهات
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredVideoLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Clock className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سجلات</h3>
                    <p className="text-sm text-gray-500">
                      {searchTerm || actionFilter !== 'all' || playerFilter !== 'all' || dateFilter !== 'all'
                        ? 'لا توجد سجلات تطابق الفلاتر المحددة'
                        : 'لم يتم العثور على أي سجلات للفيديوهات'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredVideoLogs.map((log) => (
                      <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getActionIcon(log.action)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {log.videoTitle}
                              </h4>
                              
                              <div className="flex items-center gap-2 ml-4">
                                <Badge className={`text-xs ${getActionColor(log.action)}`}>
                                  {getActionLabel(log.action)}
                                </Badge>
                                {log.notificationSent && (
                                  <Badge className="text-xs bg-purple-100 text-purple-800">
                                    {log.notificationType}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {log.playerName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(log.timestamp)}
                              </span>
                              {log.status && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  {log.status}
                                </span>
                              )}
                              {log.actionBy && (
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {log.actionBy === 'admin' ? 'مدير' : log.actionBy === 'system' ? 'النظام' : log.actionBy}
                                </span>
                              )}
                            </div>
                            
                            {/* عرض تفاصيل الإشعار إذا كان موجود */}
                            {log.notificationSent && (
                              <div className="bg-purple-50 p-3 rounded-lg mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageSquare className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm font-medium text-purple-800">
                                    تم إرسال إشعار عبر: {log.notificationType === 'sms' ? 'SMS' : log.notificationType === 'whatsapp' ? 'WhatsApp' : 'التطبيق'}
                                  </span>
                                </div>
                                {log.notes && (
                                  <p className="text-sm text-purple-700 bg-white p-2 rounded border border-purple-200">
                                    {log.notes}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {log.notes && !log.notificationSent && (
                              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                                {log.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle>سجلات اللاعبين</CardTitle>
                <CardDescription>
                  جميع الإجراءات المتعلقة باللاعبين
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredPlayerLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <User className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سجلات</h3>
                    <p className="text-sm text-gray-500">
                      {searchTerm || actionFilter !== 'all' || playerFilter !== 'all' || dateFilter !== 'all'
                        ? 'لا توجد سجلات تطابق الفلاتر المحددة'
                        : 'لم يتم العثور على أي سجلات للاعبين'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredPlayerLogs.map((log) => (
                      <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getActionIcon(log.action)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {log.playerName}
                              </h4>
                              
                              <div className="flex items-center gap-2 ml-4">
                                <Badge className={`text-xs ${getActionColor(log.action)}`}>
                                  {getActionLabel(log.action)}
                                </Badge>
                                {log.videoCount && (
                                  <Badge className="text-xs bg-blue-100 text-blue-800">
                                    {log.videoCount} فيديو
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(log.timestamp)}
                              </span>
                              {log.details?.videoTitle && (
                                <span className="flex items-center gap-1">
                                  <Video className="w-4 h-4" />
                                  {log.details.videoTitle}
                                </span>
                              )}
                            </div>
                            
                            {log.details?.notificationMessage && (
                              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                                {log.details.notificationMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
