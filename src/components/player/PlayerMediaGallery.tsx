import React, { useState } from 'react';
import { ImageIcon, Video, Play, Download, Eye, X } from 'lucide-react';

interface PlayerMediaGalleryProps {
  player: any;
}

const PlayerMediaGallery: React.FC<PlayerMediaGalleryProps> = ({ player }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const allImages = [
    ...(player?.profile_image ? [player.profile_image] : []),
    ...(player?.additional_images || [])
  ];

  const allVideos = player?.videos || [];

  const getImageUrl = (image: any) => {
    if (typeof image === 'string') return image;
    if (image?.url) return image.url;
    return null;
  };

  const getVideoUrl = (video: any) => {
    if (typeof video === 'string') return video;
    if (video?.url) return video.url;
    return null;
  };

  return (
    <div className="space-y-8">
      {/* الصور */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          معرض الصور
        </h3>
        
        {allImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allImages.map((image, index) => {
              const imageUrl = getImageUrl(image);
              if (!imageUrl) return null;

              return (
                <div key={index} className="relative group">
                  <img 
                    src={imageUrl} 
                    alt={`صورة ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-all duration-500 ease-out hover:shadow-md hover:scale-[1.02]"
                    onClick={() => setSelectedImage(imageUrl)}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-500 ease-out rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Badge for profile image */}
                  {index === 0 && player?.profile_image && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      رئيسية
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">لا توجد صور متاحة</p>
          </div>
        )}
      </div>

      {/* الفيديوهات */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          معرض الفيديوهات
        </h3>
        
        {allVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allVideos.map((video, index) => {
              const videoUrl = getVideoUrl(video);
              if (!videoUrl) return null;

              return (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="relative">
                    <video 
                      src={videoUrl} 
                      className="w-full h-48 object-cover"
                      poster={video.thumbnail || undefined}
                    />
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <button
                        onClick={() => setSelectedVideo(videoUrl)}
                        className="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all duration-500 ease-out"
                        title="تشغيل الفيديو"
                        aria-label="تشغيل الفيديو"
                      >
                        <Play className="w-6 h-6 text-blue-600 ml-1" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">فيديو {index + 1}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Video className="w-4 h-4" />
                      <span>فيديو رياضي</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">لا توجد فيديوهات متاحة</p>
          </div>
        )}
      </div>

      {/* Modal للصور */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              title="إغلاق"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedImage} 
              alt="صورة مكبرة"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Modal للفيديوهات */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              title="إغلاق"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>
            <video 
              src={selectedVideo} 
              controls
              className="max-w-full max-h-full rounded-lg"
              autoPlay
            />
          </div>
        </div>
      )}

      {/* إحصائيات الوسائط */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ImageIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">الصور</h4>
              <p className="text-sm text-gray-500">عدد الصور المتاحة</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-600">{allImages.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">الفيديوهات</h4>
              <p className="text-sm text-gray-500">عدد الفيديوهات المتاحة</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">{allVideos.length}</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerMediaGallery; 
