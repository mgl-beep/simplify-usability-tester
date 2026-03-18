import { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, Info, CheckCircle2, Settings, Trash2 } from 'lucide-react';
import { Button } from './button';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority?: 'high' | 'normal' | 'low';
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
  maxHeight?: number;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  maxHeight = 500
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    // Unread first
    if (a.read !== b.read) return a.read ? 1 : -1;
    // Then by priority
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const aPriority = priorityOrder[a.priority || 'normal'];
    const bPriority = priorityOrder[b.priority || 'normal'];
    if (aPriority !== bPriority) return aPriority - bPriority;
    // Then by timestamp
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-5 h-5 text-[#1d1d1f]" strokeWidth={2} />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div 
            className="absolute top-full right-0 mt-2 w-[400px] bg-white rounded-[16px] border border-[#d2d2d7] shadow-2xl z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200"
            style={{ maxHeight: `${maxHeight + 200}px` }}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#e5e5e7]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[18px] font-semibold text-[#1d1d1f]">
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[#636366]" strokeWidth={2} />
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-[#EEECE8] text-[#636366] hover:bg-[#e5e5e7]'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                    filter === 'unread'
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-[#EEECE8] text-[#636366] hover:bg-[#e5e5e7]'
                  }`}
                >
                  Unread ({unreadCount})
                </button>

                <div className="flex-1" />

                {/* Actions */}
                {unreadCount > 0 && onMarkAllAsRead && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-[13px] text-[#0071e3] hover:text-[#0077ed] font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div 
              className="overflow-y-auto"
              style={{ maxHeight: `${maxHeight}px` }}
            >
              {sortedNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-[#d2d2d7] mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] text-[#636366]">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </p>
                </div>
              ) : (
                <div>
                  {sortedNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-[#e5e5e7] flex items-center justify-between">
                <button
                  onClick={() => {/* Open settings */}}
                  className="flex items-center gap-1.5 text-[13px] text-[#636366] hover:text-[#0071e3] font-medium transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" strokeWidth={2} />
                  Settings
                </button>
                {onClearAll && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all notifications?')) {
                        onClearAll();
                      }
                    }}
                    className="flex items-center gap-1.5 text-[13px] text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Individual Notification Item
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const typeConfig = {
    success: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    error: {
      icon: X,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    info: {
      icon: Info,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    }
  };

  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={`p-4 border-b border-[#e5e5e7] last:border-0 transition-colors ${
        !notification.read ? 'bg-[#0071e3]/5' : 'hover:bg-[#f5f5f7]'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-[14px] font-semibold text-[#1d1d1f]">
              {notification.title}
              {!notification.read && (
                <span className="ml-2 w-2 h-2 bg-[#0071e3] rounded-full inline-block" />
              )}
            </h4>
            <span className="text-[11px] text-[#636366] flex-shrink-0">
              {formatRelativeTime(notification.timestamp)}
            </span>
          </div>

          <p className="text-[13px] text-[#636366] leading-relaxed mb-2">
            {notification.message}
          </p>

          {/* Priority Badge */}
          {notification.priority === 'high' && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 border border-red-200 rounded-full mb-2">
              <span className="text-[11px] font-semibold text-red-700">High Priority</span>
            </div>
          )}

          {/* Action Button */}
          {notification.action && (
            <Button
              onClick={notification.action.onClick}
              className="h-8 px-3 text-[13px] rounded-md bg-[#0071e3] text-white hover:bg-[#0077ed] mb-2"
            >
              {notification.action.label}
            </Button>
          )}

          {/* Footer Actions */}
          <div className="flex items-center gap-3 mt-2">
            {!notification.read && onMarkAsRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-[12px] text-[#0071e3] hover:text-[#0077ed] font-medium"
              >
                Mark as read
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(notification.id)}
                className="text-[12px] text-[#636366] hover:text-red-600 font-medium transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Notification Banner (for page-level notifications)
interface NotificationBannerProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  dismissible?: boolean;
}

export function NotificationBanner({
  type,
  title,
  message,
  action,
  onDismiss,
  dismissible = true
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    }
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <div className={`rounded-[12px] border ${c.border} ${c.bg} p-4 animate-in fade-in-0 slide-in-from-top-2 duration-200`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${c.iconColor} flex-shrink-0 mt-0.5`} strokeWidth={2} />
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-[15px] font-semibold ${c.textColor} mb-1`}>
            {title}
          </h4>
          <p className={`text-[14px] ${c.textColor} opacity-90 leading-relaxed`}>
            {message}
          </p>

          {action && (
            <Button
              onClick={action.onClick}
              className={`mt-3 h-9 px-4 rounded-md ${c.iconColor} border ${c.border} bg-white hover:bg-${type}-100 text-[14px] font-medium`}
            >
              {action.label}
            </Button>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`${c.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

// Helper Function
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
