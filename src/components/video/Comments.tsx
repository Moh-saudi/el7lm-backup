'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Send } from 'lucide-react';

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userImage: string;
  createdAt: any;
}

interface CommentsProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

export default function Comments({ videoId, isOpen, onClose, inline = false }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, videoId]);

  const fetchComments = async () => {
    try {
      // استخراج معرف اللاعب من معرف الفيديو
      const [playerId, videoIndex] = videoId.split('_');
      
      // جلب بيانات اللاعب
      const playerRef = doc(db, 'players', playerId);
      const playerDoc = await getDoc(playerRef);
      
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        const videos = playerData.videos || [];
        const videoIndexNum = parseInt(videoIndex);
        
        if (videos[videoIndexNum] && videos[videoIndexNum].comments) {
          setComments(videos[videoIndexNum].comments);
        } else {
          setComments([]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    // منع الإرسال المتكرر
    if (submitting) {
      console.log('🛑 Comment submission blocked - already submitting');
      return;
    }

    if (!comment.trim()) {
      setError('يرجى إدخال تعليق');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoId,
          comment: comment,
          userId: userId
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage('تم إرسال التعليق بنجاح!');
        setComments(prev => [...prev, result.comment]);
        setComment('');
      } else {
        setError(result.error || 'فشل في إرسال التعليق');
      }
    } catch (error: any) {
      setError('حدث خطأ في إرسال التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={inline ? "absolute inset-0 z-30 flex flex-col justify-end" : "fixed inset-0 z-50 flex flex-col justify-end"}>
      {/* Backdrop */}
      <button
        onClick={onClose}
        aria-label="إغلاق التعليقات"
        title="إغلاق التعليقات"
        className={inline ? "absolute inset-0 bg-black/40" : "absolute inset-0 bg-black/60"}
      />

      {/* Bottom Sheet Panel */}
      <div className={`relative z-10 w-full ${inline ? 'max-h-[70%]' : 'max-h-[80vh]'} bg-white rounded-t-2xl shadow-xl overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="mx-auto w-12 h-1.5 bg-gray-300 rounded-full" />
          <button onClick={onClose} aria-label="إغلاق" title="إغلاق" className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="px-4 pb-2">
          <h2 className="text-lg font-bold">التعليقات</h2>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 mt-4">
              لا توجد تعليقات بعد
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="mb-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <img
                    src={comment.userImage}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="font-semibold text-sm">{comment.userName}</p>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {comment.createdAt?.toDate?.() ? comment.createdAt.toDate().toLocaleDateString('ar-SA') : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmitComment} className="p-4 border-t bg-white">
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="اكتب تعليقاً..."
              className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              aria-label="إرسال التعليق"
              title="إرسال التعليق"
              className="p-2 text-primary hover:text-primary-dark disabled:opacity-50"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
