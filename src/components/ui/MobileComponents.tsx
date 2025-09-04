'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X, 
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Star,
  Heart,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Camera,
  Image,
  File,
  Video,
  Music,
  Archive,
  Bookmark,
  Flag,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock as ClockIcon,
  Tag,
  Hash,
  AtSign,
  Link,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  RefreshCw,
  Zap,
  Battery,
  Wifi,
  Signal,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Tv,
  Watch,
  Camera as CameraIcon,
  Video as VideoIcon,
  Image as ImageIcon,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FilePdf,
  FileWord,
  FileExcel,
  FilePowerpoint,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  FolderX,
  FolderCheck,
  FolderSearch,
  FolderHeart,
  FolderStar,
  FolderLock,
  FolderUnlock,
  FolderKey,
  FolderCog,
  FolderSettings,
  FolderUser,
  FolderUsers,
  FolderHome,
  FolderDownload,
  FolderUpload,
  FolderSync,
  FolderGit,
  FolderGit2,
  FolderCloud,
  FolderCloud2,
  FolderPlus2,
  FolderMinus2,
  FolderX2,
  FolderCheck2,
  FolderSearch2,
  FolderHeart2,
  FolderStar2,
  FolderLock2,
  FolderUnlock2,
  FolderKey2,
  FolderCog2,
  FolderSettings2,
  FolderUser2,
  FolderUsers2,
  FolderHome2,
  FolderDownload2,
  FolderUpload2,
  FolderSync2,
  FolderGit3,
  FolderGit4,
  FolderCloud3,
  FolderCloud4
} from 'lucide-react';

// ===== مكون البطاقة القابلة للطي =====
interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  children,
  defaultOpen = false,
  icon: Icon,
  badge,
  badgeColor = 'blue'
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const badgeColors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        title={title}
        aria-label={title}
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-5 h-5 text-gray-600" />}
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ===== مكون التنبيه =====
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  action
}) => {
  const alertStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  };

  const style = alertStyles[type];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-xl border ${style.bg} ${style.border}`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 ${style.iconColor}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${style.titleColor}`}>{title}</h3>
          {message && (
            <p className={`mt-1 text-sm ${style.messageColor}`}>{message}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              title={action.label}
              aria-label={action.label}
            >
              {action.label}
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ===== مكون البطاقة التفاعلية =====
interface InteractiveCardProps {
  title: string;
  subtitle?: string;
  image?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  actions?: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  }[];
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  subtitle,
  image,
  icon: Icon,
  badge,
  badgeColor = 'blue',
  actions = [],
  onClick,
  selected = false,
  disabled = false
}) => {
  const badgeColors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  const actionColors = {
    blue: 'text-blue-600 hover:bg-blue-50',
    green: 'text-green-600 hover:bg-green-50',
    red: 'text-red-600 hover:bg-red-50',
    yellow: 'text-yellow-600 hover:bg-yellow-50',
    purple: 'text-purple-600 hover:bg-purple-50',
    gray: 'text-gray-600 hover:bg-gray-50'
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`bg-white rounded-xl border transition-all duration-500 ease-out ${
        selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {image && (
            <img 
              src={image} 
              alt={title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          {Icon && !image && (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-gray-600" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 truncate">{title}</h3>
              {badge && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColors[badgeColor]}`}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className={`p-2 rounded-lg transition-colors ${actionColors[action.color || 'gray']}`}
                title={action.label}
                aria-label={action.label}
              >
                <action.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ===== مكون شريط التقدم =====
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'blue',
  size = 'md',
  showLabel = false,
  animated = false
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600'
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">التقدم</span>
          <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${sizes[size]}`}>
        <motion.div
          className={`${colors[color]} rounded-full ${sizes[size]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 1 : 0.3,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  );
};

// ===== مكون القائمة المنسدلة المتقدمة =====
interface AdvancedDropdownProps {
  trigger: React.ReactNode;
  items: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    disabled?: boolean;
    divider?: boolean;
    danger?: boolean;
  }[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: 'sm' | 'md' | 'lg';
}

export const AdvancedDropdown: React.FC<AdvancedDropdownProps> = ({
  trigger,
  items,
  position = 'bottom',
  width = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  const widthClasses = {
    sm: 'w-48',
    md: 'w-56',
    lg: 'w-64'
  };

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className={`absolute ${positionClasses[position]} ${widthClasses[width]} bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20`}
            >
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  {item.divider ? (
                    <div className="border-t border-gray-200 my-1" />
                  ) : (
                    <button
                      onClick={() => {
                        if (!item.disabled) {
                          item.onClick();
                          setIsOpen(false);
                        }
                      }}
                      disabled={item.disabled}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                        item.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : item.danger
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      title={item.label}
                      aria-label={item.label}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      <span>{item.label}</span>
                    </button>
                  )}
                </React.Fragment>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== مكون البطاقة الإحصائية المتقدمة =====
interface AdvancedStatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  trend?: {
    data: number[];
    period: string;
  };
  onClick?: () => void;
}

export const AdvancedStatCard: React.FC<AdvancedStatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  trend,
  onClick
}) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      change: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      change: 'text-green-600'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      change: 'text-red-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      change: 'text-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      change: 'text-purple-600'
    },
    gray: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      change: 'text-gray-600'
    }
  };

  const colorStyle = colors[color];

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      onClick={onClick}
      className={`bg-white rounded-xl p-4 border ${colorStyle.border} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        {Icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorStyle.bg}`}>
            <Icon className={`w-6 h-6 ${colorStyle.text}`} />
          </div>
        )}
        {change && (
          <div className="text-right">
            <span className={`text-sm font-medium ${
              change.type === 'increase' ? 'text-green-600' : 
              change.type === 'decrease' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {change.value}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>التوجه</span>
            <span>{trend.period}</span>
          </div>
          <div className="mt-1 flex items-center space-x-1">
            {trend.data.map((point, index) => (
              <div
                key={index}
                className="flex-1 bg-gray-200 rounded-sm"
                style={{ height: `${Math.max(point * 20, 2)}px` }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
