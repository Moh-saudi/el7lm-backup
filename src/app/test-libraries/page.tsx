'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Heart,
  Star,
  Trophy,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export default function TestLibrariesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          اختبار المكتبات المحسنة
        </h1>

        {/* شريط البحث */}
        <div className="mb-8">
          <Input
            placeholder="البحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            variant="bordered"
            size="lg"
            className="w-full"
          />
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                    <Trophy className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    +3
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-600">المباريات</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    +2
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-sm text-gray-600">الأهداف</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    +5
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-sm text-gray-600">النقاط</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100">
                    <Activity className="w-6 h-6 text-yellow-600" />
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    +2%
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">95%</p>
                  <p className="text-sm text-gray-600">النشاط</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* بطاقة النشاط */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="https://via.placeholder.com/150x150/2563eb/ffffff?text=Player" />
                  <AvatarFallback>اللاعب</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">مباراة ضد فريق النصر</h3>
                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                      نجح
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">أداء ممتاز في المباراة الأخيرة مع تسجيل هدفين</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">منذ ساعتين</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Heart className="w-3 h-3" />
                        <span>45</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Star className="w-3 h-3" />
                        <span>120</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* شريط التقدم */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Target className="w-6 h-6" />
                <h3 className="font-semibold">تحسين مهارات التسديد</h3>
              </div>
              <p className="text-blue-100 mb-4">العمل على تحسين دقة التسديد من مسافات مختلفة</p>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm">في التقدم</span>
                </div>
                <span className="text-sm">75% مكتمل</span>
              </div>
              <Progress
                value={75}
                className="w-full"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* الأزرار */}
        <div className="flex flex-wrap gap-4 justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              إضافة جديد
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <Search className="w-4 h-4 mr-2" />
              البحث
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              <Heart className="w-4 h-4 mr-2" />
              الإعجاب
            </Button>
          </motion.div>
        </div>

        {/* رسالة نجاح */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-800">تم التحديث بنجاح!</h2>
            </div>
            <p className="text-green-700">
              تم تطبيق جميع التحسينات بنجاح. المكتبات تعمل بشكل مثالي!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
