'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image, 
  Video, 
  FileText,
  Calendar,
  Users,
  Target,
  BarChart3,
  Settings,
  ExternalLink
} from 'lucide-react';

// Common card wrapper component
interface AdCardWrapperProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AdCardWrapper: React.FC<AdCardWrapperProps> = ({ 
  children, 
  className = "hover:shadow-lg transition-all duration-500 ease-out transform hover:scale-[1.02]",
  onClick 
}) => (
  <Card 
    className={className}
    onClick={onClick}
  >
    {children}
  </Card>
);

// Common card header component
interface AdCardHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  className?: string;
}

export const AdCardHeader: React.FC<AdCardHeaderProps> = ({ 
  title, 
  description, 
  badge,
  className = "pb-3" 
}) => (
  <CardHeader className={className}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 mb-1">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm lg:text-base text-gray-600">
            {description}
          </CardDescription>
        )}
      </div>
      {badge && (
        <div className="ml-4">
          {badge}
        </div>
      )}
    </div>
  </CardHeader>
);

// Common card content component
interface AdCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const AdCardContent: React.FC<AdCardContentProps> = ({ 
  children, 
  className = "pt-0" 
}) => (
  <CardContent className={className}>
    {children}
  </CardContent>
);

// Common button component
interface AdButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
}

export const AdButton: React.FC<AdButtonProps> = ({
  onClick,
  children,
  variant = "default",
  size = "sm",
  className = "h-8 lg:h-10 text-sm lg:text-base font-semibold",
  disabled = false
}) => (
  <Button
    onClick={onClick}
    variant={variant}
    size={size}
    className={className}
    disabled={disabled}
  >
    {children}
  </Button>
);

// Common badge component
interface AdBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export const AdBadge: React.FC<AdBadgeProps> = ({
  children,
  variant = "default",
  className = "text-xs lg:text-sm"
}) => (
  <Badge variant={variant} className={className}>
    {children}
  </Badge>
);

// Status badge component
interface StatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  isActive, 
  className = "text-xs lg:text-sm" 
}) => (
  <AdBadge
    variant={isActive ? "default" : "destructive"}
    className={`${className} ${isActive ? 'bg-green-100 text-green-800' : ''}`}
  >
    {isActive ? '✅ نشط' : '❌ غير نشط'}
  </AdBadge>
);

// Type badge component
interface TypeBadgeProps {
  type: 'video' | 'image' | 'text';
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ 
  type, 
  className = "text-xs lg:text-sm" 
}) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'video':
        return { icon: '🎥', text: 'فيديو', color: 'bg-purple-100 text-purple-700' };
      case 'image':
        return { icon: '🖼️', text: 'صورة', color: 'bg-blue-100 text-blue-700' };
      case 'text':
        return { icon: '📝', text: 'نص', color: 'bg-gray-100 text-gray-700' };
      default:
        return { icon: '📄', text: 'إعلان', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const config = getTypeConfig(type);

  return (
    <AdBadge className={`${className} ${config.color}`}>
      {config.icon} {config.text}
    </AdBadge>
  );
};

// Audience badge component
interface AudienceBadgeProps {
  audience: 'all' | 'new_users' | 'returning_users';
  className?: string;
}

export const AudienceBadge: React.FC<AudienceBadgeProps> = ({ 
  audience, 
  className = "text-xs lg:text-sm" 
}) => {
  const getAudienceConfig = (audience: string) => {
    switch (audience) {
      case 'all':
        return { icon: '👥', text: 'للجميع', color: 'bg-blue-100 text-blue-700' };
      case 'new_users':
        return { icon: '🆕', text: 'مستخدمين جدد', color: 'bg-green-100 text-green-700' };
      case 'returning_users':
        return { icon: '🔄', text: 'مستخدمين عائدين', color: 'bg-orange-100 text-orange-700' };
      default:
        return { icon: '👤', text: audience, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const config = getAudienceConfig(audience);

  return (
    <AdBadge className={`${className} ${config.color}`}>
      {config.icon} {config.text}
    </AdBadge>
  );
};

// Stats display component
interface StatsDisplayProps {
  views: number;
  clicks: number;
  className?: string;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  views, 
  clicks, 
  className = "flex items-center gap-4 text-xs lg:text-sm text-gray-500" 
}) => (
  <div className={className}>
    <span className="flex items-center gap-1">
      <Eye className="h-3 w-3 lg:h-4 lg:w-4" />
      {views}
    </span>
    <span className="flex items-center gap-1">
      <Target className="h-3 w-3 lg:h-4 lg:w-4" />
      {clicks}
    </span>
  </div>
);

// Action buttons component
interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isActive: boolean;
  className?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  onToggleStatus,
  isActive,
  className = "flex items-center gap-2"
}) => (
  <div className={className}>
    <AdButton
      onClick={onEdit}
      variant="outline"
      size="sm"
      className="h-8 lg:h-10 px-3 lg:px-4"
    >
      <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
      تعديل
    </AdButton>
    
    <AdButton
      onClick={onToggleStatus}
      variant="outline"
      size="sm"
      className="h-8 lg:h-10 px-3 lg:px-4"
    >
      {isActive ? (
        <>
          <EyeOff className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
          إخفاء
        </>
      ) : (
        <>
          <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
          إظهار
        </>
      )}
    </AdButton>
    
    <AdButton
      onClick={onDelete}
      variant="destructive"
      size="sm"
      className="h-8 lg:h-10 px-3 lg:px-4"
    >
      <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
      حذف
    </AdButton>
  </div>
);

// Media preview component
interface MediaPreviewProps {
  type: 'video' | 'image' | 'text';
  mediaUrl?: string;
  className?: string;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  type,
  mediaUrl,
  className = "w-full h-32 lg:h-40 bg-gray-100 rounded-lg flex items-center justify-center"
}) => {
  if (type === 'text' || !mediaUrl) {
    return (
      <div className={className}>
        <FileText className="h-8 w-8 lg:h-12 lg:w-12 text-gray-400" />
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className={className}>
        <img
          src={mediaUrl}
          alt="Ad media"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className={`${className} relative`}>
        <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
        <Video className="h-8 w-8 lg:h-12 lg:w-12 text-white relative z-10" />
      </div>
    );
  }

  return null;
};

// Priority indicator component
interface PriorityIndicatorProps {
  priority: number;
  className?: string;
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({
  priority,
  className = "text-xs lg:text-sm"
}) => {
  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600 bg-red-100';
    if (priority >= 5) return 'text-orange-600 bg-orange-100';
    if (priority >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <AdBadge className={`${className} ${getPriorityColor(priority)}`}>
      ⭐ أولوية {priority}
    </AdBadge>
  );
};

