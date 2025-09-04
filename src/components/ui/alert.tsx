import React from "react";

export const Alert: React.FC<{ children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }> = ({
  children,
  open,
  onOpenChange,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative">
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

export const AlertContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`rounded-md p-4 ${className || ""}`}>{children}</div>
);

export const AlertHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const AlertTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={`text-lg font-semibold ${className || ""}`}>{children}</h3>
);

export const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <p className={`text-sm ${className || ""}`}>{children}</p>;

export const AlertDialog: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }> = ({
  open,
  onOpenChange,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative">
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

export const AlertDialogContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={`p-4 ${className || ""}`}>{children}</div>;

export const AlertDialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const AlertDialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <h3 className={`text-lg font-semibold ${className || ""}`}>{children}</h3>;

export const AlertDialogDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <p className={`text-sm ${className || ""}`}>{children}</p>;
