import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const partners = [
  { name: 'FIFA', src: '/images/supports/fifa.png' },
  { name: 'QFA', src: '/images/supports/qfa.png' },
  { name: 'QFC', src: '/images/supports/qfc.png' },
  { name: 'Microsoft', src: '/images/supports/microsoft.png' },
  { name: 'Peachscore', src: '/images/supports/peachscore-dealum-logo-new.png' },
  { name: 'YJPPG', src: '/images/supports/YJPPG.jpg' }
];

export default function Partners() {
  return (
    <section id="partners" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
            شركاؤنا
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نتعاون مع كبرى المؤسسات والشركات العالمية
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
            {partners.map((partner, index) => (
              <SwiperSlide key={index}>
                <div className="p-6 transition-all duration-300 transform bg-white rounded-2xl hover:shadow-lg hover:-translate-y-2">
                  <div className="relative mb-6 overflow-hidden rounded-xl aspect-[4/3]">
                    <Image 
                      src={partner.src}
                      alt={`شعار ${partner.name}`}
                      width={300}
                      height={200}
                      className="object-contain w-full h-full p-4 transition-transform duration-500 ease-out hover:scale-105"
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
  );
} 
