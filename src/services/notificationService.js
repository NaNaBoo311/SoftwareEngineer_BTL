import { supabase } from "../lib/supabaseClient";

export const notificationService = {
    /**
     * Get all notifications for a specific user
     * @param {string} userId - The UUID of the user
     * @returns {Promise<Array>} List of notifications
     */
    async getNotifications(userId) {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Mark a notification as read
     * @param {string} notificationId - The UUID of the notification
     */
    async markAsRead(notificationId) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) throw error;
    },

    /**
     * Mark all notifications as read for a user
     * @param {string} userId 
     */
    async markAllAsRead(userId) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId);

        if (error) throw error;
    },

    /**
     * Create a single notification
     * @param {string} userId 
     * @param {string} title 
     * @param {string} message 
     * @param {string} type 
     */
    async createNotification(userId, title, message, type = 'info') {
        const { error } = await supabase
            .from('notifications')
            .insert([{ user_id: userId, title, message, type }]);

        if (error) throw error;
    },

    /**
     * Create notifications for multiple users (bulk insert)
     * @param {Array<string>} userIds - Array of user UUIDs
     * @param {string} title 
     * @param {string} message 
     * @param {string} type 
     */
    async createBulkNotifications(userIds, title, message, type = 'info') {
        if (!userIds || userIds.length === 0) return;

        const notifications = userIds.map(id => ({
            user_id: id,
            title,
            message,
            type
        }));

        const { error } = await supabase
            .from('notifications')
            .insert(notifications);

        if (error) throw error;
    }
};
