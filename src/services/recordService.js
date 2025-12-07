import { supabase } from "../lib/supabaseClient";

export const recordService = {
    /**
     * Get all assessments for a class
     */
    async getAssessments(classId) {
        const { data, error } = await supabase
            .from('course_assessments')
            .select('*')
            .eq('class_id', classId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * Get grades for a specific student in a class
     * Returns a map of assessment_id -> grade object
     */
    async getStudentGrades(studentId, classId) {
        const { data, error } = await supabase
            .from('student_grades')
            .select(`
            *,
            course_assessments!inner(*)
        `)
            .eq('student_id', studentId)
            .eq('course_assessments.class_id', classId);

        if (error) throw error;
        return data;
    },

    /**
     * Get attendance for a student
     * Returns array of attended weeks
     */
    async getAttendance(studentId, classId) {
        const { data, error } = await supabase
            .from('course_attendance')
            .select('attended_weeks, attended_slots')
            .eq('student_id', studentId)
            .eq('class_id', classId)
            .single();

        // Return empty arrays if no record
        if (error && error.code !== 'PGRST116') throw error;
        return {
            attendedWeeks: data?.attended_weeks || [],
            attendedSlots: data?.attended_slots || []
        };
    },

    /**
     * Save or update score
     */
    async saveGrade(studentId, assessmentId, score, status = 'graded') {
        const { data, error } = await supabase
            .from('student_grades')
            .upsert({
                student_id: studentId,
                assessment_id: assessmentId,
                score: score,
                status: status,
                updated_at: new Date().toISOString()
            }, { onConflict: 'assessment_id, student_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Save attendance
     * @param {string} studentId
     * @param {number} classId
     * @param {number[]} attendedWeeks - Array of week numbers
     */
    async saveAttendance(studentId, classId, attendedWeeks, attendedSlots) {
        const { data, error } = await supabase
            .from('course_attendance')
            .upsert({
                student_id: studentId,
                class_id: classId,
                attended_weeks: attendedWeeks,
                attended_slots: attendedSlots,
                updated_at: new Date().toISOString()
            }, { onConflict: 'class_id, student_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Batch save attendance for multiple students
     * @param {Array} attendanceRecords - Array of objects { student_id, class_id, attended_weeks, attended_slots }
     */
    async saveBulkAttendance(attendanceRecords) {
        const { data, error } = await supabase
            .from('course_attendance')
            .upsert(
                attendanceRecords.map(r => ({
                    ...r,
                    updated_at: new Date().toISOString()
                })),
                { onConflict: 'class_id, student_id' }
            )
            .select();

        if (error) throw error;
        return data;
    },

    /**
     * Initialize default assessments for a class if none exist
     * Matching the structure in the old CourseRecord dummy data
     */
    async initializeDefaultAssessments(classId) {
        const defaults = [
            { title: 'Assignment 1: Graph Theory', type: 'assignment', weight: 15, max_score: 10, due_date: new Date(Date.now() + 86400000 * 7).toISOString() },
            { title: 'Assignment 2: Tree Structures', type: 'assignment', weight: 15, max_score: 10, due_date: new Date(Date.now() + 86400000 * 14).toISOString() },
            { title: 'Assignment 3: Algorithms', type: 'assignment', weight: 20, max_score: 10, due_date: new Date(Date.now() + 86400000 * 21).toISOString() },
            { title: 'Quiz 1: Set Theory', type: 'quiz', weight: 10, max_score: 100, due_date: new Date(Date.now() + 86400000 * 5).toISOString() },
            { title: 'Quiz 2: Logic', type: 'quiz', weight: 10, max_score: 100, due_date: new Date(Date.now() + 86400000 * 12).toISOString() },
            { title: 'Quiz 3: Combinatorics', type: 'quiz', weight: 10, max_score: 100, due_date: new Date(Date.now() + 86400000 * 19).toISOString() },
            { title: 'Midterm Exam', type: 'midterm', weight: 20, max_score: 100, due_date: new Date(Date.now() + 86400000 * 30).toISOString() },
            { title: 'Final Exam', type: 'final', weight: 30, max_score: 100, due_date: new Date(Date.now() + 86400000 * 60).toISOString() },
        ];

        const records = defaults.map(d => ({ ...d, class_id: classId }));

        const { data, error } = await supabase
            .from('course_assessments')
            .insert(records)
            .select();

        if (error) throw error;
        return data;
    },

    /**
     * Get all grades for a class
     */
    async getClassGrades(classId) {
        const { data, error } = await supabase
            .from('student_grades')
            .select(`
                *,
                course_assessments!inner(class_id, weight, max_score, id)
            `)
            .eq('course_assessments.class_id', classId);

        if (error) throw error;
        return data;
    },

    /**
     * Get all attendance for a class
     */
    async getClassAttendance(classId) {
        const { data, error } = await supabase
            .from('course_attendance')
            .select('*')
            .eq('class_id', classId);

        if (error) throw error;
        return data;
    }
};
