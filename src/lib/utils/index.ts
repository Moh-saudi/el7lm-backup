// src/lib/utils/index.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// تم تعطيل Azure مؤقتاً
// export { uploadFileToAzure } from "./upload";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(price);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

// إضافة دالة رفع الملفات باستخدام Supabase
export const uploadFileToStorage = async () => {
  throw new Error('File upload is currently disabled');
};
