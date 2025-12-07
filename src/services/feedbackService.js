import { supabase } from "../lib/supabaseClient";

export const feedbackService = {
    /**
     * Submit course feedback
     * @param {Object} feedbackData - The feedback data
     * @returns {Promise<Object>} - The result of the submission
     */
    async submitFeedback(feedbackData) {
        const {
            class_id,
            student_id,
            overall_rating,
            content_quality,
            tutor_performance,
            resource_quality,
            course_structure,
            difficulty_level,
            general_comment,
            strengths,
            improvements,
            recommend_to_others
        } = feedbackData;

        const { data, error } = await supabase.rpc('submit_course_feedback', {
            p_class_id: class_id,
            p_student_id: student_id,
            p_overall_rating: overall_rating,
            p_content_quality: content_quality,
            p_tutor_performance: tutor_performance,
            p_resource_quality: resource_quality,
            p_course_structure: course_structure,
            p_difficulty_level: difficulty_level,
            p_general_comment: general_comment,
            p_strengths: strengths,
            p_improvements: improvements,
            p_recommend_to_others: recommend_to_others
        });

        if (error) {
            console.error('Error submitting feedback:', error);
            throw error;
        }

        return data;
    },

    /**
     * Get feedback for a specific student and class
     * @param {string} classId - The class ID
     * @param {string} studentId - The student ID
     * @returns {Promise<Object|null>} - The feedback object or null if not found
     */
    async getMyFeedback(classId, studentId) {
        const { data, error } = await supabase
            .from('course_feedbacks')
            .select('*')
            .eq('class_id', classId)
            .eq('student_id', studentId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No feedback found
            }
            console.error('Error fetching feedback:', error);
            throw error;
        }

        return data;
    },

    /**
     * Check if the course has ended for the student (optional, can be done in component)
     * This might involve checking the class schedule or end date.
     * For now, we will rely on the component logic or passed props.
     */
};
