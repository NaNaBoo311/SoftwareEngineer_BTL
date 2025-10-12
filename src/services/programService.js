import { supabase } from "../lib/supabaseClient";

class ProgramService {
  async insertProgram(
    name,
    code,
    description = null,
    faculty = "Computer Science and Engineering",
    maxStudents = 30
  ) {
    const { data, error } = await supabase.rpc("insert_program", {
      p_name: name,
      p_code: code,
      p_description: description,
      p_faculty: faculty,
      p_max_students: maxStudents,
    });

    if (error) throw error;
    return data;
  }

  async getAllPrograms() {
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async getProgramByCode(code) {
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .eq("code", code)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteProgram(code) {
    const { error } = await supabase.from("programs").delete().eq("code", code);
    if (error) throw error;
    return { message: "Program deleted successfully" };
  }
}

export const programService = new ProgramService();
