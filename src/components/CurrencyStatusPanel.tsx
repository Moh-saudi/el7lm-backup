'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Globe, TrendingUp, ExternalLink } from 'lucide-react';
import { getCurrencyRates, forceUpdateRates, getSystemStatus, getRatesAge } from '@/lib/currency-rates';

interface CurrencyStatus {
  cacheStatus: 'valid' | 'expired' | 'missing';
  lastUpdated: string | null;
  expiresAt: string | null;
  ageInHours: number | null;
  totalCurrencies: number;
}

export default function CurrencyStatusPanel() {
  const [status, setStatus] = useState<CurrencyStatus | null>(null);
  const [rates, setRates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // تحديث معلومات الحالة
  const updateStatus = () => {
    const systemStatus = getSystemStatus();
    const ratesAge = getRatesAge();
    
    setStatus({
      cacheStatus: systemStatus.cacheStatus,
      lastUpdated: systemStatus.lastUpdated,
      expiresAt: systemStatus.expiresAt,
      ageInHours: ratesAge.ageInHours,
      totalCurrencies: systemStatus.totalCurrencies
    });
  };

  // تحميل الأسعار
  const loadRates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentRates = await getCurrencyRates();
      setRates(currentRates);
      updateStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل الأسعار');
    } finally {
      setLoading(false);
    }
  };

  // تحديث قسري للأسعار
  const refreshRates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newRates = await forceUpdateRates();
      setRates(newRates);
      updateStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحديث الأسعار');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRates = async () => {
    // منع الإرسال المتكرر
    if (updating) {
      console.log('🛑 Currency rates update blocked - already updating');
      return;
    }

    setUpdating(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/update-currency-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        setMessage('تم تحديث أسعار العملات بنجاح!');
        setRates(result.rates);
      } else {
        setError(result.error || 'فشل في تحديث أسعار العملات');
      }
    } catch (error: any) {
      setError('حدث خطأ في تحديث أسعار العملات');
    } finally {
      setUpdating(false);
    }
  };

  // تحميل الحالة عند تحميل المكون
  useEffect(() => {
    loadRates();
    
    // تحديث الحالة كل دقيقة
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // ألوان الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-50 border-green-200';
      case 'expired': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'missing': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-5 h-5" />;
      case 'expired': return <Clock className="w-5 h-5" />;
      case 'missing': return <AlertTriangle className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid': return 'الأسعار محدثة وصالحة';
      case 'expired': return 'الأسعار منتهية الصلاحية';
      case 'missing': return 'لا توجد أسعار محفوظة';
      default: return 'حالة غير معروفة';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">حالة أسعار العملات</h3>
            <p className="text-sm text-gray-600">نظام التحديث التلقائي</p>
          </div>
        </div>
        <button
          onClick={refreshRates}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'جاري التحديث...' : 'تحديث الأسعار'}
        </button>
      </div>

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* حالة Cache */}
          <div className={`border rounded-lg p-4 ${getStatusColor(status.cacheStatus)}`}>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(status.cacheStatus)}
              <span className="font-medium">حالة التخزين المؤقت</span>
            </div>
            <p className="text-sm">{getStatusText(status.cacheStatus)}</p>
            {status.ageInHours !== null && (
              <p className="text-xs mt-1">
                العمر: {status.ageInHours.toFixed(1)} ساعة
              </p>
            )}
          </div>

          {/* عدد العملات */}
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200 text-blue-600">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5" />
              <span className="font-medium">العملات المدعومة</span>
            </div>
            <p className="text-sm">{status.totalCurrencies} عملة محملة</p>
            <p className="text-xs mt-1">16 عملة أساسية + عملات إضافية</p>
          </div>
        </div>
      )}

      {/* معلومات التحديث */}
      {status?.lastUpdated && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3">📅 معلومات التحديث</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">آخر تحديث:</span>
              <p className="font-medium text-gray-900">
                {new Date(status.lastUpdated).toLocaleString('ar-EG')}
              </p>
            </div>
            {status.expiresAt && (
              <div>
                <span className="text-gray-600">ينتهي في:</span>
                <p className="font-medium text-gray-900">
                  {new Date(status.expiresAt).toLocaleString('ar-EG')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* أخطاء */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">خطأ في النظام</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* عينة من الأسعار */}
      {Object.keys(rates).length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">💱 عينة من الأسعار (مقابل الدولار)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {Object.entries(rates).slice(0, 8).map(([code, info]: [string, any]) => (
              <div key={code} className="flex items-center justify-between bg-white rounded-lg p-2">
                <span className="font-medium">{code}</span>
                <span className="text-gray-600">{info.rate?.toFixed(4) || 'N/A'}</span>
              </div>
            ))}
          </div>
          {Object.keys(rates).length > 8 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              و {Object.keys(rates).length - 8} عملة إضافية...
            </p>
          )}
        </div>
      )}

      {/* مصدر البيانات */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>مصدر البيانات: ExchangeRate-API</span>
          <a 
            href="https://www.exchangerate-api.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            الموقع الرسمي
          </a>
        </div>
      </div>
    </div>
  );
} 
