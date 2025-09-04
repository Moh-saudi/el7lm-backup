import React from 'react';

export const AlertDialog: React.FC<{ 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  children: React.ReactNode 
}> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-md w-full mx-4">
        {children}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={() => onOpenChange(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const AlertDialogContent: React.FC<{ 
  children: React.ReactNode; 
  className?: string 
}> = ({ children, className }) => (
  <div className={`p-4 ${className || ""}`}>
    {children}
  </div>
);

export const AlertDialogHeader: React.FC<{ 
  children: React.ReactNode 
}> = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);

export const AlertDialogTitle: React.FC<{ 
  children: React.ReactNode; 
  className?: string 
}> = ({ children, className }) => (
  <h3 className={`text-lg font-semibold ${className || ""}`}>
    {children}
  </h3>
);

export const AlertDialogDescription: React.FC<{ 
  children: React.ReactNode; 
  className?: string 
}> = ({ children, className }) => (
  <p className={`text-sm text-gray-600 ${className || ""}`}>
    {children}
  </p>
);

export const AlertDialogFooter: React.FC<{ 
  children: React.ReactNode; 
  className?: string 
}> = ({ children, className }) => (
  <div className={`flex justify-end gap-3 mt-6 ${className || ""}`}>
    {children}
  </div>
);

export const AlertDialogCancel: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
  >
    {children}
  </button>
);

export const AlertDialogAction: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
}> = ({ children, onClick, className, disabled, variant = 'default' }) => {
  const baseClasses = "px-4 py-2 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = variant === 'destructive' 
    ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className || ""}`}
    >
      {children}
    </button>
  );
};
