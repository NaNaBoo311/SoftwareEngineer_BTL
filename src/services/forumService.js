import { supabase } from "../lib/supabaseClient";

class ForumService {
    /**
     * Get all topics for a class with author details and reply count
     * @param {number} classId 
     * @param {string} category (optional)
     * @param {string} searchQuery (optional)
     */
    async getTopics(classId, category = 'All', searchQuery = '') {
        let query = supabase
            .from('course_forum_topics')
            .select(`
        *,
        author:users (
          id,
          full_name,
          email,
          role
        ),
        replies:course_forum_replies (count)
      `)
            .eq('class_id', classId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (category !== 'All') {
            query = query.eq('category', category);
        }

        if (searchQuery) {
            query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map(topic => ({
            ...topic,
            repliesCount: topic.replies[0]?.count || 0,
            authorName: topic.author?.full_name || 'Unknown',
            authorRole: topic.author?.role || 'student'
        }));
    }

    /**
     * Create a new topic
     * @param {Object} topicData 
     */
    async createTopic(topicData) {
        const { data, error } = await supabase
            .from('course_forum_topics')
            .insert([topicData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get replies for a specific topic
     * @param {string} topicId 
     */
    async getReplies(topicId) {
        const { data, error } = await supabase
            .from('course_forum_replies')
            .select(`
        *,
        author:users (
          id,
          full_name,
          email,
          role
        )
      `)
            .eq('topic_id', topicId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map(reply => ({
            ...reply,
            authorName: reply.author?.full_name || 'Unknown',
            authorRole: reply.author?.role || 'student'
        }));
    }

    /**
     * Create a new reply
     * @param {Object} replyData 
     */
    async createReply(replyData) {
        const { data, error } = await supabase
            .from('course_forum_replies')
            .insert([replyData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Increment view count for a topic
     * @param {string} topicId 
     */
    async incrementViews(topicId) {
        // This is a simple counter update, might be better as an RPC but simple update works for now
        const { error } = await supabase.rpc('increment_topic_views', { topic_id_param: topicId });

        // If RPC doesn't exist, we can fall back to fetch-and-update or just ignore (not critical)
        if (error) {
            console.warn("View increment RPC failed, trying simplified update or skipping.", error);
        }
    }
}

export const forumService = new ForumService();
