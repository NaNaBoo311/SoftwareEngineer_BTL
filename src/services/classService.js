import { supabase } from "../lib/supabaseClient";

class ClassService {
    /**
     * Get all students enrolled in a specific class
     * @param {number} classId - The ID of the class
     * @returns {Promise<Array>} Array of students with their details
     */
    async getStudentsInClass(classId) {
        const { data, error } = await supabase
            .from("student_classes")
            .select(`
        id,
        enrolled_at,
        students (
          id,
          student_code,
          major,
          faculty,
          users:user_id (
            id,
            full_name,
            email
          )
        )
      `)
            .eq("class_id", classId)
            .order("enrolled_at", { ascending: true });

        if (error) throw error;

        // Format the result for cleaner frontend usage
        const formatted = data.map((enrollment) => {
            const student = enrollment.students;
            const user = student?.users;

            return {
                enrollmentId: enrollment.id,
                enrolledAt: enrollment.enrolled_at,
                studentId: student?.id,
                studentCode: student?.student_code,
                major: student?.major,
                faculty: student?.faculty,
                fullName: user?.full_name || "N/A",
                email: user?.email || "N/A",
            };
        });

        return formatted;
    }

    /**
     * Get a specific student's record in a class (for future use with grades)
     * @param {string} studentId - The UUID of the student
     * @param {number} classId - The ID of the class
     * @returns {Promise<Object>} Student record details
     */
    async getStudentRecordInClass(studentId, classId) {
        const { data, error } = await supabase
            .from("student_classes")
            .select(`
        id,
        enrolled_at,
        students (
          id,
          student_code,
          major,
          faculty,
          users:user_id (
            id,
            full_name,
            email
          )
        ),
        classes (
          id,
          class_code,
          programs (
            id,
            program_code,
            name
          )
        )
      `)
            .eq("student_id", studentId)
            .eq("class_id", classId)
            .single();

        if (error) throw error;

        const student = data.students;
        const user = student?.users;
        const classData = data.classes;
        const program = classData?.programs;

        return {
            enrollmentId: data.id,
            enrolledAt: data.enrolled_at,
            student: {
                id: student?.id,
                studentCode: student?.student_code,
                major: student?.major,
                faculty: student?.faculty,
                fullName: user?.full_name || "N/A",
                email: user?.email || "N/A",
            },
            class: {
                id: classData?.id,
                classCode: classData?.class_code,
                programCode: program?.program_code,
                programName: program?.name,
            },
        };
    }

    /**
     * Get class details by ID
     * @param {number} classId - The ID of the class
     * @returns {Promise<Object>} Class details
     */
    async getClassById(classId) {
        const { data, error } = await supabase
            .from("classes")
            .select(`
        id,
        class_code,
        tutor_name,
        max_students,
        current_students,
        programs (
          id,
          program_code,
          name,
          description
        )
      `)
            .eq("id", classId)
            .single();

        if (error) throw error;

        return {
            id: data.id,
            classCode: data.class_code,
            tutorName: data.tutor_name,
            maxStudents: data.max_students,
            currentStudents: data.current_students,
            program: data.programs ? {
                id: data.programs.id,
                programCode: data.programs.program_code,
                name: data.programs.name,
                description: data.programs.description,
            } : null,
        };
    }
}

// Export a single shared instance
export const classService = new ClassService();
