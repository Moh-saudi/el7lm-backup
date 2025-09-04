'use client';
import WorkingMessageCenter from '@/components/messaging/WorkingMessageCenter';
import ClientOnlyToaster from '@/components/ClientOnlyToaster';

export default function AdminMessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-full">
        <WorkingMessageCenter />
      </div>
    </div>
  );
} 
