'use client';

import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Common form field wrapper component
interface FormFieldWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({ 
  children, 
  className = "space-y-2 lg:space-y-3" 
}) => (
  <div className={className}>
    {children}
  </div>
);

// Common label component
interface FormLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({ 
  htmlFor, 
  children, 
  className = "text-sm lg:text-base font-semibold text-gray-700" 
}) => (
  <Label htmlFor={htmlFor} className={className}>
    {children}
  </Label>
);

// Common input component
interface FormInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  className = "h-14 lg:h-16 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
}) => (
  <Input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className={className}
  />
);

// Common textarea component
interface FormTextareaProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  className = "border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white resize-none text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4 min-h-[120px] lg:min-h-[150px]"
}) => (
  <Textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    required={required}
    className={className}
  />
);

// Common select component
interface FormSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  value,
  onValueChange,
  placeholder,
  children,
  className = "h-14 lg:h-16 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger className={className}>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {children}
    </SelectContent>
  </Select>
);

// Predefined select options
export const AdTypeOptions = () => (
  <>
    <SelectItem value="text">📝 نص</SelectItem>
    <SelectItem value="image">🖼️ صورة</SelectItem>
    <SelectItem value="video">🎥 فيديو</SelectItem>
  </>
);

export const TargetAudienceOptions = () => (
  <>
    <SelectItem value="all">👥 للجميع</SelectItem>
    <SelectItem value="new_users">🆕 مستخدمين جدد</SelectItem>
    <SelectItem value="returning_users">🔄 مستخدمين عائدين</SelectItem>
  </>
);

export const PopupTypeOptions = () => (
  <>
    <SelectItem value="modal">🪟 نافذة منبثقة</SelectItem>
    <SelectItem value="toast">🍞 إشعار</SelectItem>
    <SelectItem value="banner">🎯 شريط إعلاني</SelectItem>
    <SelectItem value="side-panel">📋 لوحة جانبية</SelectItem>
  </>
);

export const DisplayFrequencyOptions = () => (
  <>
    <SelectItem value="once">1️⃣ مرة واحدة</SelectItem>
    <SelectItem value="daily">📅 يومياً</SelectItem>
    <SelectItem value="weekly">📆 أسبوعياً</SelectItem>
    <SelectItem value="always">♾️ دائماً</SelectItem>
  </>
);

export const UrgencyOptions = () => (
  <>
    <SelectItem value="low">🟢 منخفض</SelectItem>
    <SelectItem value="medium">🟡 متوسط</SelectItem>
    <SelectItem value="high">🟠 عالي</SelectItem>
    <SelectItem value="critical">🔴 حرج</SelectItem>
  </>
);

// Helper function to get focus color based on field type
export const getFocusColor = (type: string): string => {
  switch (type) {
    case 'title':
      return 'focus:border-blue-500 focus:ring-blue-500';
    case 'description':
      return 'focus:border-green-500 focus:ring-green-500';
    case 'mediaUrl':
      return 'focus:border-purple-500 focus:ring-purple-500';
    case 'ctaText':
    case 'ctaUrl':
      return 'focus:border-orange-500 focus:ring-orange-500';
    case 'priority':
    case 'targetAudience':
      return 'focus:border-teal-500 focus:ring-teal-500';
    case 'popupType':
    case 'displayDelay':
    case 'displayFrequency':
    case 'maxDisplays':
    case 'autoClose':
    case 'discount':
    case 'countdown':
      return 'focus:border-purple-500 focus:ring-purple-500';
    default:
      return 'focus:border-blue-500 focus:ring-blue-500';
  }
};

// Helper function to get base input classes
export const getBaseInputClasses = (type: string): string => {
  const focusColor = getFocusColor(type);
  return `h-14 lg:h-16 border-gray-300 ${focusColor} bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4`;
};

// Helper function to get base select classes
export const getBaseSelectClasses = (type: string): string => {
  const focusColor = getFocusColor(type);
  return `h-14 lg:h-16 border-gray-300 ${focusColor} bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4`;
};

