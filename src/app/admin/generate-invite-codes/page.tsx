'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, Copy, QrCode, Mail, MessageSquare, Users, Building, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DependentPlayer {
  id: string;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  club_id?: string;
  academy_id?: string;
  trainer_id?: string;
  agent_id?: string;
  source: 'players' | 'player';
  organizationInfo: string;
}

interface InviteCode {
  id: string;
  code: string;
  playerId: string;
  playerName: string;
  organizationType: string;
  organizationName: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;
  inviteUrl: string;
}

export default function GenerateInviteCodesPage() {
  const { user } = useAuth();
  const [dependentPlayers, setDependentPlayers] = useState<DependentPlayer[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [generatedCodes, setGeneratedCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [organizationType, setOrganizationType] = useState<string>('all');

  useEffect(() => {
    loadDependentPlayers();
  }, []);

  const loadDependentPlayers = async () => {
    try {
      setLoading(true);
      const allPlayers: DependentPlayer[] = [];

      // جلب من مجموعة players
      const playersSnapshot = await getDocs(collection(db, 'players'));
      playersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const player = processPlayerData(doc.id, data, 'players');
        if (player) allPlayers.push(player);
      });

      // جلب من مجموعة player
      const playerSnapshot = await getDocs(collection(db, 'player'));
      playerSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const player = processPlayerData(doc.id, data, 'player');
        if (player) allPlayers.push(player);
      });

      // إزالة التكرار وفلترة اللاعبين التابعين
      const uniquePlayers = allPlayers.filter((player, index, self) => 
        index === self.findIndex(p => p.id === player.id)
      );

      const dependentOnly = uniquePlayers.filter(player => {
        const isDependent = !!(
          player.club_id || player.academy_id || 
          player.trainer_id || player.agent_id
        );
        return isDependent;
      });

      setDependentPlayers(dependentOnly);
    } catch (error) {
      console.error('خطأ في جلب اللاعبين:', error);
      toast.error('فشل في جلب اللاعبين');
    } finally {
      setLoading(false);
    }
  };

  const processPlayerData = (id: string, data: any, source: 'players' | 'player'): DependentPlayer | null => {
    const fullName = data.full_name || data.name || '';
    
    if (!fullName) return null;

    let organizationInfo = '';
    if (data.club_id) organizationInfo = 'نادي';
    else if (data.academy_id) organizationInfo = 'أكاديمية';
    else if (data.trainer_id) organizationInfo = 'مدرب';
    else if (data.agent_id) organizationInfo = 'وكيل';

    return {
      id,
      full_name: fullName,
      email: data.email,
      phone: data.phone,
      club_id: data.club_id,
      academy_id: data.academy_id,
      trainer_id: data.trainer_id,
      agent_id: data.agent_id,
      source,
      organizationInfo
    };
  };

  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateCodesForSelectedPlayers = async () => {
    if (selectedPlayers.length === 0) {
      toast.error('يرجى اختيار لاعب واحد على الأقل');
      return;
    }

    setGenerating(true);
    try {
      const newCodes: InviteCode[] = [];
      
      for (const playerId of selectedPlayers) {
        const player = dependentPlayers.find(p => p.id === playerId);
        if (!player) continue;

        const code = generateInviteCode();
        const inviteUrl = `${window.location.origin}/invite/${code}`;
        
        const inviteData = {
          code,
          playerId: player.id,
          playerName: player.full_name || '',
          organizationType: player.organizationInfo,
          organizationName: 'المنظمة', // يمكن تحسينه لاحقاً
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
          isUsed: false,
          inviteUrl,
          createdBy: user?.uid,
          createdByEmail: user?.email
        };

        // حفظ كود الدعوة في Firebase
        const docRef = await addDoc(collection(db, 'invite_codes'), inviteData);
        
        newCodes.push({
          id: docRef.id,
          ...inviteData
        });
      }

      setGeneratedCodes(prev => [...prev, ...newCodes]);
      setSelectedPlayers([]);
      toast.success(`تم إنشاء ${newCodes.length} كود دعوة بنجاح`);
      
    } catch (error) {
      console.error('خطأ في إنشاء أكواد الدعوة:', error);
      toast.error('فشل في إنشاء أكواد الدعوة');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ للحافظة');
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const selectAll = () => {
    const visiblePlayerIds = filteredPlayers.map(p => p.id);
    setSelectedPlayers(visiblePlayerIds);
  };

  const clearSelection = () => {
    setSelectedPlayers([]);
  };

  // فلترة اللاعبين
  const filteredPlayers = dependentPlayers.filter(player => {
    const matchesSearch = player.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = organizationType === 'all' || 
                       (organizationType === 'club' && player.club_id) ||
                       (organizationType === 'academy' && player.academy_id) ||
                       (organizationType === 'trainer' && player.trainer_id) ||
                       (organizationType === 'agent' && player.agent_id);

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل اللاعبين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎫 مولد أكواد الدعوة
          </h1>
          <p className="text-gray-600">
            إنشاء أكواد دعوة للاعبين التابعين لإنشاء حسابات تسجيل دخول منفصلة
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* قائمة اللاعبين */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  اللاعبين التابعين ({filteredPlayers.length})
                </CardTitle>
                <CardDescription>
                  اختر اللاعبين لإنشاء أكواد دعوة لهم
                </CardDescription>
              </CardHeader>
              <CardContent>
                
                {/* أدوات البحث والفلترة */}
                <div className="space-y-4 mb-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="البحث بالاسم أو الإيميل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="w-48">
                      <Select value={organizationType} onValueChange={setOrganizationType}>
                        <SelectTrigger>
                          <SelectValue placeholder="نوع المنظمة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الأنواع</SelectItem>
                          <SelectItem value="club">الأندية</SelectItem>
                          <SelectItem value="academy">الأكاديميات</SelectItem>
                          <SelectItem value="trainer">المدربين</SelectItem>
                          <SelectItem value="agent">الوكلاء</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={selectAll}>
                        تحديد الكل ({filteredPlayers.length})
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearSelection}>
                        إلغاء التحديد
                      </Button>
                    </div>
                    <Badge variant="secondary">
                      محدد: {selectedPlayers.length}
                    </Badge>
                  </div>
                </div>

                {/* قائمة اللاعبين */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPlayers.map(player => (
                    <div
                      key={player.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlayers.includes(player.id) 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => togglePlayerSelection(player.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedPlayers.includes(player.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedPlayers.includes(player.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          
                          <div>
                            <div className="font-medium">{player.full_name}</div>
                            {player.email && (
                              <div className="text-sm text-gray-500">{player.email}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {player.organizationInfo}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredPlayers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد لاعبين مطابقين للبحث
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* أدوات الإنشاء */}
          <div className="space-y-6">
            
            {/* إنشاء الأكواد */}
            <Card>
              <CardHeader>
                <CardTitle>إنشاء أكواد الدعوة</CardTitle>
                <CardDescription>
                  إنشاء أكواد دعوة للاعبين المحددين
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">محدد للإنشاء:</div>
                      <div>{selectedPlayers.length} لاعب</div>
                    </div>
                  </div>

                  <Button
                    onClick={generateCodesForSelectedPlayers}
                    disabled={selectedPlayers.length === 0 || generating}
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        إنشاء أكواد الدعوة
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* الأكواد المنشأة */}
            {generatedCodes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>الأكواد المنشأة ({generatedCodes.length})</CardTitle>
                  <CardDescription>
                    أكواد الدعوة التي تم إنشاؤها مؤخراً
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {generatedCodes.map(code => (
                      <div key={code.id} className="border rounded-lg p-3">
                        <div className="font-medium text-sm mb-2">{code.playerName}</div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">الكود:</span>
                            <div className="flex items-center gap-1">
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {code.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(code.code)}
                                className="p-1 h-auto"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">الرابط:</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(code.inviteUrl)}
                              className="p-1 h-auto text-blue-600"
                              title="نسخ رابط الدعوة"
                            >
                              <Link className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allCodes = generatedCodes.map(c => 
                          `${c.playerName}: ${c.inviteUrl}`
                        ).join('\n');
                        copyToClipboard(allCodes);
                      }}
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      نسخ جميع الروابط
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* تعليمات */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 كيفية استخدام أكواد الدعوة</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>اختر اللاعبين:</strong> حدد اللاعبين التابعين المطلوب إنشاء أكواد دعوة لهم</li>
              <li><strong>أنشئ الأكواد:</strong> اضغط على "إنشاء أكواد الدعوة"</li>
              <li><strong>شارك الروابط:</strong> أرسل رابط الدعوة لكل لاعب عبر الواتساب أو الإيميل</li>
              <li><strong>اللاعب يدخل:</strong> اللاعب يفتح الرابط ويدخل إيميله</li>
              <li><strong>إنشاء الحساب:</strong> يتم إنشاء حساب تسجيل دخول تلقائياً</li>
              <li><strong>تسجيل الدخول:</strong> اللاعب يستطيع الدخول لملفه الشخصي</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
