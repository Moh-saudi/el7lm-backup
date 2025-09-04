'use client';

import React, { useState } from 'react';
import ResponsiveLayoutWrapper from '@/components/layout/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Star, 
  ShoppingCart, 
  Download, 
  Upload, 
  Settings, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  Building,
  GraduationCap,
  Target,
  Briefcase,
  Shield,
  Crown,
  Zap,
  TrendingUp,
  Award,
  Trophy,
  Medal,
  Sparkles,
  Bolt,
  Flame
} from 'lucide-react';

const TestUIComponents = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    category: '',
    priority: 'medium',
    notifications: true,
    theme: 'light',
    rating: 3,
    progress: 65
  });

  const [showPassword, setShowPassword] = useState(false);
  const [selectedTab, setSelectedTab] = useState('buttons');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const accountTypes = [
    { id: 'player', name: 'لاعب', icon: User, color: 'bg-blue-500', emoji: '⚽' },
    { id: 'club', name: 'نادي', icon: Building, color: 'bg-green-500', emoji: '🏢' },
    { id: 'admin', name: 'مدير', icon: Shield, color: 'bg-red-500', emoji: '👑' },
    { id: 'agent', name: 'وكيل', icon: Briefcase, color: 'bg-orange-500', emoji: '💼' },
    { id: 'academy', name: 'أكاديمية', icon: GraduationCap, color: 'bg-indigo-500', emoji: '🎓' },
    { id: 'trainer', name: 'مدرب', icon: Target, color: 'bg-pink-500', emoji: '🎯' }
  ];

  const buttonVariants = [
    { variant: 'default', label: 'زر افتراضي', icon: Heart },
    { variant: 'destructive', label: 'زر خطير', icon: X },
    { variant: 'outline', label: 'زر إطار', icon: Download },
    { variant: 'secondary', label: 'زر ثانوي', icon: Settings },
    { variant: 'ghost', label: 'زر شفاف', icon: User },
    { variant: 'link', label: 'زر رابط', icon: ArrowRight }
  ];

  const cardData = [
    {
      title: 'إحصائيات اللاعب',
      description: 'معلومات شاملة عن أداء اللاعب',
      icon: Trophy,
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      stats: { matches: 45, goals: 23, assists: 12 }
    },
    {
      title: 'أداء النادي',
      description: 'إحصائيات النادي في الموسم الحالي',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-green-400 to-blue-500',
      stats: { wins: 28, draws: 8, losses: 4 }
    },
    {
      title: 'إدارة الأكاديمية',
      description: 'إدارة شاملة للأكاديمية والمدربين',
      icon: GraduationCap,
      color: 'bg-gradient-to-br from-purple-400 to-pink-500',
      stats: { students: 156, coaches: 12, courses: 24 }
    }
  ];

  return (
    <ResponsiveLayoutWrapper
      accountType="admin"
      showSidebar={true}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">اختبار المكونات الجمالية</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            صفحة شاملة لاختبار جميع المكونات الجمالية والمتجاوبة مع تصميم عصري ومتجاوب
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              🎨 تصميم جمالي
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              📱 متجاوب مع الموبايل
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              ⚡ مكونات تفاعلية
            </Badge>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="buttons">الأزرار</TabsTrigger>
            <TabsTrigger value="forms">النماذج</TabsTrigger>
            <TabsTrigger value="cards">الكروت</TabsTrigger>
            <TabsTrigger value="inputs">الحقول</TabsTrigger>
            <TabsTrigger value="dropdowns">القوائم</TabsTrigger>
            <TabsTrigger value="feedback">التفاعل</TabsTrigger>
          </TabsList>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  أزرار تفاعلية جمالية
                </CardTitle>
                <CardDescription>
                  مجموعة متنوعة من الأزرار الجمالية والمتجاوبة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Button Variants */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">أنواع الأزرار</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {buttonVariants.map((btn) => {
                      const IconComponent = btn.icon;
                      return (
                        <Button key={btn.variant} variant={btn.variant as any} className="w-full">
                          <IconComponent className="w-4 h-4 mr-2" />
                          {btn.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Special Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">أزرار خاصة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg">
                      <Sparkles className="w-4 h-4 mr-2" />
                      زر متدرج
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg">
                      <Bolt className="w-4 h-4 mr-2" />
                      زر كهربائي
                    </Button>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg">
                      <Flame className="w-4 h-4 mr-2" />
                      زر ناري
                    </Button>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg">
                      <Award className="w-4 h-4 mr-2" />
                      زر متميز
                    </Button>
                  </div>
                </div>

                {/* Mobile-Friendly Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">أزرار مناسبة للموبايل</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button size="lg" className="h-16 text-lg">
                      <ShoppingCart className="w-6 h-6 mr-2" />
                      شراء
                    </Button>
                    <Button size="lg" variant="outline" className="h-16 text-lg">
                      <Heart className="w-6 h-6 mr-2" />
                      إعجاب
                    </Button>
                    <Button size="lg" variant="secondary" className="h-16 text-lg">
                      <Star className="w-6 h-6 mr-2" />
                      تقييم
                    </Button>
                    <Button size="lg" variant="destructive" className="h-16 text-lg">
                      <X className="w-6 h-6 mr-2" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  نماذج تفاعلية
                </CardTitle>
                <CardDescription>
                  نماذج جمالية مع حقول متقدمة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">المعلومات الشخصية</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="أدخل اسمك الكامل"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="example@email.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+966 50 123 4567"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">التفضيلات</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>الفئة</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="اختر الفئة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="player">لاعب</SelectItem>
                            <SelectItem value="coach">مدرب</SelectItem>
                            <SelectItem value="admin">مدير</SelectItem>
                            <SelectItem value="fan">مشجع</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>الأولوية</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="low"
                              name="priority"
                              value="low"
                              checked={formData.priority === 'low'}
                              onChange={(e) => handleInputChange('priority', e.target.value)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                              aria-label="أولوية منخفضة"
                            />
                            <Label htmlFor="low">منخفضة</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="medium"
                              name="priority"
                              value="medium"
                              checked={formData.priority === 'medium'}
                              onChange={(e) => handleInputChange('priority', e.target.value)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                              aria-label="أولوية متوسطة"
                            />
                            <Label htmlFor="medium">متوسطة</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="high"
                              name="priority"
                              value="high"
                              checked={formData.priority === 'high'}
                              onChange={(e) => handleInputChange('priority', e.target.value)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                              aria-label="أولوية عالية"
                            />
                            <Label htmlFor="high">عالية</Label>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notifications"
                          checked={formData.notifications}
                          onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                        />
                        <Label htmlFor="notifications">تفعيل الإشعارات</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">رسالة</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    حفظ
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  كروت جمالية
                </CardTitle>
                <CardDescription>
                  كروت تفاعلية مع تصميم عصري
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cardData.map((card, index) => {
                    const IconComponent = card.icon;
                    return (
                      <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className={`${card.color} p-6 text-white`}>
                          <div className="flex items-center justify-between">
                            <IconComponent className="w-8 h-8" />
                            <Badge variant="secondary" className="bg-white/20 text-white">
                              {card.emoji}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold mt-4">{card.title}</h3>
                          <p className="text-white/80 mt-2">{card.description}</p>
                        </div>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            {Object.entries(card.stats).map(([key, value]) => (
                              <div key={key}>
                                <div className="text-2xl font-bold text-gray-900">{value}</div>
                                <div className="text-sm text-gray-600 capitalize">{key}</div>
                              </div>
                            ))}
                          </div>
                          <Button className="w-full mt-4">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            عرض التفاصيل
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inputs Tab */}
          <TabsContent value="inputs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-500" />
                  حقول إدخال متقدمة
                </CardTitle>
                <CardDescription>
                  حقول جمالية مع ميزات متقدمة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Search Input */}
                  <div>
                    <Label htmlFor="search">البحث</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="search"
                        placeholder="ابحث عن لاعب، نادي، أو أكاديمية..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <Label htmlFor="password">كلمة المرور</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="أدخل كلمة المرور"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Slider and Progress */}
                <div className="space-y-4">
                  <div>
                    <Label>التقييم: {formData.rating}/5</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInputChange('rating', star)}
                          className="p-1"
                        >
                          <Star className={`w-5 h-5 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>التقدم: {formData.progress}%</Label>
                    <Progress value={formData.progress} className="mt-2" />
                  </div>

                  <div>
                    <Label>الحجم</Label>
                    <Slider
                      value={[formData.progress]}
                      onValueChange={(value) => handleInputChange('progress', value[0])}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dropdowns Tab */}
          <TabsContent value="dropdowns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-orange-500" />
                  قوائم منسدلة
                </CardTitle>
                <CardDescription>
                  قوائم منسدلة تفاعلية وجمالية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Account Type Selector */}
                  <div>
                    <Label>نوع الحساب</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر نوع الحساب" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => {
                          const IconComponent = type.icon;
                          return (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${type.color}`}></div>
                                <IconComponent className="w-4 h-4" />
                                <span>{type.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <Label>ترتيب حسب</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر الترتيب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">
                          <div className="flex items-center gap-2">
                            <SortAsc className="w-4 h-4" />
                            الاسم (أ-ي)
                          </div>
                        </SelectItem>
                        <SelectItem value="name-desc">
                          <div className="flex items-center gap-2">
                            <SortDesc className="w-4 h-4" />
                            الاسم (ي-أ)
                          </div>
                        </SelectItem>
                        <SelectItem value="date-asc">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            التاريخ (أقدم)
                          </div>
                        </SelectItem>
                        <SelectItem value="date-desc">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            التاريخ (أحدث)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Theme Selector */}
                  <div>
                    <Label>المظهر</Label>
                    <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">فاتح</SelectItem>
                        <SelectItem value="dark">داكن</SelectItem>
                        <SelectItem value="auto">تلقائي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Accordion Example */}
                <div>
                  <Label className="text-lg font-semibold">معلومات إضافية</Label>
                  <Accordion type="single" collapsible className="mt-2">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>معلومات الاتصال</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>contact@example.com</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>+966 50 123 4567</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>الرياض، المملكة العربية السعودية</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>الإعدادات المتقدمة</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>الإشعارات الفورية</span>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>الوضع الليلي</span>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>اللغة العربية</span>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-yellow-500" />
                  عناصر التفاعل
                </CardTitle>
                <CardDescription>
                  عناصر تفاعلية للتعليقات والتقييمات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alerts */}
                <div className="space-y-3">
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      تم حفظ البيانات بنجاح! يمكنك الآن متابعة العمل.
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-orange-200 bg-orange-50 text-orange-800">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      تحذير: يرجى مراجعة البيانات قبل الإرسال.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Interactive Elements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">أزرار التفاعل</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-1" />
                        إضافة
                      </Button>
                      <Button size="sm" variant="outline">
                        <Minus className="w-4 h-4 mr-1" />
                        إزالة
                      </Button>
                      <Button size="sm" variant="outline">
                        <Upload className="w-4 h-4 mr-1" />
                        رفع
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        تحميل
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">أيقونات الحالة</h3>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        نشط
                      </Badge>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        <X className="w-3 h-3 mr-1" />
                        معطل
                      </Badge>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        معلق
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Star className="w-3 h-3 mr-1" />
                        مميز
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* User Avatar Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">أفاتار المستخدم</h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="/default-avatar.png" alt="User" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                        أ ح
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">أحمد محمد</h4>
                      <p className="text-sm text-gray-600">مدير النظام</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">4.8 (120 تقييم)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveLayoutWrapper>
  );
};

export default TestUIComponents;
