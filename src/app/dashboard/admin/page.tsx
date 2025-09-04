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
  Megaphone,
  Shield,
  Database,
  Bell,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { AccountTypeProtection } from '@/hooks/useAccountTypeAuth';

export default function AdminDashboardPage() {
  const adminSections = [
    {
      title: "أكاديمية الحلم",
      description: "إدارة محتوى أكاديمية الحلم والفيديوهات",
      icon: BookOpen,
      href: "/dashboard/admin/dream-academy",
      color: "bg-blue-500",
      badge: "المحتوى التعليمي"
    },
    {
      title: "إدارة الإعلانات",
      description: "إدارة الإعلانات المعروضة على صفحة الترحيب",
      icon: Megaphone,
      href: "/dashboard/admin/ads",
      color: "bg-orange-500",
      badge: "الإعلانات"
    },
    {
      title: "إدارة المستخدمين",
      description: "إدارة حسابات المستخدمين والصلاحيات",
      icon: Users,
      href: "/dashboard/admin/users",
      color: "bg-green-500",
      badge: "المستخدمين"
    },
    {
      title: "التقارير والإحصائيات",
      description: "عرض التقارير والإحصائيات العامة",
      icon: BarChart3,
      href: "/dashboard/admin/reports",
      color: "bg-purple-500",
      badge: "التقارير"
    },
    {
      title: "إعدادات النظام",
      description: "تكوين إعدادات النظام العامة",
      icon: Settings,
      href: "/dashboard/admin/settings",
      color: "bg-gray-500",
      badge: "الإعدادات"
    },
    {
      title: "إدارة المحتوى",
      description: "إدارة المحتوى العام للموقع",
      icon: FileText,
      href: "/dashboard/admin/content",
      color: "bg-indigo-500",
      badge: "المحتوى"
    },
    {
      title: "إدارة العملاء",
      description: "إدارة بيانات العملاء والتفاعل معهم",
      icon: Users,
      href: "/dashboard/admin/customer-management",
      color: "bg-teal-500",
      badge: "العملاء"
    }
  ];

  const quickStats = [
    {
      title: "إجمالي المستخدمين",
      value: "0",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "الإعلانات النشطة",
      value: "0",
      icon: Megaphone,
      color: "text-orange-600"
    },
    {
      title: "الفيديوهات",
      value: "0",
      icon: Video,
      color: "text-green-600"
    },
    {
      title: "التقارير",
      value: "0",
      icon: BarChart3,
      color: "text-purple-600"
    }
  ];

  return (
    <AccountTypeProtection allowedTypes={['admin']}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">لوحة إدارة النظام</h1>
                <p className="text-gray-600 mt-1">مركز إدارة جميع جوانب النظام والمحتوى</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-100">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Admin Sections Grid */}
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
                  <Link href="/dashboard/admin/ads">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4" />
                      إضافة إعلان جديد
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/dream-academy/videos">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      إضافة فيديو جديد
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/users">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      إدارة المستخدمين
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/reports">
                    <Button variant="outline" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      عرض التقارير
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/customer-management">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      إدارة العملاء
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
