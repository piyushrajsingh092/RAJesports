import { supabase } from '../supabaseClient';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'info'
) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type
            });

        if (error) {
            console.error('Error creating notification:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
};

export const markAsRead = async (notificationId: string) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);

        if (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
};

export const getUserNotifications = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};
