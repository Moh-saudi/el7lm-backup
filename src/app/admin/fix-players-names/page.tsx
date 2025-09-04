'use client';

import { useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, where, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, UserCheck } from 'lucide-react';

interface FixResult {
  userId: string;
  oldName: string;
  newName: string;
  status: 'updated' | 'skipped' | 'error';
  message: string;
}

export default function FixPlayersNamesPage() {
  const [results, setResults] = useState<FixResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleFixNames = async () => {
    setIsLoading(true);
    setResults([]);
    setDone(false);
    const newResults: FixResult[] = [];
    try {
      // جلب جميع اللاعبين المستقلين من users
      const usersSnapshot = await getDocs(query(collection(db, 'users'), where('accountType', '==', 'player')));
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const oldName = userData.full_name || userData.name || '';
        // جلب الاسم الصحيح من players أو player أو users
        let playerDoc = await getDoc(doc(db, 'players', userId));
        let playerData = null;
        
        if (playerDoc.exists()) {
          playerData = playerDoc.data();
        } else {
          // جرب player collection
          playerDoc = await getDoc(doc(db, 'player', userId));
          if (playerDoc.exists()) {
            playerData = playerDoc.data();
          } else {
            // جرب users collection
            playerDoc = await getDoc(doc(db, 'users', userId));
            if (playerDoc.exists()) {
              playerData = playerDoc.data();
            }
          }
        }
        
        if (playerData) {
          const playerName = playerData.full_name || playerData.name || '';
          if (playerName && oldName !== playerName) {
            try {
              await updateDoc(doc(db, 'users', userId), {
                name: playerName,
                full_name: playerName
              });
              newResults.push({
                userId,
                oldName,
                newName: playerName,
                status: 'updated',
                message: `تم تحديث الاسم من "${oldName}" إلى "${playerName}"`
              });
            } catch (err) {
              newResults.push({
                userId,
                oldName,
                newName: playerName,
                status: 'error',
                message: 'خطأ أثناء التحديث: ' + ((err as any)?.message || err)
              });
            }
          } else {
            newResults.push({
              userId,
              oldName,
              newName: playerName,
              status: 'skipped',
              message: 'لا حاجة للتحديث (الاسم متطابق أو غير موجود)'
            });
          }
        } else {
          newResults.push({
            userId,
            oldName,
            newName: '',
            status: 'skipped',
            message: 'لا يوجد بيانات للاعب في أي collection'
          });
        }
      }
      setResults(newResults);
      setDone(true);
    } catch (error: any) {
      setResults([{ userId: '', oldName: '', newName: '', status: 'error', message: error?.message || 'خطأ غير معروف' }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            مزامنة أسماء اللاعبين المستقلين
          </CardTitle>
          <CardDescription>
            هذه الصفحة تقوم بتحديث أسماء جميع اللاعبين المستقلين في users لتطابق الأسماء الصحيحة من players.
            <br />
            <span className="text-red-600 font-bold">تنبيه: هذه العملية لا يمكن التراجع عنها!</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleFixNames} disabled={isLoading} className="mb-4">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'بدء المزامنة'}
          </Button>
          {done && (
            <div className="mb-4 text-green-700 font-bold">تمت المزامنة بنجاح! عدد العمليات: {results.length}</div>
          )}
          <div className="space-y-2">
            {results.map((res, idx) => (
              <div key={idx} className={`flex items-center gap-2 p-2 rounded ${res.status === 'updated' ? 'bg-green-50' : res.status === 'skipped' ? 'bg-gray-50' : 'bg-red-50'}`}>
                {res.status === 'updated' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {res.status === 'skipped' && <XCircle className="w-4 h-4 text-gray-400" />}
                {res.status === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                <span className="font-mono text-xs">{res.userId}</span>
                <span className="text-sm">{res.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
