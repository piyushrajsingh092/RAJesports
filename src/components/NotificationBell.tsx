import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from './ui/Button';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    created_at: string;
}

export function NotificationBell() {
    const { currentUser, notifications, fetchNotifications, markNotificationAsRead } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
        }
    }, [currentUser, fetchNotifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'warning': return 'text-yellow-600';
            default: return 'text-blue-600';
        }
    };

    if (!currentUser) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-muted rounded-full transition-colors"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b">
                        <h3 className="font-bold">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/30' : ''}`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <p className={`font-semibold ${getTypeColor(notification.type)}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                            >
                                                Mark read
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
