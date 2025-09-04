import React from 'react';

export default function LandingLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="container max-w-xs px-1 py-2 mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 
