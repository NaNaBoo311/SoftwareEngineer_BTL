import { supabase } from "../lib/supabaseClient";

class ProfileService {
    /**
     * Get complete student profile with enrolled classes
     * @param {string} userId - The user ID from auth
     * @returns {Promise<Object>} Student profile with classes
     */
    async getStudentProfile(userId) {
        // Step 1: Get student record with user info
        const { data: student, error: studentError } = await supabase
            .from("students")
            .select(`
        id,
        student_code,
        major,
        faculty,
        gpa,
        academic_year,
        created_at,
        updated_at,
        users:user_id (
          id,
          full_name,
          email,
          role
        )
      `)
            .eq("user_id", userId)
            .single();

        if (studentError) throw studentError;
        if (!student) throw new Error("Student record not found");

        // Step 2: Get enrolled classes with program and schedule details
        const { data: enrollments, error: enrollmentError } = await supabase
            .from("student_classes")
            .select(`
        id,
        enrolled_at,
        classes (
          id,
          class_code,
          max_students,
          current_students,
          programs (
            id,
            program_code,
            name,
            description
          ),
          schedules (
            id,
            day,
            period,
            weeks,
            room
          ),
          tutors (
            id,
            tutor_code,
            users:user_id (
              full_name
            )
          )
        )
      `)
            .eq("student_id", student.id)
            .order("enrolled_at", { ascending: false });

        if (enrollmentError) throw enrollmentError;

        // Step 3: Format the enrolled classes
        const enrolledClasses = (enrollments || []).map((enrollment) => {
            const classData = enrollment.classes;
            const programData = classData?.programs;
            const tutorData = classData?.tutors;
            const schedules = classData?.schedules || [];

            return {
                enrollmentId: enrollment.id,
                enrolledAt: enrollment.enrolled_at,
                classId: classData?.id,
                classCode: classData?.class_code,
                maxStudents: classData?.max_students,
                currentStudents: classData?.current_students,
                program: programData ? {
                    id: programData.id,
                    code: programData.program_code,
                    name: programData.name,
                    description: programData.description,
                } : null,
                tutor: tutorData?.users ? {
                    name: tutorData.users.full_name,
                } : null,
                schedules: schedules.map(s => ({
                    id: s.id,
                    day: s.day,
                    period: s.period,
                    weeks: s.weeks,
                    room: s.room,
                })),
            };
        });

        // Step 4: Return formatted profile
        return {
            id: student.id,
            studentCode: student.student_code,
            major: student.major,
            faculty: student.faculty,
            gpa: student.gpa,
            academicYear: student.academic_year,
            createdAt: student.created_at,
            updatedAt: student.updated_at,
            user: student.users ? {
                id: student.users.id,
                fullName: student.users.full_name,
                email: student.users.email,
                role: student.users.role,
            } : null,
            enrolledClasses,
        };
    }

    /**
     * Get complete tutor profile with teaching classes
     * @param {string} userId - The user ID from auth
     * @returns {Promise<Object>} Tutor profile with classes
     */
    async getTutorProfile(userId) {
        // Step 1: Get tutor record with user info
        const { data: tutor, error: tutorError } = await supabase
            .from("tutors")
            .select(`
        id,
        tutor_code,
        faculty,
        title,
        teaching_year,
        users:user_id (
          id,
          full_name,
          email,
          role
        )
      `)
            .eq("user_id", userId)
            .single();

        if (tutorError) throw tutorError;
        if (!tutor) throw new Error("Tutor record not found");

        // Step 2: Get teaching classes with program and schedule details
        const { data: classes, error: classError } = await supabase
            .from("classes")
            .select(`
        id,
        class_code,
        max_students,
        current_students,
        created_at,
        programs (
          id,
          program_code,
          name,
          description
        ),
        schedules (
          id,
          day,
          period,
          weeks,
          room
        )
      `)
            .eq("tutor_id", tutor.id)
            .order("created_at", { ascending: false });

        if (classError) throw classError;

        // Step 3: Format the teaching classes
        const teachingClasses = (classes || []).map((classData) => {
            const programData = classData.programs;
            const schedules = classData.schedules || [];

            return {
                classId: classData.id,
                classCode: classData.class_code,
                maxStudents: classData.max_students,
                currentStudents: classData.current_students,
                createdAt: classData.created_at,
                program: programData ? {
                    id: programData.id,
                    code: programData.program_code,
                    name: programData.name,
                    description: programData.description,
                } : null,
                schedules: schedules.map(s => ({
                    id: s.id,
                    day: s.day,
                    period: s.period,
                    weeks: s.weeks,
                    room: s.room,
                })),
            };
        });

        // Step 4: Return formatted profile
        return {
            id: tutor.id,
            tutorCode: tutor.tutor_code,
            faculty: tutor.faculty,
            title: tutor.title,
            teachingYear: tutor.teaching_year,
            user: tutor.users ? {
                id: tutor.users.id,
                fullName: tutor.users.full_name,
                email: tutor.users.email,
                role: tutor.users.role,
            } : null,
            teachingClasses,
        };
    }

    /**
     * Update student profile information
     * @param {string} studentId - The student ID
     * @param {Object} updates - Fields to update (major, faculty, gpa, academic_year)
     * @returns {Promise<Object>} Updated student data
     */
    async updateStudentProfile(studentId, updates) {
        const allowedFields = ['major', 'faculty', 'gpa', 'academic_year'];
        const filteredUpdates = {};

        // Only include allowed fields
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        // Add updated_at timestamp
        filteredUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from("students")
            .update(filteredUpdates)
            .eq("id", studentId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update tutor profile information
     * @param {string} tutorId - The tutor ID
     * @param {Object} updates - Fields to update (faculty, title, teaching_year)
     * @returns {Promise<Object>} Updated tutor data
     */
    async updateTutorProfile(tutorId, updates) {
        const allowedFields = ['faculty', 'title', 'teaching_year'];
        const filteredUpdates = {};

        // Only include allowed fields
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        const { data, error } = await supabase
            .from("tutors")
            .update(filteredUpdates)
            .eq("id", tutorId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update user's full name and email in users table
     * @param {string} userId - The user ID
     * @param {Object} updates - Fields to update (full_name, email)
     * @returns {Promise<Object>} Updated user data
     */
    async updateUserInfo(userId, updates) {
        const allowedFields = ['full_name', 'email'];
        const filteredUpdates = {};

        // Only include allowed fields
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        const { data, error } = await supabase
            .from("users")
            .update(filteredUpdates)
            .eq("id", userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

// Export a single shared instance
export const profileService = new ProfileService();
