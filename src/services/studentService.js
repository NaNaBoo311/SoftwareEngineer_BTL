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

  async insertStudent(fullName, email, studentCode, program, major) {
    const { data, error } = await supabase.rpc("insert_student", {
      p_full_name: fullName,
      p_email: email,
      p_student_code: studentCode,
      p_program: program,
      p_major: major,
    });
    if (error) throw error;
    return data;
  }

  async getAllStudent() {
    const { data, error } = await supabase.rpc("get_all_student");
    if (error) throw error;
    return data;
  }
}

// Export a single shared instance
export const studentService = new StudentService();
