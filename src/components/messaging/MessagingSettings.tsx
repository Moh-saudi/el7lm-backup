'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Bell, 
  Shield, 
  Users, 
  Eye, 
  EyeOff,
  Settings,
  Save,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface MessagingSettings {
  allowMessagesFromAll: boolean;
  allowMessagesFromClubs: boolean;
  allowMessagesFromPlayers: boolean;
  allowMessagesFromAgents: boolean;
  allowMessagesFromAcademies: boolean;
  allowMessagesFromTrainers: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundNotifications: boolean;
  showReadReceipts: boolean;
  showOnlineStatus: boolean;
  autoReply: boolean;
  autoReplyMessage: string;
  blockedUsers: string[];
  messageRetention: 'forever' | '30days' | '90days' | '1year';
}

const defaultSettings: MessagingSettings = {
  allowMessagesFromAll: true,
  allowMessagesFromClubs: true,
  allowMessagesFromPlayers: true,
  allowMessagesFromAgents: true,
  allowMessagesFromAcademies: true,
  allowMessagesFromTrainers: true,
  emailNotifications: true,
  pushNotifications: true,
  soundNotifications: true,
  showReadReceipts: true,
  showOnlineStatus: true,
  autoReply: false,
  autoReplyMessage: 'شكراً لرسالتك. سأقوم بالرد عليك في أقرب وقت ممكن.',
  blockedUsers: [],
  messageRetention: 'forever'
};

const MessagingSettingsComponent: React.FC = () => {
  const { user, userData } = useAuth();
  const [settings, setSettings] = useState<MessagingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blockedUsersDetails, setBlockedUsersDetails] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const settingsDoc = await getDoc(doc(db, 'messaging_settings', user.uid));
      
      if (settingsDoc.exists()) {
        const savedSettings = settingsDoc.data() as MessagingSettings;
        setSettings({ ...defaultSettings, ...savedSettings });
        
        // جلب تفاصيل المستخدمين المحظورين
        if (savedSettings.blockedUsers && savedSettings.blockedUsers.length > 0) {
          await loadBlockedUsersDetails(savedSettings.blockedUsers);
        }
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error);
      toast.error('فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedUsersDetails = async (blockedUserIds: string[]) => {
    try {
      const userPromises = [];
      
      // البحث في جميع المجموعات
      const collections = ['clubs', 'players', 'agents', 'academies', 'trainers'];
      
      for (const collectionName of collections) {
        for (const userId of blockedUserIds) {
          userPromises.push(
            getDoc(doc(db, collectionName, userId)).then(doc => {
              if (doc.exists()) {
                return {
                  id: doc.id,
                  type: collectionName,
                  ...doc.data()
                };
              }
              return null;
            }).catch(() => null)
          );
        }
      }
      
      const results = await Promise.all(userPromises);
      const validUsers = results.filter(user => user !== null);
      setBlockedUsersDetails(validUsers);
    } catch (error) {
      console.error('خطأ في جلب تفاصيل المستخدمين المحظورين:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'messaging_settings', user.uid), settings);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      toast.error('فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    toast.info('تم إعادة تعيين الإعدادات إلى القيم الافتراضية');
  };

  const unblockUser = async (userId: string) => {
    const updatedBlockedUsers = settings.blockedUsers.filter(id => id !== userId);
    setSettings(prev => ({ ...prev, blockedUsers: updatedBlockedUsers }));
    
    // تحديث قائمة المستخدمين المحظورين المعروضة
    setBlockedUsersDetails(prev => prev.filter(user => user.id !== userId));
    
    toast.success('تم إلغاء حظر المستخدم');
  };

  const getUserDisplayName = (user: any) => {
    switch (user.type) {
      case 'clubs':
        return user.clubName || user.name || 'نادي';
      case 'players':
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'لاعب';
      case 'agents':
        return user.agentName || user.name || 'وكيل';
      case 'academies':
        return user.academyName || user.name || 'أكاديمية';
      case 'trainers':
        return user.trainerName || user.name || 'مدرب';
      default:
        return 'مستخدم';
    }
  };

  const getUserTypeLabel = (type: string) => {
    const typeLabels = {
      clubs: 'نادي',
      players: 'لاعب',
      agents: 'وكيل',
      academies: 'أكاديمية',
      trainers: 'مدرب'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الخصوصية والأمان */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            الخصوصية والأمان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              السماح بالرسائل من جميع المستخدمين
            </Label>
            <Switch
              checked={settings.allowMessagesFromAll}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, allowMessagesFromAll: checked }))
              }
            />
          </div>

          {!settings.allowMessagesFromAll && (
            <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center justify-between">
                <Label>السماح بالرسائل من الأندية</Label>
                <Switch
                  checked={settings.allowMessagesFromClubs}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, allowMessagesFromClubs: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>السماح بالرسائل من اللاعبين</Label>
                <Switch
                  checked={settings.allowMessagesFromPlayers}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, allowMessagesFromPlayers: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>السماح بالرسائل من الوكلاء</Label>
                <Switch
                  checked={settings.allowMessagesFromAgents}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, allowMessagesFromAgents: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>السماح بالرسائل من الأكاديميات</Label>
                <Switch
                  checked={settings.allowMessagesFromAcademies}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, allowMessagesFromAcademies: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>السماح بالرسائل من المدربين</Label>
                <Switch
                  checked={settings.allowMessagesFromTrainers}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, allowMessagesFromTrainers: checked }))
                  }
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              إظهار إشعارات القراءة
            </Label>
            <Switch
              checked={settings.showReadReceipts}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, showReadReceipts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              إظهار حالة الاتصال
            </Label>
            <Switch
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, showOnlineStatus: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* الإشعارات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            إعدادات الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>إشعارات البريد الإلكتروني</Label>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>الإشعارات الفورية</Label>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, pushNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>أصوات الإشعارات</Label>
            <Switch
              checked={settings.soundNotifications}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, soundNotifications: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* الرد التلقائي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            الرد التلقائي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>تفعيل الرد التلقائي</Label>
            <Switch
              checked={settings.autoReply}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, autoReply: checked }))
              }
            />
          </div>

          {settings.autoReply && (
            <div className="space-y-2">
              <Label>رسالة الرد التلقائي</Label>
              <Textarea
                value={settings.autoReplyMessage}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, autoReplyMessage: e.target.value }))
                }
                placeholder="اكتب رسالة الرد التلقائي..."
                className="min-h-20"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* المستخدمون المحظورون */}
      {blockedUsersDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              المستخدمون المحظورون ({blockedUsersDetails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blockedUsersDetails.map((blockedUser) => (
                <div key={blockedUser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{getUserDisplayName(blockedUser)}</p>
                    <p className="text-sm text-gray-500">{getUserTypeLabel(blockedUser.type)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unblockUser(blockedUser.id)}
                  >
                    إلغاء الحظر
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* أزرار الحفظ والإعادة تعيين */}
      <div className="flex items-center gap-4">
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              جاري الحفظ...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              حفظ الإعدادات
            </div>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={resetToDefaults}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          إعادة تعيين افتراضي
        </Button>
      </div>
    </div>
  );
};

export default MessagingSettingsComponent; 
