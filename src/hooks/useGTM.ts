'use client';

import { useCallback } from 'react';

export const useGTM = () => {
  const pushToDataLayer = useCallback((data: any) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push(data);
      console.log('📊 GTM: Data pushed to dataLayer:', data);
    }
  }, []);

  const trackEvent = useCallback((eventName: string, parameters?: any) => {
    pushToDataLayer({
      event: eventName,
      ...parameters
    });
  }, [pushToDataLayer]);

  const trackPurchase = useCallback((transactionData: {
    transaction_id: string;
    value: number;
    currency: string;
    items: Array<{
      item_id: string;
      item_name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    pushToDataLayer({
      event: 'purchase',
      transaction_id: transactionData.transaction_id,
      value: transactionData.value,
      currency: transactionData.currency,
      items: transactionData.items
    });
  }, [pushToDataLayer]);

  const trackCustomEvent = useCallback((eventName: string, customData?: any) => {
    pushToDataLayer({
      event: eventName,
      custom_data: customData,
      timestamp: new Date().toISOString()
    });
  }, [pushToDataLayer]);

  const setUserProperties = useCallback((userProperties: {
    user_id?: string;
    user_type?: string;
    user_name?: string;
    organization?: string;
    account_status?: string;
  }) => {
    pushToDataLayer({
      event: 'user_properties',
      user_properties: userProperties
    });
  }, [pushToDataLayer]);

  const trackFormSubmission = useCallback((formData: {
    form_name: string;
    form_type: string;
    success: boolean;
    error_message?: string;
  }) => {
    pushToDataLayer({
      event: 'form_submit',
      form_name: formData.form_name,
      form_type: formData.form_type,
      success: formData.success,
      error_message: formData.error_message
    });
  }, [pushToDataLayer]);

  const trackButtonClick = useCallback((buttonData: {
    button_name: string;
    button_location: string;
    button_type: string;
    page_path: string;
  }) => {
    pushToDataLayer({
      event: 'button_click',
      button_name: buttonData.button_name,
      button_location: buttonData.button_location,
      button_type: buttonData.button_type,
      page_path: buttonData.page_path
    });
  }, [pushToDataLayer]);

  return {
    pushToDataLayer,
    trackEvent,
    trackPurchase,
    trackCustomEvent,
    setUserProperties,
    trackFormSubmission,
    trackButtonClick
  };
};

