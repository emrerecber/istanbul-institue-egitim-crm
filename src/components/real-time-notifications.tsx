'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  ExternalLink,
  Clock,
  Settings
} from 'lucide-react';
import { useWebSocket, NotificationData } from '@/lib/websocket-manager';
import { useTranslation } from '@/context/language-context';

interface ToastNotification extends NotificationData {
  isVisible: boolean;
  timeoutId?: NodeJS.Timeout;
}

interface NotificationCenter {
  isOpen: boolean;
  unreadCount: number;
  notifications: NotificationData[];
}

const NOTIFICATION_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const NOTIFICATION_COLORS = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

const TOAST_COLORS = {
  info: 'bg-blue-600 text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-600 text-white',
  error: 'bg-red-600 text-white',
};

export default function RealTimeNotifications() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const ws = useWebSocket();
  
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
  const [notificationCenter, setNotificationCenter] = useState<NotificationCenter>({
    isOpen: false,
    unreadCount: 0,
    notifications: []
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    const connectWebSocket = async () => {
      try {
        await ws.connect(session.user.id, session.user.email); // Using email as token for demo
        setIsConnected(true);

        // Subscribe to notifications
        ws.subscribeToNotifications((notification: NotificationData) => {
          handleNewNotification(notification);
        });

      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      ws.disconnect();
      setIsConnected(false);
    };
  }, [session, ws]);

  const handleNewNotification = (notification: NotificationData) => {
    // Add to notification center
    setNotificationCenter(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications.slice(0, 49)], // Keep last 50
      unreadCount: prev.unreadCount + 1
    }));

    // Show as toast if not persistent
    if (!notification.persistent) {
      showToast(notification);
    }

    // Play notification sound (optional)
    playNotificationSound(notification.type);

    // Show browser notification if permission granted
    showBrowserNotification(notification);
  };

  const showToast = (notification: NotificationData) => {
    const toastId = `toast-${notification.id}`;
    const toast: ToastNotification = {
      ...notification,
      isVisible: true
    };

    setToastNotifications(prev => [...prev, toast]);

    // Auto-hide after 5 seconds (unless it's an error which stays longer)
    const timeout = notification.type === 'error' ? 10000 : 5000;
    
    const timeoutId = setTimeout(() => {
      hideToast(notification.id);
    }, timeout);

    toast.timeoutId = timeoutId;
  };

  const hideToast = (notificationId: string) => {
    setToastNotifications(prev => 
      prev.map(toast => 
        toast.id === notificationId 
          ? { ...toast, isVisible: false }
          : toast
      )
    );

    // Remove from array after animation
    setTimeout(() => {
      setToastNotifications(prev => 
        prev.filter(toast => toast.id !== notificationId)
      );
    }, 300);
  };

  const playNotificationSound = (type: NotificationData['type']) => {
    // Only play sound if user hasn't disabled it
    if (localStorage.getItem('notifications-sound') === 'disabled') return;

    try {
      const audio = new Audio();
      switch (type) {
        case 'success':
          audio.src = '/sounds/success.mp3';
          break;
        case 'error':
          audio.src = '/sounds/error.mp3';
          break;
        case 'warning':
          audio.src = '/sounds/warning.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if sound can't be played
      });
    } catch (error) {
      // Ignore sound errors
    }
  };

  const showBrowserNotification = (notification: NotificationData) => {
    if (Notification.permission === 'granted' && document.hidden) {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });
      } catch (error) {
        // Ignore if notifications not supported
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const markAsRead = (notificationId: string) => {
    ws.markNotificationAsRead(notificationId);
    
    setNotificationCenter(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1)
    }));
  };

  const markAllAsRead = () => {
    notificationCenter.notifications.forEach(n => {
      if (!n.read) {
        ws.markNotificationAsRead(n.id);
      }
    });

    setNotificationCenter(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  };

  const clearAllNotifications = () => {
    setNotificationCenter(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0
    }));
  };

  const handleNotificationAction = (notification: NotificationData) => {
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
    markAsRead(notification.id);
  };

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="relative">
        <button
          onClick={() => setNotificationCenter(prev => ({ ...prev, isOpen: !prev.isOpen }))}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label={t('notifications')}
        >
          <Bell className="h-6 w-6" />
          
          {/* Connection Status Indicator */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          
          {/* Unread Count Badge */}
          {notificationCenter.unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCenter.unreadCount > 99 ? '99+' : notificationCenter.unreadCount}
            </span>
          )}
        </button>

        {/* Notification Center Dropdown */}
        {notificationCenter.isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{t('notifications')}</h3>
                <p className="text-sm text-gray-600">
                  {notificationCenter.unreadCount > 0 
                    ? `${notificationCenter.unreadCount} ${t('unread')}`
                    : t('all.caught.up')
                  }
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-purple-600 hover:text-purple-700"
                  disabled={notificationCenter.unreadCount === 0}
                >
                  {t('mark.all.read')}
                </button>
                <button
                  onClick={() => setNotificationCenter(prev => ({ ...prev, isOpen: false }))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notificationCenter.notifications.length > 0 ? (
                notificationCenter.notifications.map((notification) => {
                  const IconComponent = NOTIFICATION_ICONS[notification.type];
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <IconComponent className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          notification.type === 'info' ? 'text-blue-600' :
                          notification.type === 'success' ? 'text-green-600' :
                          notification.type === 'warning' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            {notification.message}
                          </p>
                          
                          {notification.actionUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationAction(notification);
                              }}
                              className="inline-flex items-center gap-1 mt-2 text-sm text-purple-600 hover:text-purple-700"
                            >
                              {notification.actionText || t('view.details')}
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">{t('no.notifications')}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notificationCenter.notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 flex justify-between">
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  {t('clear.all')}
                </button>
                <button
                  onClick={requestNotificationPermission}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700"
                >
                  <Settings className="h-4 w-4" />
                  {t('settings')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastNotifications.map((toast) => {
          const IconComponent = NOTIFICATION_ICONS[toast.type];
          
          return (
            <div
              key={toast.id}
              className={`max-w-sm w-full ${TOAST_COLORS[toast.type]} rounded-lg shadow-lg transform transition-all duration-300 ${
                toast.isVisible 
                  ? 'translate-x-0 opacity-100' 
                  : 'translate-x-full opacity-0'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <IconComponent className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{toast.title}</p>
                    <p className="text-sm opacity-90 mt-1">{toast.message}</p>
                    
                    {toast.actionUrl && (
                      <button
                        onClick={() => handleNotificationAction(toast)}
                        className="inline-flex items-center gap-1 mt-2 text-sm underline opacity-90 hover:opacity-100"
                      >
                        {toast.actionText || t('view.details')}
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      if (toast.timeoutId) {
                        clearTimeout(toast.timeoutId);
                      }
                      hideToast(toast.id);
                    }}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Helper function to format timestamps
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  
  return new Date(timestamp).toLocaleDateString();
}

// Hook for manually triggering notifications (for testing)
export const useNotification = () => {
  const ws = useWebSocket();

  const showNotification = (
    type: NotificationData['type'],
    title: string,
    message: string,
    options?: Partial<Pick<NotificationData, 'actionUrl' | 'actionText' | 'persistent'>>
  ) => {
    const notification: NotificationData = {
      id: `manual-${Date.now()}`,
      type,
      title,
      message,
      userId: 'current-user',
      timestamp: Date.now(),
      ...options
    };

    // Trigger through WebSocket if connected, otherwise show directly
    if (ws.isConnected()) {
      ws.send('notification', notification);
    } else {
      // Fallback: trigger directly (useful for testing)
      window.dispatchEvent(new CustomEvent('manual-notification', { 
        detail: notification 
      }));
    }
  };

  return {
    showInfo: (title: string, message: string, options?: any) => 
      showNotification('info', title, message, options),
    showSuccess: (title: string, message: string, options?: any) => 
      showNotification('success', title, message, options),
    showWarning: (title: string, message: string, options?: any) => 
      showNotification('warning', title, message, options),
    showError: (title: string, message: string, options?: any) => 
      showNotification('error', title, message, options),
  };
};