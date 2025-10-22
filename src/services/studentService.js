// utils/services/studentService.js
import { supabase } from "../lib/supabaseClient";

class StudentService {
  async getStudentInfoByCode(studentCode) {
    const { data, error } = await supabase.rpc("get_student_info_by_code", {
      p_student_code: studentCode,
    });
    if (error) throw error;
    return data;
  }

  async getStudentProgramRegistrations(studentId) {
    // Step 1: fetch the programs/classes the student is enrolled in
    const { data, error } = await supabase
      .from("student_classes")
      .select(`
        id,
        enrolled_at,
        classes (
          id,
          class_code,
          tutor_name,
          tutor_department,
          programs (
            id,
            program_code,
            name
          )
        )
      `)
      .eq("student_id", studentId)
      .order("enrolled_at", { ascending: false });

    if (error) throw error;

    // Step 2: reformat results for cleaner frontend usage
    const enrolledPrograms = data.map((enrollment) => {
      const cls = enrollment.classes;
      const prog = cls?.programs;

      return {
        program_id: prog?.id,
        program_code: prog?.program_code,
        program_name: prog?.name,
        class_code: cls?.class_code,
        tutor_name: cls?.tutor_name,
        tutor_department: cls?.tutor_department,
        enrolled_at: enrollment.enrolled_at,
      };
    });

    return enrolledPrograms;
  }

  async insertStudent(
    fullName,
    email,
    password,
    studentCode,
    program,
    major,
    faculty = "Computer Science and Engineering"
  ) {
    // Step 1: Register the user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: { full_name: fullName, role: "student" },
        },
      }
    );

    if (signUpError) throw signUpError;

    const userId = signUpData.user?.id;
    if (!userId) throw new Error("User ID not returned from Supabase Auth.");

    // Step 2: Insert into custom users + students tables
    const { data, error } = await supabase.rpc("insert_student_profile", {
      p_user_id: userId,
      p_full_name: fullName,
      p_email: email,
      p_student_code: studentCode,
      p_program: program,
      p_major: major,
      p_faculty: faculty,
    });

    if (error) throw error;

    return { userId };
  }

  async getAllStudents() {
    const { data, error } = await supabase
      .from("students")
      .select(`
        id,
        student_code,
        program,
        major,
        faculty,
        created_at,
        updated_at,
        users:user_id (
          id,
          full_name,
          email,
          role
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Optional: format the result for cleaner frontend usage
    const formatted = data.map((student) => ({
      id: student.id,
      student_code: student.student_code,
      program: student.program,
      major: student.major,
      faculty: student.faculty,
      created_at: student.created_at,
      updated_at: student.updated_at,
      user: student.users ? {
        id: student.users.id,
        full_name: student.users.full_name,
        email: student.users.email,
        role: student.users.role,
      } : null,
    }));

    return formatted;
  }
}

// Export a single shared instance
export const studentService = new StudentService();
