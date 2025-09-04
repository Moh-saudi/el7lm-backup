import React from 'react';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="container max-w-2xl px-4 py-6 mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 
