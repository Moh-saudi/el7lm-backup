'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminFooter from '@/components/layout/AdminFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Upload, Camera } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/config';

export default function AdminProfile() {
  const { user, userData, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    avatar: userData?.avatar || ''
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      
      // إنشاء اسم فريد للملف
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `admin-avatars/${user.uid}/${timestamp}.${fileExt}`;

      console.log('🚀 بدء رفع صورة المدير:', {
        bucket: 'profile-images',
        filePath,
        fileSize: file.size,
        fileType: file.type
      });

      // رفع الملف إلى Supabase
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('❌ خطأ في رفع الصورة:', error);
        throw new Error(`فشل في رفع الصورة: ${error.message}`);
      }

      // الحصول على الرابط العام
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('فشل في الحصول على رابط الصورة');
      }

      console.log('✅ تم رفع الصورة بنجاح:', urlData.publicUrl);
      
      setFormData(prev => ({ ...prev, avatar: urlData.publicUrl }));
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في رفع الصورة:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        name: formData.name,
        phone: formData.phone,
        avatar: formData.avatar,
        updatedAt: new Date()
      });

      await refreshUserData();
      setIsEditing(false);
      toast.success('تم تحديث البيانات بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('حدث خطأ أثناء تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50">
      <AdminHeader />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>الملف الشخصي</CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={formData.avatar || userData?.avatar} />
                      <AvatarFallback>
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute bottom-0 right-0 p-1 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600"
                      >
                        <Camera className="w-4 h-4" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-lg">{userData?.name || 'مدير النظام'}</h3>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label>الاسم</Label>
                    <div className="relative">
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="pr-10"
                        placeholder="الاسم الكامل"
                      />
                      <User className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label>البريد الإلكتروني</Label>
                    <div className="relative">
                      <Input
                        value={user?.email || ''}
                        disabled
                        className="pr-10"
                      />
                      <Mail className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label>رقم الهاتف</Label>
                    <div className="relative">
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="pr-10"
                        placeholder="رقم الهاتف"
                      />
                      <Phone className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 pt-4">
                  {isEditing ? (
                    <>
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                      >
                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: userData?.name || '',
                            phone: userData?.phone || '',
                            avatar: userData?.avatar || ''
                          });
                        }}
                        disabled={loading}
                      >
                        إلغاء
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      تعديل البيانات
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
} 
