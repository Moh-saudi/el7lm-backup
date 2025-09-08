'use client';

import { useState, useCallback } from 'react';
import { createClarityApiService, ClarityApiService } from '@/services/clarityApi';

interface UseClarityApiReturn {
  clarityApi: ClarityApiService | null;
  loading: boolean;
  error: string | null;
  insights: any | null;
  sessions: any[] | null;
  initializeApi: (projectId: string, apiKey: string) => void;
  fetchInsights: (dateRange?: { start: string; end: string }) => Promise<void>;
  exportSessions: (dateRange?: { start: string; end: string }) => Promise<void>;
  exportToCSV: (data: any[], filename: string) => void;
  exportToJSON: (data: any, filename: string) => void;
  clearError: () => void;
}

export const useClarityApi = (): UseClarityApiReturn => {
  const [clarityApi, setClarityApi] = useState<ClarityApiService | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[] | null>(null);

  const initializeApi = useCallback((projectId: string, apiKey: string) => {
    try {
      const api = createClarityApiService({
        projectId,
        apiKey,
      });
      setClarityApi(api);
      setError(null);
      console.log('✅ Clarity API initialized');
    } catch (err) {
      setError('فشل في تهيئة Clarity API');
      console.error('❌ خطأ في تهيئة Clarity API:', err);
    }
  }, []);

  const fetchInsights = useCallback(async (dateRange?: { start: string; end: string }) => {
    if (!clarityApi) {
      setError('Clarity API غير مهيأ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await clarityApi.getProjectLiveInsights(dateRange);
      setInsights(data);
      console.log('✅ تم جلب رؤى Clarity بنجاح');
    } catch (err) {
      setError('فشل في جلب رؤى Clarity');
      console.error('❌ خطأ في جلب رؤى Clarity:', err);
    } finally {
      setLoading(false);
    }
  }, [clarityApi]);

  const exportSessions = useCallback(async (dateRange?: { start: string; end: string }) => {
    if (!clarityApi) {
      setError('Clarity API غير مهيأ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await clarityApi.exportSessions(dateRange);
      setSessions(data);
      console.log('✅ تم تصدير جلسات Clarity بنجاح');
    } catch (err) {
      setError('فشل في تصدير جلسات Clarity');
      console.error('❌ خطأ في تصدير جلسات Clarity:', err);
    } finally {
      setLoading(false);
    }
  }, [clarityApi]);

  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (!clarityApi) {
      setError('Clarity API غير مهيأ');
      return;
    }

    try {
      clarityApi.exportToCSV(data, filename);
      console.log('✅ تم تصدير البيانات إلى CSV');
    } catch (err) {
      setError('فشل في تصدير البيانات إلى CSV');
      console.error('❌ خطأ في تصدير CSV:', err);
    }
  }, [clarityApi]);

  const exportToJSON = useCallback((data: any, filename: string) => {
    if (!clarityApi) {
      setError('Clarity API غير مهيأ');
      return;
    }

    try {
      clarityApi.exportToJSON(data, filename);
      console.log('✅ تم تصدير البيانات إلى JSON');
    } catch (err) {
      setError('فشل في تصدير البيانات إلى JSON');
      console.error('❌ خطأ في تصدير JSON:', err);
    }
  }, [clarityApi]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    clarityApi,
    loading,
    error,
    insights,
    sessions,
    initializeApi,
    fetchInsights,
    exportSessions,
    exportToCSV,
    exportToJSON,
    clearError,
  };
};

