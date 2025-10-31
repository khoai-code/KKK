'use client';

import { useState } from 'react';
import { Bell, X, Check, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning';
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    message: 'Client report generated successfully',
    timestamp: '2 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    message: 'New client data available for review',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    message: 'Cache expiring in 2 hours for ClientABC',
    timestamp: '3 hours ago',
    read: true,
  },
];

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-xl transition-all duration-300 hover:bg-[hsl(var(--color-muted))]"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--color-border))]">
              <div>
                <h3 className="font-semibold text-sm">Notifications</h3>
                <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                  {unreadCount} unread
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-7 text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--color-muted-foreground))]" />
                  <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                    No notifications
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      'group relative p-3 rounded-xl mb-1 cursor-pointer transition-all duration-200',
                      'hover:bg-[hsl(var(--color-muted)_/_0.5)]',
                      !notification.read && 'bg-[hsl(var(--color-primary)_/_0.05)]'
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[hsl(var(--color-muted-foreground))] mt-1">
                          {notification.timestamp}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-[hsl(var(--color-primary))]" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[hsl(var(--color-border))]">
              <Button
                variant="ghost"
                className="w-full text-sm text-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-muted)_/_0.5)]"
              >
                View all notifications
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
