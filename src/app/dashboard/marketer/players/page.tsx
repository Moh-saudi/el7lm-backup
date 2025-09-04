'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, Search, Filter, Users, Eye, MessageCircle, Phone } from 'lucide-react';

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
  status: 'active' | 'inactive';
  createdAt: any;
}

export default function MarketerPlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (user?.uid) {
      fetchPlayers();
    }
  }, [user]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      
      // جلب اللاعبين التابعين للماركتر
      const playersQuery = query(
        collection(db, 'users'),
        where('accountType', '==', 'player'),
        where('marketerId', '==', user?.uid),
        where('isDeleted', '!=', true)
      );
      
      const playersSnapshot = await getDocs(playersQuery);
      const playersData = playersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Player[];

      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.phone.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || player.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: any) => {
    if (!date) return 'غير محدد';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل اللاعبين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          إدارة اللاعبين
        </h1>
        <p className="text-gray-600">
          إدارة اللاعبين التابعين لوكالتك
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث عن لاعب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">جميع اللاعبين</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">إجمالي اللاعبين</p>
              <p className="text-2xl font-bold text-gray-900">{players.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">اللاعبين النشطين</p>
              <p className="text-2xl font-bold text-gray-900">
                {players.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <MessageCircle className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">اللاعبين الجدد</p>
              <p className="text-2xl font-bold text-gray-900">
                {players.filter(p => {
                  const date = p.createdAt?.toDate?.() || new Date(p.createdAt);
                  const now = new Date();
                  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                  return diffDays <= 30;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            لا يوجد لاعبين
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' 
              ? 'لم يتم العثور على لاعبين يطابقون معايير البحث.'
              : 'لم يتم إضافة أي لاعبين لحسابك حتى الآن.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
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
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    player.status === 'active' 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-red-600 bg-red-100'
                  }`}>
                    {player.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {player.phone}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">العمر:</span> {player.age} سنة
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">الطول:</span> {player.height} سم
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">الوزن:</span> {player.weight} كجم
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">البلد:</span> {player.country}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>تاريخ الانضمام: {formatDate(player.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
