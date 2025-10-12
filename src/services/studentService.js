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

  async getAllStudent() {
    const { data, error } = await supabase.rpc("get_all_student");
    if (error) throw error;
    return data;
  }
}

// Export a single shared instance
export const studentService = new StudentService();
