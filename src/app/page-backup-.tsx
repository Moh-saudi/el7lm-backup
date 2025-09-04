'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Star, MapPin, Mail, Phone, ChevronLeft, Brain, Trophy, Network, Globe, FileText, Truck, Heart } from 'lucide-react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useRouter } from 'next/navigation';
// تم حذف الترجمة
// تم إلغاء TranslationWrapper مؤقتاً
import PublicResponsiveLayoutWrapper from '@/components/layout/PublicResponsiveLayout';
import { useMediaQuery } from 'react-responsive';
import ProfessionalAdPopup from '@/components/ads/ProfessionalAdPopup';
import AdBanner from '@/components/ads/AdBanner';

export default function Page() {
  const router = useRouter();
  const t = (key: string) => key;
  const isRTL = true;
  
  // Responsive breakpoints with client-side only rendering
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const [activeSlide, setActiveSlide] = useState(0);
  const [stats, setStats] = useState({
    players: 1500,
    clubs: 250,
    countries: 15,
    success: 800
  });
  const [activePartner, setActivePartner] = useState(0);
  const [activeClub, setActiveClub] = useState(0);
  const [activeSection, setActiveSection] = useState('');



  // Subscription Packages
  const packages = [
    {
      title: 'الباقة الأساسية',
      price: "2",
      originalPrice: "3",
      discount: "33%",
      features: [
        'تحليل الأداء',
        'عرض المواهب',
        'اختبارات تقنية',
        'دعم فني'
      ]
    },
    {
      title: 'الباقة المتقدمة',
      price: "6",
      originalPrice: "10",
      discount: "40%",
      isPopular: true,
      features: [
        'تحليل متقدم للأداء',
        'عرض عالمي للمواهب',
        'اختبارات شاملة',
        'دعم فني متميز'
      ]
    },
    {
      title: 'الباقة الاحترافية',
      price: "10",
      originalPrice: "20",
      discount: "50%",
      features: [
        'تحليل احترافي شامل',
        'عرض احترافي عالمي',
        'اختبارات احترافية',
        'دعم فني احترافي'
      ]
    }
  ];

  // Auto slide for partners
  useEffect(() => {
    const partnerInterval = setInterval(() => {
      setActivePartner(prev => (prev >= 2 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(partnerInterval);
  }, []);

  // Auto slide for clubs
  useEffect(() => {
    const clubInterval = setInterval(() => {
      setActiveClub(prev => (prev >= 2 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(clubInterval);
  }, []);

  // Intersection Observer for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <PublicResponsiveLayoutWrapper>
      <div className="min-h-screen bg-white" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>

        {/* Hero Section */}
        <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white pt-16 sm:pt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative z-10 py-6 sm:py-8 md:py-20">
              <div className="hero-slider rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl">
                <Swiper
                  modules={[Autoplay, Pagination, Navigation]}
                  spaceBetween={0}
                  slidesPerView={1}
                  navigation={{
                    enabled: isMounted && !isMobile,
                    hideOnClick: true,
                  }}
                  pagination={{ 
                    clickable: true,
                    dynamicBullets: true,
                    // تحسين للموبايل
                    renderBullet: function (index, className) {
                      return '<span class="' + className + ' w-2 h-2 sm:w-3 sm:h-3"></span>';
                    },
                  }}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  breakpoints={{
                    320: {
                      slidesPerView: 1,
                      spaceBetween: 0,
                    },
                    640: {
                      slidesPerView: 1,
                      spaceBetween: 0,
                    },
                    768: {
                      slidesPerView: 1,
                      spaceBetween: 0,
                    },
                    1024: {
                      slidesPerView: 1,
                      spaceBetween: 0,
                    },
                  }}
                  className={`w-full ${isMounted && isMobile ? 'aspect-square' : 'aspect-[16/9]'} md:h-[500px] lg:h-[600px]`}
                >
                  {[
                    { desktop: '/slider/1.png', mobile: '/slider/slider mobil/1.png', title: 'منصة شاملة لكرة القدم' },
                    { desktop: '/slider/2.png', mobile: '/slider/slider mobil/2.png', title: 'اكتشف مواهب جديدة' },
                    { desktop: '/slider/3.png', mobile: '/slider/slider mobil/3.png', title: 'ربط اللاعبين بالفرص العالمية' },
                    { desktop: '/slider/4.png', mobile: '/slider/slider mobil/4.png', title: 'إدارة احترافية للأندية' },
                    { desktop: '/slider/5.png', mobile: '/slider/slider mobil/5.png', title: 'أكاديميات متطورة' },
                    { desktop: '/slider/6.png', mobile: '/slider/slider mobil/6.png', title: 'شبكة عالمية من الوكلاء' },
                    { desktop: '/slider/7.png', mobile: '/slider/slider mobil/7.png', title: 'منصة المستقبل لكرة القدم' },
                  ].map((slide, index) => (
                    <SwiperSlide key={index}>
                      <div className={`relative w-full ${isMounted && isMobile ? 'aspect-square' : 'aspect-[16/9]'} bg-gray-100`}>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image
                            src={isMounted && isMobile ? slide.mobile : slide.desktop}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
                            priority={index <= 2}
                                                      />
                            {/* إضافة نصوص محسنة للموبايل */}
                            <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8">
                              <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
                                {slide.title}
                              </h1>
                              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90">
                                {slide.subtitle}
                              </p>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                </Swiper>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Ad Popup System */}
        <ProfessionalAdPopup 
          maxAds={1}
          enableAnalytics={true}
          userPreferences={{
            allowAds: true,
            preferredTypes: ['modal', 'toast', 'banner'],
            maxDisplaysPerDay: 3
          }}
        />

        {/* Ad Banner System */}
        <section className="py-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <AdBanner maxAds={2} className="max-w-4xl mx-auto" />
          </div>
        </section>

        {/* Jobs Section */}
        <section id="jobs" className="py-12 md:py-20 bg-gradient-to-br from-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12 flex flex-col items-center">
              <span className="text-3xl md:text-4xl mb-2">💼</span>
              <h2 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 inline-flex items-center gap-2">
                <span>الوظائف المتاحة</span>
              </h2>
              <p className="text-gray-600 mt-2 text-sm md:text-base">انضم إلى فريقنا المتميز وكن جزءاً من رحلتنا</p>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[
                { key: 'sales', icon: '🧾', title: 'مندوب مبيعات', description: 'تطوير المبيعات والتسويق' },
                { key: 'clubManagement', icon: '🏟️', title: 'مدير نادي', description: 'إدارة الأندية والفرق' },
                { key: 'academyManagement', icon: '🎓', title: 'مدير أكاديمية', description: 'إدارة أكاديميات كرة القدم' },
                { key: 'scoutsManagement', icon: '🔎', title: 'مدير كشافين', description: 'إدارة فريق الكشافين' },
                { key: 'tournamentsManagement', icon: '🏆', title: 'مدير بطولات', description: 'إدارة البطولات والمسابقات' },
                { key: 'trialsManagement', icon: '🧪', title: 'مدير تجارب', description: 'إدارة تجارب اللاعبين' },
                { key: 'customerRelations', icon: '🤝', title: 'علاقات عملاء', description: 'خدمة العملاء والدعم' },
                { key: 'accountants', icon: '📊', title: 'محاسب', description: 'إدارة الحسابات والمالية' },
                { key: 'performanceAnalysts', icon: '📈', title: 'محلل أداء', description: 'تحليل أداء اللاعبين' },
                { key: 'nextjsDevelopers', icon: '💻', title: 'مطور Next.js', description: 'تطوير تطبيقات الويب' },
                { key: 'callCenter', icon: '📞', title: 'مركز اتصال', description: 'خدمة العملاء عبر الهاتف' },
                { key: 'videoPhotographer', icon: '📹', title: 'مصور فيديو', description: 'تصوير وتحرير الفيديوهات الرياضية' },
                { key: 'directSales', icon: '💰', title: 'مبيعات مباشرة', description: 'المبيعات المباشرة والتسويق' },
                { key: 'directCustomerCare', icon: '🎯', title: 'رعاية عملاء مباشرة', description: 'خدمة العملاء المباشرة والدعم' }
              ].map((role) => (
                <div key={role.key} className="p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 flex items-center gap-2">
                      <span>{role.icon}</span>
                      <span className="text-sm md:text-base">{role.title}</span>
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{role.description}</p>
                  <button
                    onClick={() => router.push(`/careers/apply?role=${role.key}`)}
                    className="w-full py-2 md:py-3 text-white transition-all transform bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg md:rounded-xl hover:shadow-lg hover:scale-[1.02] touch-target"
                  >
                    تقدم الآن
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-4 md:gap-8 md:grid-cols-4">
              <div className="p-4 md:p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl md:rounded-2xl">
                <div className="mb-2 text-2xl md:text-4xl font-bold text-blue-600">
                  {stats.players.toLocaleString()}+
                </div>
                <div className="text-gray-600 text-sm md:text-base">لاعب</div>
              </div>
              <div className="p-4 md:p-6 text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl md:rounded-2xl">
                <div className="mb-2 text-2xl md:text-4xl font-bold text-green-600">
                  {stats.clubs.toLocaleString()}+
                </div>
                <div className="text-gray-600 text-sm md:text-base">نادي</div>
              </div>
              <div className="p-4 md:p-6 text-center bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl md:rounded-2xl">
                <div className="mb-2 text-2xl md:text-4xl font-bold text-amber-600">
                  {stats.countries.toLocaleString()}+
                </div>
                <div className="text-gray-600 text-sm md:text-base">دولة</div>
              </div>
              <div className="p-4 md:p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl md:rounded-2xl">
                <div className="mb-2 text-2xl md:text-4xl font-bold text-purple-600">
                  {stats.success.toLocaleString()}+
                </div>
                <div className="text-gray-600 text-sm md:text-base">نجح</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-8 sm:py-12 md:py-20 bg-gradient-to-br from-white to-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8 md:mb-12 flex flex-col items-center">
              <span className="text-2xl sm:text-3xl md:text-4xl mb-2 animate-bounce">🛡️</span>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 inline-flex items-center gap-2">
                <span>خدماتنا</span>
              </h2>
            </div>
            
            <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* بطاقة: تحليل الأداء */}
              <div className="group p-4 sm:p-6 md:p-8 transition-all duration-300 transform bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.02] sm:hover:scale-105 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-gradient-to-r from-blue-400 to-teal-400 rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl animate-slide-in" />
                <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                  <div className="text-3xl sm:text-4xl md:text-5xl">📊</div>
                  <div className="text-xl sm:text-2xl md:text-3xl text-blue-600 group-hover:scale-110 transition-transform duration-300">
                    <Brain />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">
                  تحليل الأداء
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                  تحليل شامل لأداء اللاعبين
                </p>
                <div className="mt-3 sm:mt-4 md:mt-6 flex items-center text-blue-600 font-semibold text-xs sm:text-sm md:text-base">
                  <span>اعرف المزيد</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>

              {/* بطاقة: التعرض للفرق */}
              <div className="group p-4 sm:p-6 md:p-8 transition-all duration-300 transform bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.02] sm:hover:scale-105 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl animate-slide-in" />
                <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                  <div className="text-3xl sm:text-4xl md:text-5xl">🏆</div>
                  <div className="text-xl sm:text-2xl md:text-3xl text-green-600 group-hover:scale-110 transition-transform duration-300">
                    <Trophy />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">
                  عرض الفرق
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                  عرض اللاعبين للفرق العالمية
                </p>
                <div className="mt-3 sm:mt-4 md:mt-6 flex items-center text-green-600 font-semibold text-xs sm:text-sm md:text-base">
                  <span>اعرف المزيد</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>

              {/* بطاقة: الشبكة العالمية */}
              <div className="group p-4 sm:p-6 md:p-8 transition-all duration-300 transform bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.02] sm:hover:scale-105 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 sm:h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl animate-slide-in" />
                <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                  <div className="text-3xl sm:text-4xl md:text-5xl">🌍</div>
                  <div className="text-xl sm:text-2xl md:text-3xl text-purple-600 group-hover:scale-110 transition-transform duration-300">
                    <Network />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">
                  الشبكة العالمية
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                  شبكة عالمية من الأندية والوكلاء
                </p>
                <div className="mt-3 sm:mt-4 md:mt-6 flex items-center text-purple-600 font-semibold text-xs sm:text-sm md:text-base">
                  <span>اعرف المزيد</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section id="partners" className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                شركاؤنا
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                نعمل مع أفضل المؤسسات الرياضية
              </p>
            </div>
            
            <div className="partners-slider">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                  },
                  1024: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                  },
                }}
              >
                {[
                  { name: 'الاتحاد الدولي لكرة القدم', src: '/images/supports/fifa.png' },
                  { name: 'الاتحاد القطري لكرة القدم', src: '/images/supports/qfa.png' },
                  { name: 'نادي قطر لكرة القدم', src: '/images/supports/qfc.png' },
                  { name: 'مايكروسوفت', src: '/images/supports/microsoft.png' },
                  { name: 'بيتش سكور', src: '/images/supports/peachscore-dealum-logo-new.png' },
                  { name: 'YJPPG', src: '/images/supports/YJPPG.jpg' }
                ].map((partner, index) => (
                  <SwiperSlide key={index}>
                    <div className="p-6 transition-all duration-300 transform bg-white rounded-2xl hover:shadow-lg hover:-translate-y-2">
                      <div className="relative mb-6 overflow-hidden rounded-xl aspect-[4/3]">
                        <Image 
                          src={partner.src}
                          alt={`شعار ${partner.name}`}
                          width={300}
                          height={200}
                          className="object-contain w-full h-full p-4 transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            console.error(`Error loading image: ${partner.name}`);
                            e.currentTarget.src = '/images/default-avatar.png';
                          }}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-center text-gray-800">{partner.name}</h3>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>

        {/* Clubs Section */}
        <section id="clubs" className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 flex flex-col items-center">
              <span className="text-3xl md:text-4xl mb-2 animate-bounce">🏟️</span>
              <h2 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 inline-flex items-center gap-2">
                <span>{'الأندية الشريكة'}</span>
              </h2>
            </div>
            
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                },
              }}
              className="clubs-swiper"
            >
              {[
                { name: 'نادي العين', logo: 'al-ain-fc-logo.png' },
                { name: 'نادي الشمال', logo: 'al-shamal-sc-logo-png_seeklogo-487123.png' },
                { name: 'نادي الشحانية', logo: '1503438199al-shahania-sc-football-logo-png.png' },
                { name: 'نادي الهلال', logo: 'al_hilal_sfc-logo_brandlogos.net_3tkg2-512x512.png' },
                { name: 'نادي النصر', logo: 'elnasr saudi.png' },
                { name: 'نادي الزمالك', logo: 'zamalk.png' },
                { name: 'نادي النصر الإماراتي', logo: 'elnaser uha.jpg' },
                { name: 'نادي المكلا', logo: 'elmkolon.jpg' },
                { name: 'نادي الدحيل', logo: 'eldohel.jpg' },
                { name: 'نادي عجمان', logo: 'agman.png' }
              ].map((club, index) => (
                <SwiperSlide key={index}>
                  <div className="p-6 transition-all duration-300 transform bg-white rounded-2xl hover:shadow-lg hover:-translate-y-2">
                    <div className="relative mb-6 overflow-hidden rounded-xl aspect-[4/3]">
                      <img 
                        src={`/images/logoclublandingpage/${club.logo}`}
                        alt={`شعار ${club.name}`}
                        className="object-contain w-full h-full p-4 transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          console.error(`Error loading image: ${club.logo}`);
                          e.currentTarget.src = '/images/club-avatar.png';
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-center text-gray-800">{club.name}</h3>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-12 md:py-20 bg-gradient-to-br from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 flex flex-col items-center">
              <span className="text-3xl md:text-4xl mb-2 animate-bounce">👨‍💼</span>
              <h2 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 inline-flex items-center gap-2">
                <span>فريق العمل</span>
              </h2>
            </div>
            
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'أحمد محمد',
                  role: 'الرئيس التنفيذي',
                  image: '/images/team/ceo .jpg',
                  description: 'خبرة 15 عام في إدارة المشاريع الرياضية'
                },
                {
                  name: 'محمد علي',
                  role: 'مدير التكنولوجيا',
                  image: '/images/team/opertionegypt.jpg',
                  description: 'خبرة في تطوير المنصات الرقمية'
                },
                {
                  name: 'فاطمة أحمد',
                  role: 'مدير المالية',
                  image: '/images/team/opetion qatar.jpg',
                  description: 'خبرة في إدارة الشؤون المالية'
                },
                {
                  name: 'علي حسن',
                  role: 'المدير القانوني',
                  image: '/images/team/law.jpg',
                  description: 'خبرة في الشؤون القانونية الرياضية'
                }
              ].map((member, index) => (
                <div key={index} className="p-6 transition-all duration-300 transform bg-white rounded-2xl hover:shadow-lg hover:-translate-y-2">
                  <div className="relative mb-6 overflow-hidden rounded-xl aspect-[4/3]">
                    <img 
                      src={member.image}
                      alt={member.name}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-avatar.png';
                      }}
                    />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800">{member.name}</h3>
                  <p className="mb-4 text-blue-600">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Branches Section */}
        <section id="branches" className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 flex flex-col items-center">
              <span className="text-3xl md:text-4xl mb-2 animate-bounce">📍</span>
              <h2 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 inline-flex items-center gap-2">
                <span>فروعنا</span>
              </h2>
            </div>
            
            <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                          {[
                { city: 'الرياض', country: 'المملكة العربية السعودية', address: 'الرياض، المملكة العربية السعودية', flag: 'saudi-arabia' },
                { city: 'دبي', country: 'الإمارات العربية المتحدة', address: 'دبي، الإمارات العربية المتحدة', flag: 'uae' },
                { city: 'الدوحة', country: 'قطر', address: 'الدوحة، قطر', flag: 'qatar' },
                { city: 'القاهرة', country: 'مصر', address: 'القاهرة، مصر', flag: 'egypt' }
              ].map((branch, index) => (
              <div key={index} className="p-6 transition-all duration-300 transform bg-white rounded-2xl hover:shadow-lg hover:-translate-y-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{branch.city}</h3>
                    <div className="flex items-center gap-2">
                      <img 
                        src={`/images/flags/${branch.flag}.png`}
                        alt={`علم ${branch.country}`}
                        className="w-6 h-4 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/images/default-avatar.png';
                        }}
                      />
                      <p className="text-gray-600">{branch.country}</p>
                    </div>
                  </div>
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600">{branch.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Enhanced */}
      <section id="contact" className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4">
          {/* أيقونات حماسية */}
          <div className="flex justify-center gap-8 mb-12 animate-fade-in-up">
            <span className="text-6xl">⚽</span>
            <span className="text-6xl">🏆</span>
            <span className="text-6xl">⭐</span>
            <span className="text-6xl">🔥</span>
            <span className="text-6xl">💪</span>
          </div>
          
          <div className="text-center mb-20">
            <h2 className="mb-6 text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
              تواصل معنا
            </h2>
            <p className="text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              نحن هنا لمساعدتك في تحقيق حلمك الرياضي. تواصل معنا عبر أي من القنوات التالية
            </p>
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl max-w-3xl mx-auto">
              <p className="text-xl text-gray-700 font-semibold mb-2">
                💬 يمكنك مراسلتنا على الواتساب بسهولة!
              </p>
              <p className="text-lg text-gray-600">
                اضغط على أيقونة الواتساب أدناه وسيتم فتح المحادثة مباشرة مع فريقنا
              </p>
            </div>
          </div>

          {/* Quick Contact Numbers */}
          <div className="mb-16 p-8 bg-gradient-to-r from-blue-100 to-green-100 rounded-3xl shadow-lg">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">
              📞 أرقام الهواتف المباشرة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white rounded-2xl shadow-md">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <img src="/images/flags/egypt.png" alt="علم مصر" className="w-8 h-8" />
                  <h4 className="text-2xl font-bold text-gray-800">مصر</h4>
                </div>
                <a 
                  href="tel:+201017799580" 
                  className="text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors block"
                >
                  +20 10 1779 9580
                </a>
                <p className="text-sm text-gray-600 mt-2">متاح 24/7 للدردشة والاستفسارات</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-2xl shadow-md">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <img src="/images/flags/qatar.png" alt="علم قطر" className="w-8 h-8" />
                  <h4 className="text-2xl font-bold text-gray-800">قطر</h4>
                </div>
                <a 
                  href="tel:+97472053188" 
                  className="text-3xl font-bold text-green-600 hover:text-green-700 transition-colors block"
                >
                  +974 72 053 188
                </a>
                <p className="text-sm text-gray-600 mt-2">متاح 24/7 للدردشة والاستفسارات</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-lg text-gray-700 font-semibold">
                💬 يمكنك أيضاً مراسلتنا على الواتساب مباشرة بالضغط على الأزرار أدناه
            </p>
          </div>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid gap-8 md:gap-12 max-w-7xl mx-auto grid-cols-1 lg:grid-cols-3 mb-16">

            {/* Egypt Contact - Enhanced */}
            <div className="p-8 md:p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-blue-100">
              <div className="text-center">
                <div className="mb-8">
                  <img src="/images/flags/egypt.png" alt="علم مصر" className="w-16 h-16 mx-auto mb-4 rounded-full shadow-lg" />
                  <h3 className="text-4xl font-bold text-gray-800 mb-2">مصر</h3>
                  <p className="text-lg text-gray-600">المكتب الرئيسي</p>
                </div>
                
                {/* Phone Section */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Phone className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-700">+20</span>
                  </div>
                  <a 
                    href="tel:+201017799580" 
                    className="text-5xl font-bold text-blue-600 hover:text-blue-700 transition-colors block"
                  >
                    010 1779 9580
                  </a>
                  <p className="text-sm text-gray-500 mt-2">متاح 24/7</p>
                </div>

                {/* WhatsApp Button */}
                <a 
                  href="https://wa.me/201017799580" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-10 py-5 text-2xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-8 h-8 ml-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {'واتساب مصر'}
                </a>
                <p className="text-sm text-green-600 mt-2 font-medium">💬 اضغط للدردشة المباشرة</p>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>العنوان:</strong> القاهرة، مصر<br/>
                    <strong>ساعات العمل:</strong> الأحد - الخميس 9 ص - 6 م
                  </p>
                </div>
              </div>
            </div>

            {/* Qatar Contact - Enhanced */}
            <div className="p-8 md:p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-green-100">
              <div className="text-center">
                <div className="mb-8">
                  <img src="/images/flags/qatar.png" alt="علم قطر" className="w-16 h-16 mx-auto mb-4 rounded-full shadow-lg" />
                  <h3 className="text-4xl font-bold text-gray-800 mb-2">قطر</h3>
                  <p className="text-lg text-gray-600">المكتب الإقليمي</p>
                </div>
                
                {/* Phone Section */}
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Phone className="w-8 h-8 text-green-600" />
                  <span className="text-2xl font-bold text-gray-700">+974</span>
                  </div>
                  <a 
                    href="tel:+97472053188" 
                    className="text-5xl font-bold text-green-600 hover:text-green-700 transition-colors block"
                  >
                    72 053 188
                  </a>
                  <p className="text-sm text-gray-500 mt-2">متاح 24/7</p>
                </div>

                {/* WhatsApp Button */}
                <a 
                  href="https://wa.me/97472053188" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-10 py-5 text-2xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-8 h-8 ml-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {'واتساب قطر'}
                </a>
                <p className="text-sm text-green-600 mt-2 font-medium">💬 اضغط للدردشة المباشرة</p>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>العنوان:</strong> الدوحة، قطر<br/>
                    <strong>ساعات العمل:</strong> الأحد - الخميس 8 ص - 5 م
                  </p>
                </div>
              </div>
            </div>

            {/* Email Contact - New */}
            <div className="p-8 md:p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-purple-100">
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-4xl font-bold text-gray-800 mb-2">البريد الإلكتروني</h3>
                  <p className="text-lg text-gray-600">تواصل رسمي</p>
                </div>
                
                {/* Email Section */}
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Mail className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-700">البريد الإلكتروني</span>
                  </div>
                  <a 
                    href="mailto:info@el7lm.com" 
                    className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors block break-all"
                  >
                    info@el7lm.com
                  </a>
                  <p className="text-sm text-gray-500 mt-2">رد خلال 24 ساعة</p>
                </div>

                {/* Email Button */}
                <a 
                  href="mailto:info@el7lm.com" 
                  className="inline-flex items-center px-10 py-5 text-2xl font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-full hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Mail className="w-8 h-8 ml-4" />
                  {'إرسال بريد إلكتروني'}
                </a>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>الرد:</strong> خلال 24 ساعة<br/>
                    <strong>الاستفسارات:</strong> عامة وتقنية
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Contact Methods */}
          <div className="grid gap-8 md:gap-12 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 mb-16">
            
            {/* Social Media */}
            <div className="p-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl text-white shadow-xl">
              <h3 className="text-3xl font-bold mb-6 text-center">وسائل التواصل الاجتماعي</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">فيسبوك</span>
                  <a href="https://facebook.com/el7lm" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                    متابعة
                  </a>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">تويتر</span>
                  <a href="https://twitter.com/el7lm" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                    متابعة
                  </a>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">إنستغرام</span>
                  <a href="https://instagram.com/el7lm" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                    متابعة
                </a>
              </div>
            </div>
          </div>

            {/* Support Hours */}
            <div className="p-8 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl text-white shadow-xl">
              <h3 className="text-3xl font-bold mb-6 text-center">ساعات الدعم الفني</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">الأحد - الخميس</span>
                  <span className="text-xl">9 ص - 6 م</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">الجمعة - السبت</span>
                  <span className="text-xl">10 ص - 4 م</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-xl font-semibold">الطوارئ</span>
                  <span className="text-xl">24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h3 className="text-4xl font-bold text-gray-800 mb-6">
              ابدأ رحلتك الآن
            </h3>
            <p className="text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              انضم إلى منصتنا واحصل على فرصتك في عالم كرة القدم. نحن هنا لمساعدتك في تحقيق حلمك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth/register" 
                className="inline-flex items-center px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                سجل الآن
                <ChevronLeft className="w-8 h-8 mr-4" />
              </a>
              <a 
                href="/about" 
                className="inline-flex items-center px-12 py-6 text-2xl font-bold text-blue-600 bg-white border-2 border-blue-600 rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                اعرف المزيد
                <ChevronRight className="w-8 h-8 mr-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      </div>
    </PublicResponsiveLayoutWrapper>
  );
}


