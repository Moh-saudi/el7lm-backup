import React from "react";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface GeideaConfigAlertModalProps {
  visible: boolean;
  onClose: () => void;
  country?: string;
  city?: string;
}

const GeideaConfigAlertModal: React.FC<GeideaConfigAlertModalProps> = ({ visible, onClose, country, city }) => {
  const router = useRouter();

  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{ position: 'fixed' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 border border-yellow-300 animate-fadeIn"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-yellow-700 hover:text-yellow-900 transition"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* الرسالة الثابتة */}
        <div className="bg-yellow-100 border border-yellow-300 rounded-xl shadow-lg py-4 px-4 mb-4 text-center">
          <div className="text-yellow-700 text-base md:text-lg font-bold mb-2 flex items-center justify-center gap-2">
            <span>⚡</span>
            يرجى تحديد الدولة والمدينة في الملف الشخصي حتى تظهر لك جميع خيارات الدفع المناسبة!
            <span>🚀</span>
          </div>
          <div className="text-yellow-700 text-sm md:text-base font-medium">
            كل عملية دفع تقربك أكثر من أهدافك! 🌟
          </div>
          {/* رسالة للمطور فقط */}
          {(country !== undefined || city !== undefined) && (
            <div className="mt-2 text-xs text-gray-500 text-left ltr:text-left rtl:text-right">
              <span className="font-bold">[للمطور] </span>
              الدولة الحالية: <span dir="ltr">{country ?? 'غير محددة'}</span> | المدينة الحالية: <span dir="ltr">{city ?? 'غير محددة'}</span>
            </div>
          )}
        </div>
        
        {/* زر العودة للملف الشخصي */}
        <button
          onClick={() => router.push("/dashboard/player/profile")}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold px-6 py-2 rounded-lg shadow transition mx-auto mt-2"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة للملف الشخصي
        </button>
      </div>
    </div>
  );
};

export default GeideaConfigAlertModal; 
