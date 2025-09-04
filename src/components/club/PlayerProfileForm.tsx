import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { PlayerFormData } from '@/types/player';
// ... import other needed UI components and types

interface PlayerProfileFormProps {
  clubId: string;
  onSuccess?: () => void;
  initialData?: Partial<PlayerFormData>;
}

const defaultData: PlayerFormData = {
  full_name: '',
  birth_date: undefined,
  nationality: '',
  city: '',
  country: '',
  phone: '',
  whatsapp: '',
  email: '',
  brief: '',
  education_level: '',
  graduation_year: '',
  degree: '',
  english_level: '',
  arabic_level: '',
  spanish_level: '',
  blood_type: '',
  height: '',
  weight: '',
  chronic_conditions: false,
  chronic_details: '',
  injuries: [],
  surgeries: [],
  allergies: '',
  medical_notes: '',
  primary_position: '',
  secondary_position: '',
  preferred_foot: '',
  club_history: [],
  experience_years: '',
  sports_notes: '',
  technical_skills: {},
  physical_skills: {},
  social_skills: {},
  objectives: {
    professional: false,
    trials: false,
    local_leagues: false,
    arab_leagues: false,
    european_leagues: false,
    training: false,
    other: '',
  },
  profile_image: undefined,
  additional_images: [],
  videos: [],
  training_courses: [],
  has_passport: 'no',
  ref_source: '',
  contract_history: [],
  agent_history: [],
  official_contact: {
    name: '',
    title: '',
    phone: '',
    email: '',
  },
  currently_contracted: 'no',
  achievements: [],
  medical_history: {
    blood_type: '',
    chronic_conditions: [],
    allergies: [],
    injuries: [],
    last_checkup: '',
  },
  current_club: '',
  previous_clubs: [],
  documents: [],
  updated_at: new Date(),
  subscription_end: undefined,
  profile_image_url: '',
  subscription_status: '',
  subscription_type: '',
};

export default function PlayerProfileForm({ clubId = '', onSuccess, initialData }: PlayerProfileFormProps) {
  if (!clubId) return <div className="text-red-500">لا يوجد معرف النادي</div>;
  const [data, setData] = useState<PlayerFormData>({ ...defaultData, ...initialData });
  const [tab, setTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.full_name) {
      newErrors.full_name = 'الاسم الكامل مطلوب';
    }
    if (!data.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    if (!data.phone) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'clubs', clubId, 'players'), {
        ...data,
        updated_at: new Date(),
      });
      setLoading(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      console.error('Error saving player:', err);
      // TODO: Show error toast
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-4 gap-2">
          <TabsTrigger value="personal">المعلومات الشخصية</TabsTrigger>
          <TabsTrigger value="sports">المعلومات الرياضية</TabsTrigger>
          <TabsTrigger value="education">التعليم</TabsTrigger>
          <TabsTrigger value="medical">السجل الطبي</TabsTrigger>
          <TabsTrigger value="skills">المهارات</TabsTrigger>
          <TabsTrigger value="objectives">الأهداف</TabsTrigger>
          <TabsTrigger value="media">الوسائط</TabsTrigger>
          <TabsTrigger value="contracts">العقود</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <Input
                id="full_name"
                value={data.full_name}
                onChange={e => setData(d => ({ ...d, full_name: e.target.value }))}
                className={errors.full_name ? 'border-red-500' : ''}
              />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={e => setData(d => ({ ...d, email: e.target.value }))}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={e => setData(d => ({ ...d, phone: e.target.value }))}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">واتساب</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={data.whatsapp}
                onChange={e => setData(d => ({ ...d, whatsapp: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">تاريخ الميلاد</Label>
              <Input
                id="birth_date"
                type="date"
                value={data.birth_date ? new Date(data.birth_date).toISOString().split('T')[0] : ''}
                onChange={e => setData(d => ({ ...d, birth_date: e.target.value ? new Date(e.target.value) : undefined }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">الجنسية</Label>
              <Input
                id="nationality"
                value={data.nationality}
                onChange={e => setData(d => ({ ...d, nationality: e.target.value }))}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_position">المركز الأساسي</Label>
              <Input
                id="primary_position"
                value={data.primary_position}
                onChange={e => setData(d => ({ ...d, primary_position: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_position">المركز الثانوي</Label>
              <Input
                id="secondary_position"
                value={data.secondary_position}
                onChange={e => setData(d => ({ ...d, secondary_position: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_foot">القدم المفضلة</Label>
              <Select
                value={data.preferred_foot}
                onValueChange={value => setData(d => ({ ...d, preferred_foot: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القدم المفضلة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right">يمين</SelectItem>
                  <SelectItem value="left">يسار</SelectItem>
                  <SelectItem value="both">كلاهما</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Add other tab contents similarly */}
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSuccess}
          disabled={loading}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
} 
