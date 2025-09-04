import ScrollVelocity from "@/components/ScrollVelocity";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function GeideaConfigAlert() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center mt-4">
      {/* رسالة متحركة حماسية */}
      <ScrollVelocity
        texts={[
          "⚡ يرجى تحديد الدولة في الملف الشخصي حتى تظهر لك جميع خيارات الدفع المناسبة! 🚀",
          "💡 كل عملية دفع تقربك أكثر من أهدافك! 🌟",
        ]}
        velocity={80}
        className="text-yellow-700"
        parallaxClassName="bg-yellow-100 border border-yellow-300 rounded-xl shadow-lg py-2 px-2 mb-2"
        scrollerClassName="text-lg md:text-xl font-bold"
      />

      {/* زر العودة للملف الشخصي */}
      <button
        onClick={() => router.push("/dashboard/player/profile")}
        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold px-6 py-2 rounded-lg shadow transition mt-2"
      >
        <ArrowLeft className="w-5 h-5" />
        العودة للملف الشخصي
      </button>
    </div>
  );
} 
