'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Settings, 
  FolderOpen, 
  BarChart3,
  Plus,
  Users,
  BookOpen,
  Megaphone
} from 'lucide-react';
import Link from 'next/link';
import { AccountTypeProtection } from '@/hooks/useAccountTypeAuth';

export default function AdminDreamAcademyPage() {
  const adminSections = [
    {
      title: "إدارة الفيديوهات",
      description: "إضافة وتحرير وحذف فيديوهات الأكاديمية",
      icon: Video,
      href: "/dashboard/admin/dream-academy/videos",
      color: "bg-blue-500",
      badge: "إدارة المحتوى"
    },
    {
      title: "إدارة الفئات",
      description: "تنظيم وتصنيف محتوى الأكاديمية",
      icon: FolderOpen,
      href: "/dashboard/admin/dream-academy/categories",
      color: "bg-green-500",
      badge: "التنظيم"
    },
    {
      title: "إعدادات الأكاديمية",
      description: "تكوين إعدادات الأكاديمية العامة",
      icon: Settings,
      href: "/dashboard/admin/dream-academy/settings",
      color: "bg-purple-500",
      badge: "الإعدادات"
    },
    {
      title: "إدارة الإعلانات",
      description: "إدارة الإعلانات المعروضة على صفحة الترحيب",
      icon: Megaphone,
      href: "/dashboard/admin/ads",
      color: "bg-orange-500",
      badge: "الإعلانات"
    }
  ];

  const stats = [
    {
      title: "إجمالي الفيديوهات",
      value: "0",
      icon: Video,
      color: "text-blue-600"
    },
    {
      title: "الفئات النشطة",
      value: "0",
      icon: FolderOpen,
      color: "text-green-600"
    },
    {
      title: "المشاهدات",
      value: "0",
      icon: BarChart3,
      color: "text-purple-600"
    }
  ];

  return (
    <AccountTypeProtection allowedTypes={['admin']}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة أكاديمية الحلم</h1>
                <p className="text-gray-600 mt-1">مركز إدارة محتوى وتكوين أكاديمية الحلم</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gray-100`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Admin Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section, index) => (
              <Link key={index} href={section.href}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${section.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                        <section.icon className={`h-6 w-6 ${section.color.replace('bg-', 'text-')}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {section.badge}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {section.description}
                    </CardDescription>
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                      <span>إدارة</span>
                      <Plus className="h-4 w-4 mr-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Link href="/dashboard/admin/dream-academy/videos">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      إضافة فيديو جديد
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/dream-academy/categories">
                    <Button variant="outline" className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      إنشاء فئة جديدة
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/dream-academy/settings">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      تعديل الإعدادات
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </AccountTypeProtection>
  );
}
