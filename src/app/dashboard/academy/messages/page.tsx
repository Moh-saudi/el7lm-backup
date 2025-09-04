'use client';
import WorkingMessageCenter from '@/components/messaging/WorkingMessageCenter';
import ClientOnlyToaster from '@/components/ClientOnlyToaster';

export default function AcademyMessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientOnlyToaster position="top-center" />
      <div className="h-full">
        <WorkingMessageCenter />
      </div>
    </div>
  );
} 
