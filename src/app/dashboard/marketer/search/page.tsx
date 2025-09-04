'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Search, Filter, MapPin, Calendar, Users, Eye, MessageCircle, Star } from 'lucide-react';

interface Player {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  position: string;
  age: number;
  height: number;
  weight: number;
  profile_image?: string;
  skills: string[];
  experience: string;
  achievements: string[];
  createdAt: any;
}

export default function MarketerSearchPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    position: '',
    country: '',
    ageMin: '',
    ageMax: '',
    experience: ''
  });

  const positions = ['مهاجم', 'وسط', 'مدافع', 'حارس مرمى'];
  const countries = ['مصر', 'السعودية', 'الإمارات', 'قطر', 'الكويت', 'البحرين', 'عمان', 'الأردن', 'لبنان', 'سوريا'];
  const experienceLevels = ['مبتدئ', 'متوسط', 'متقدم', 'محترف'];

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      
      // جلب اللاعبين المتاحين للبحث (الذين لا يتبعون للماركتر الحالي)
      const playersQuery = query(
        collection(db, 'users'),
        where('accountType', '==', 'player'),
        where('marketerId', '!=', user?.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const playersSnapshot = await getDocs(playersQuery);
      const playersData = playersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Player[];

      // تطبيق الفلاتر
      let filteredPlayers = playersData.filter(player => {
        const matchesSearch = player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             player.country.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesPosition = !filters.position || player.position === filters.position;
        const matchesCountry = !filters.country || player.country === filters.country;
        const matchesAge = (!filters.ageMin || player.age >= parseInt(filters.ageMin)) &&
                          (!filters.ageMax || player.age <= parseInt(filters.ageMax));
        const matchesExperience = !filters.experience || player.experience === filters.experience;
        
        return matchesSearch && matchesPosition && matchesCountry && matchesAge && matchesExperience;
      });

      setPlayers(filteredPlayers);
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'غير محدد';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          البحث عن اللاعبين
        </h1>
        <p className="text-gray-600">
          ابحث عن لاعبين موهوبين وانضمهم لوكالتك
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث بالاسم، المركز، أو البلد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'جاري البحث...' : 'بحث'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          فلاتر البحث
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المركز</label>
            <select
              value={filters.position}
              onChange={(e) => setFilters({...filters, position: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="اختر المركز"
            >
              <option value="">جميع المراكز</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البلد</label>
            <select
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="اختر البلد"
            >
              <option value="">جميع البلدان</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العمر (من)</label>
            <input
              type="number"
              placeholder="16"
              value={filters.ageMin}
              onChange={(e) => setFilters({...filters, ageMin: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العمر (إلى)</label>
            <input
              type="number"
              placeholder="35"
              value={filters.ageMax}
              onChange={(e) => setFilters({...filters, ageMax: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري البحث عن اللاعبين...</p>
          </div>
        </div>
      ) : players.length > 0 ? (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              نتائج البحث ({players.length} لاعب)
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <div key={player.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-3">
                      {player.profile_image ? (
                        <img 
                          src={player.profile_image} 
                          alt={player.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        player.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{player.full_name}</h3>
                      <p className="text-sm text-gray-600">{player.position}</p>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium mr-1">4.5</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {player.country}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {player.age} سنة
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">الطول:</span> {player.height} سم
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">الوزن:</span> {player.weight} كجم
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">الخبرة:</span> {player.experience}
                    </div>
                  </div>

                  {player.skills && player.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">المهارات:</p>
                      <div className="flex flex-wrap gap-1">
                        {player.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {player.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{player.skills.length - 3} أكثر
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      تاريخ الانضمام: {formatDate(player.createdAt)}
                    </span>
                    <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                      إضافة للحساب
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchTerm && !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            لا توجد نتائج
          </h3>
          <p className="text-gray-600">
            لم يتم العثور على لاعبين يطابقون معايير البحث.
          </p>
        </div>
      ) : null}
    </div>
  );
}
