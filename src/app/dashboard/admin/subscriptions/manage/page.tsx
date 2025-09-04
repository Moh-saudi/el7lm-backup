'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Package,
  Edit,
  Plus,
  Trash2,
  Save,
  X,
  CheckCircle,
  DollarSign,
  Users,
  Star,
  Crown,
  Zap,
  Shield,
  MoreHorizontal,
  Copy,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import SimpleLoader from '@/components/shared/SimpleLoader';

// إخفاء أخطاء Firebase في وضع التطوير
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    const ignoredErrors = [
      'Missing or insufficient permissions',
      'FirebaseError: Missing or insufficient permissions',
      'Error logging security event'
    ];
    const shouldIgnore = ignoredErrors.some(error => message.includes(error));
    if (!shouldIgnore) {
      originalError.apply(console, args);
    }
  };
}

interface PlanFeature {
  id: string;
  name: string;
  included: boolean;
  limit?: number;
  description?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // بالأيام
  features: PlanFeature[];
  isActive: boolean;
  isFeatured: boolean;
  color: string;
  icon: string;
  maxUsers?: number;
  maxStorage?: number; // بالMB
  supportLevel: 'basic' | 'premium' | 'priority';
  createdAt: any;
  updatedAt: any;
}

interface EditingPlan extends Omit<SubscriptionPlan, 'createdAt' | 'updatedAt'> {
  id?: string;
}

// تم إزالة الميزات الافتراضية - سيعتمد النظام على البيانات الحقيقية فقط
// const defaultFeatures: PlanFeature[] = [
//   { id: 'profile_creation', name: 'إنشاء ملف شخصي', included: true },
//   { id: 'player_search', name: 'البحث عن اللاعبين', included: true },
//   { id: 'messaging', name: 'نظام المراسلة', included: false },
//   { id: 'advanced_analytics', name: 'التحليلات المتقدمة', included: false },
//   { id: 'video_upload', name: 'رفع الفيديوهات', included: false, limit: 5 },
//   { id: 'priority_support', name: 'الدعم الفني الأولوي', included: false },
//   { id: 'api_access', name: 'وصول للـ API', included: false },
//   { id: 'white_label', name: 'العلامة التجارية المخصصة', included: false },
//   { id: 'bulk_operations', name: 'العمليات المجمعة', included: false },
//   { id: 'export_data', name: 'تصدير البيانات', included: false }
// ];

export default function SubscriptionPlansManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<EditingPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const plansQuery = query(
        collection(db, 'subscription_plans'), 
        orderBy('price', 'asc')
      );
      const snapshot = await getDocs(plansQuery);
      
      if (snapshot.empty) {
        // إنشاء خطط افتراضية إذا لم توجد
        await createDefaultPlans();
        return;
      }
      
      const plansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // تصحيح القيم المفقودة أو undefined
        isActive: doc.data().isActive ?? true,
        isFeatured: doc.data().isFeatured ?? false,
        features: Array.isArray(doc.data().features) ? doc.data().features : []
      })) as SubscriptionPlan[];
      
      console.log('📦 تم جلب الباقات في صفحة الإدمن:', plansData);
      console.log(`💼 إجمالي الباقات: ${plansData.length}`);
      plansData.forEach(plan => {
        console.log(`📋 ${plan.name}: ${plan.price} ${plan.currency} - نشطة: ${plan.isActive} - مميزة: ${plan.isFeatured}`);
      });
      
      setPlans(plansData);
    } catch (error) {
      console.error('خطأ في جلب الخطط:', error);
      // إنشاء خطط افتراضية في حالة الخطأ
      createDefaultPlans();
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPlans = async () => {
    // إزالة إنشاء الخطط الافتراضية - لا نريد قيم وهمية
    console.log('لا توجد خطط في قاعدة البيانات. يمكنك إنشاء خطط جديدة حسب احتياجاتك.');
    setPlans([]);
  };

  const startEditing = (plan: SubscriptionPlan) => {
    setEditingPlan({
      id: plan.id,
      name: plan.name,
      nameEn: plan.nameEn,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      duration: plan.duration,
      features: Array.isArray(plan.features) ? [...plan.features] : [],
      isActive: plan.isActive,
      isFeatured: plan.isFeatured,
      color: plan.color,
      icon: plan.icon,
      maxUsers: plan.maxUsers,
      maxStorage: plan.maxStorage,
      supportLevel: plan.supportLevel
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const startCreating = () => {
    setEditingPlan({
      name: '',
      nameEn: '',
      description: 'باقة اشتراك مميزة مع مجموعة من الخدمات',
      price: 50,
      currency: 'USD',
      duration: 30,
      features: [
        {
          id: Date.now().toString(),
          name: 'إنشاء ملف شخصي احترافي',
          included: true,
          description: 'ملف شخصي كامل مع جميع البيانات'
        },
        {
          id: (Date.now() + 1).toString(),
          name: 'دعم فني مميز',
          included: true,
          description: 'دعم فني سريع ومتخصص'
        }
      ],
      isActive: true, // تأكد من أن الباقة نشطة افتراضياً
      isFeatured: false,
      color: 'blue',
      icon: 'Package',
      maxUsers: 1,
      maxStorage: 100,
      supportLevel: 'basic'
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditingPlan(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const savePlan = async () => {
    if (!editingPlan) return;
    
    // التأكد من وجود features صحيحة
    const safePlan = {
      ...editingPlan,
      features: Array.isArray(editingPlan.features) ? editingPlan.features : []
    };
    
    setSaving(true);
    try {
      if (isCreating) {
        // إنشاء خطة جديدة
        const { id, ...planDataToCreate } = safePlan;
        
        console.log('🆕 إنشاء باقة جديدة:', planDataToCreate);
        console.log(`📋 الاسم: ${planDataToCreate.name}`);
        console.log(`💰 السعر: ${planDataToCreate.price} ${planDataToCreate.currency}`);
        console.log(`✅ نشطة: ${planDataToCreate.isActive}`);
        
        const docRef = await addDoc(collection(db, 'subscription_plans'), {
          ...planDataToCreate,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const newPlan: SubscriptionPlan = {
          id: docRef.id,
          ...safePlan,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('✅ تم حفظ الباقة بنجاح مع ID:', docRef.id);
        setPlans(prev => [...prev, newPlan]);
      } else {
        // تحديث خطة موجودة
        if (!safePlan.id) return;
        
        const planId = safePlan.id;
        const planIndex = plans.findIndex(p => p.id === planId);
        if (planIndex === -1) return;
        
        console.log('🔄 تحديث باقة موجودة:', planId);
        console.log(`📋 الاسم الجديد: ${safePlan.name}`);
        console.log(`💰 السعر الجديد: ${safePlan.price} ${safePlan.currency}`);
        console.log(`✅ نشطة: ${safePlan.isActive}`);
        
        const { id, ...planDataToUpdate } = safePlan;
        await updateDoc(doc(db, 'subscription_plans', planId), {
          ...planDataToUpdate,
          updatedAt: new Date()
        });
        
        const updatedPlan: SubscriptionPlan = {
          id: planId,
          ...safePlan,
          createdAt: plans[planIndex].createdAt,
          updatedAt: new Date()
        };
        
        console.log('✅ تم تحديث الباقة بنجاح');
        setPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
      }
      
      cancelEditing();
    } catch (error) {
      console.error('خطأ في حفظ الخطة:', error);
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async () => {
    if (!planToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'subscription_plans', planToDelete.id));
      setPlans(prev => prev.filter(p => p.id !== planToDelete.id));
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error('خطأ في حذف الخطة:', error);
    }
  };

  const duplicatePlan = async (plan: SubscriptionPlan, newDuration?: number) => {
    try {
      // تحديد المدة الجديدة بناءً على المدة الحالية أو المدة المحددة
      let duration = newDuration || plan.duration;
      let durationText = '';
      
      if (newDuration) {
        // إذا تم تحديد مدة جديدة، نستخدمها مع النص المناسب
        switch (newDuration) {
          case 30: durationText = ' (شهر)'; break;
          case 90: durationText = ' (3 أشهر)'; break;
          case 180: durationText = ' (6 أشهر)'; break;
          case 365: durationText = ' (سنة)'; break;
          default: durationText = ` (${newDuration} يوم)`;
        }
      } else {
        // إذا لم يتم تحديد مدة، نجرب تغيير المدة تلقائياً
        if (plan.duration === 30) duration = 90; // من شهر إلى 3 أشهر
        else if (plan.duration === 90) duration = 180; // من 3 أشهر إلى 6 أشهر
        else if (plan.duration === 180) duration = 365; // من 6 أشهر إلى سنة
        else if (plan.duration === 365) duration = 30; // من سنة إلى شهر
        else duration = 30; // أي مدة أخرى تصبح شهر
        
        switch (duration) {
          case 30: durationText = ' (شهر)'; break;
          case 90: durationText = ' (3 أشهر)'; break;
          case 180: durationText = ' (6 أشهر)'; break;
          case 365: durationText = ' (سنة)'; break;
          default: durationText = ` (${duration} يوم)`;
        }
      }
      
      const duplicatedPlan = {
        ...plan,
        name: plan.name + durationText,
        nameEn: plan.nameEn + ` (${duration}D)`,
        duration: duration,
        isActive: false,
        features: Array.isArray(plan.features) ? [...plan.features] : []
      };
      delete (duplicatedPlan as any).id;
      delete (duplicatedPlan as any).createdAt;
      delete (duplicatedPlan as any).updatedAt;
      
      const docRef = await addDoc(collection(db, 'subscription_plans'), {
        ...duplicatedPlan,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const newPlan: SubscriptionPlan = {
        id: docRef.id,
        ...duplicatedPlan,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setPlans(prev => [...prev, newPlan]);
    } catch (error) {
      console.error('خطأ في نسخ الخطة:', error);
    }
  };

  const updateFeature = (featureId: string, updates: Partial<PlanFeature>) => {
    if (!editingPlan || !Array.isArray(editingPlan.features)) return;
    
    setEditingPlan(prev => ({
      ...prev!,
      features: prev!.features.map(f => 
        f.id === featureId ? { ...f, ...updates } : f
      )
    }));
  };

  const getPlanIcon = (iconName: string) => {
    switch (iconName) {
      case 'Package': return <Package className="w-5 h-5" />;
      case 'Star': return <Star className="w-5 h-5" />;
      case 'Crown': return <Crown className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getPlanColor = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      case 'gold': return 'from-yellow-500 to-yellow-600';
      case 'green': return 'from-green-500 to-green-600';
      case 'red': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDurationText = (duration: number) => {
    switch (duration) {
      case 30: return 'شهر';
      case 90: return '3 أشهر';
      case 180: return '6 أشهر';
      case 365: return 'سنة';
      default: return `${duration} يوم`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <SimpleLoader size="large" color="blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة خطط الاشتراك</h1>
          <p className="text-gray-500 mt-2">إنشاء وتعديل خطط الاشتراك وأسعارها وميزاتها</p>
        </div>
        <Button onClick={startCreating} disabled={isEditing}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة خطة جديدة
        </Button>
      </div>

      {/* Editing Form */}
      {isEditing && editingPlan && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {isCreating ? 'إنشاء خطة جديدة' : 'تعديل الخطة'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الخطة (بالعربية)</Label>
                <Input
                  id="name"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan(prev => ({ ...prev!, name: e.target.value }))}
                  placeholder="مثل: الباقة الأساسية"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nameEn">اسم الخطة (بالإنجليزية)</Label>
                <Input
                  id="nameEn"
                  value={editingPlan.nameEn}
                  onChange={(e) => setEditingPlan(prev => ({ ...prev!, nameEn: e.target.value }))}
                  placeholder="e.g: Basic Plan"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">السعر</Label>
                <div className="flex gap-2">
                  <Input
                    id="price"
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan(prev => ({ ...prev!, price: Number(e.target.value) }))}
                    placeholder="299"
                  />
                  <select
                    value={editingPlan.currency}
                    onChange={(e) => setEditingPlan(prev => ({ ...prev!, currency: e.target.value }))}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="USD">دولار أمريكي</option>
                    <option value="EGP">جنيه مصري</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">المدة</Label>
                <div className="flex gap-2">
                  <select
                    value={editingPlan.duration}
                    onChange={(e) => setEditingPlan(prev => ({ ...prev!, duration: Number(e.target.value) }))}
                    className="flex-1 px-3 py-2 border rounded-md"
                  >
                    <option value={30}>شهر واحد (30 يوم)</option>
                    <option value={90}>3 أشهر (90 يوم)</option>
                    <option value={180}>6 أشهر (180 يوم)</option>
                    <option value={365}>سنة كاملة (365 يوم)</option>
                  </select>
                  <Input
                    type="number"
                    value={editingPlan.duration}
                    onChange={(e) => setEditingPlan(prev => ({ ...prev!, duration: Number(e.target.value) }))}
                    placeholder="أيام"
                    className="w-20"
                    min="1"
                    title="تخصيص المدة بالأيام"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxUsers">عدد المستخدمين المسموح</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={editingPlan.maxUsers || 1}
                  onChange={(e) => setEditingPlan(prev => ({ ...prev!, maxUsers: Number(e.target.value) }))}
                  placeholder="1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxStorage">مساحة التخزين (MB)</Label>
                <Input
                  id="maxStorage"
                  type="number"
                  value={editingPlan.maxStorage || 100}
                  onChange={(e) => setEditingPlan(prev => ({ ...prev!, maxStorage: Number(e.target.value) }))}
                  placeholder="100"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={editingPlan.description}
                onChange={(e) => setEditingPlan(prev => ({ ...prev!, description: e.target.value }))}
                placeholder="وصف مختصر للخطة وما تتضمنه من ميزات"
                rows={3}
              />
            </div>
            
            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">لون الخطة</Label>
                <select
                  value={editingPlan.color}
                  onChange={(e) => setEditingPlan(prev => ({ ...prev!, color: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="blue">أزرق</option>
                  <option value="purple">بنفسجي</option>
                  <option value="gold">ذهبي</option>
                  <option value="green">أخضر</option>
                  <option value="red">أحمر</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">أيقونة الخطة</Label>
                <select
                  value={editingPlan.icon}
                  onChange={(e) => setEditingPlan(prev => ({ ...prev!, icon: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Package">حزمة</option>
                  <option value="Star">نجمة</option>
                  <option value="Crown">تاج</option>
                  <option value="Zap">برق</option>
                  <option value="Shield">درع</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supportLevel">مستوى الدعم</Label>
                <select
                  value={editingPlan.supportLevel}
                  onChange={(e) => setEditingPlan(prev => ({ ...prev!, supportLevel: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="basic">أساسي</option>
                  <option value="premium">مميز</option>
                  <option value="priority">أولوية</option>
                </select>
              </div>
            </div>
            
            {/* Switches */}
            <div className="flex gap-6">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="isActive"
                  checked={editingPlan.isActive}
                  onCheckedChange={(checked) => setEditingPlan(prev => ({ ...prev!, isActive: checked }))}
                />
                <Label htmlFor="isActive">الخطة نشطة</Label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="isFeatured"
                  checked={editingPlan.isFeatured}
                  onCheckedChange={(checked) => setEditingPlan(prev => ({ ...prev!, isFeatured: checked }))}
                />
                <Label htmlFor="isFeatured">خطة مميزة</Label>
              </div>
            </div>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">الميزات المتضمنة</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!Array.isArray(editingPlan.features)) return;
                    const newFeature: PlanFeature = {
                      id: Date.now().toString(),
                      name: 'ميزة جديدة',
                      included: true,
                      description: ''
                    };
                    setEditingPlan(prev => ({
                      ...prev!,
                      features: [...prev!.features, newFeature]
                    }));
                  }}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة ميزة
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(editingPlan.features) ? editingPlan.features.map((feature) => (
                  <div key={feature.id} className="p-3 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Switch
                        checked={feature.included}
                        onCheckedChange={(checked) => updateFeature(feature.id, { included: checked })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPlan(prev => ({
                            ...prev!,
                            features: prev!.features.filter(f => f.id !== feature.id)
                          }));
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        value={feature.name}
                        onChange={(e) => updateFeature(feature.id, { name: e.target.value })}
                        placeholder="اسم الميزة"
                        className="font-medium"
                      />
                      <Input
                        value={feature.description || ''}
                        onChange={(e) => updateFeature(feature.id, { description: e.target.value })}
                        placeholder="وصف الميزة (اختياري)"
                        className="text-sm"
                      />
                    </div>
                    
                    {feature.included && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">حد أقصى:</label>
                        <Input
                          type="number"
                          value={feature.limit || ''}
                          onChange={(e) => updateFeature(feature.id, { limit: e.target.value ? Number(e.target.value) : undefined })}
                          placeholder="غير محدود"
                          className="w-24"
                          min="0"
                        />
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="col-span-full text-center p-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="space-y-2">
                      <p className="text-lg font-medium">لا توجد ميزات للخطة</p>
                      <p className="text-sm">اضغط على "إضافة ميزة" لإضافة الميزات التي تناسب خطتك</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEditing}>
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
              <Button onClick={savePlan} disabled={saving}>
                <Save className="w-4 h-4 ml-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.isFeatured ? 'ring-2 ring-purple-500' : ''}`}>
            {plan.isFeatured && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white">الأكثر شعبية</Badge>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-full bg-gradient-to-r ${getPlanColor(plan.color)} text-white`}>
                  {getPlanIcon(plan.icon)}
                </div>
                <div className="flex items-center gap-2">
                  {!plan.isActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, 'subscription_plans', plan.id), {
                            isActive: true,
                            updatedAt: new Date()
                          });
                          setPlans(prev => prev.map(p => 
                            p.id === plan.id ? { ...p, isActive: true } : p
                          ));
                        } catch (error) {
                          console.error('خطأ في تفعيل الباقة:', error);
                        }
                      }}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      تفعيل
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => startEditing(plan)}>
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل
                      </DropdownMenuItem>
                      
                      {/* خيارات النسخ بمدد مختلفة */}
                      <DropdownMenuItem onClick={() => duplicatePlan(plan, 30)}>
                        <Copy className="w-4 h-4 ml-2" />
                        نسخ (شهر واحد)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicatePlan(plan, 90)}>
                        <Copy className="w-4 h-4 ml-2" />
                        نسخ (3 أشهر)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicatePlan(plan, 180)}>
                        <Copy className="w-4 h-4 ml-2" />
                        نسخ (6 أشهر)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicatePlan(plan, 365)}>
                        <Copy className="w-4 h-4 ml-2" />
                        نسخ (سنة كاملة)
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => {
                          setPlanToDelete(plan);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div>
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  {!plan.isActive && <Badge variant="secondary">غير نشط</Badge>}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </div>
              
              <div className="text-3xl font-bold">
                {plan.price} {plan.currency}
                <span className="text-sm font-normal text-gray-500">/{getDurationText(plan.duration)}</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">المدة:</span>
                    <span className="font-medium ml-1">{getDurationText(plan.duration)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">المستخدمين:</span>
                    <span className="font-medium ml-1">{plan.maxUsers}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">التخزين:</span>
                    <span className="font-medium ml-1">{plan.maxStorage} MB</span>
                  </div>
                  <div>
                    <span className="text-gray-500">الدعم:</span>
                    <span className="font-medium ml-1">
                      {plan.supportLevel === 'basic' ? 'أساسي' :
                       plan.supportLevel === 'premium' ? 'مميز' : 'أولوية'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">الميزات المتضمنة:</h4>
                  <div className="space-y-1">
                    {Array.isArray(plan.features) ? plan.features.filter(f => f.included).slice(0, 5).map((feature) => (
                      <div key={feature.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{feature.name}</span>
                        {feature.limit && <span className="text-gray-500">({feature.limit})</span>}
                      </div>
                    )) : (
                      <div className="text-sm text-gray-500">لا توجد ميزات محددة</div>
                    )}
                    {Array.isArray(plan.features) && plan.features.filter(f => f.included).length > 5 && (
                      <div className="text-sm text-gray-500">
                        +{plan.features.filter(f => f.included).length - 5} ميزة أخرى
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف خطة "{planToDelete?.name}"؟ 
              هذا الإجراء لا يمكن التراجع عنه وقد يؤثر على المستخدمين المشتركين.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={deletePlan} variant="destructive">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 
