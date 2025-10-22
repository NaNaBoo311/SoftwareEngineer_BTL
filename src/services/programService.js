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
      .eq("program_code", code)
      .single();
    if (error) throw error;
    return data;
  }

  async deleteProgram(code) {
    const { error } = await supabase.from("programs").delete().eq("code", code);
    if (error) throw error;
    return { message: "Program deleted successfully" };
  }

  async getProgramsForRegistration() {
    const { data, error } = await supabase
      .from("programs")
      .select(`
        id,
        program_code,
        name,
        description,
        category,
        status,
        classes (
          id,
          class_code,
          tutor_name,
          tutor_department,
          max_students,
          current_students,
          schedules (
            id,
            day,
            period,
            weeks
          )
        )
      `)
      .eq("status", "active") // only active programs
      .order("id", { ascending: true });
  
    if (error) throw error;
  
    return data.map((program) => ({
      ...program,
      classes: (program.classes || []).map((cls) => ({
        ...cls,
        schedule: cls.schedules || [],
      })),
    }));
  }
  
}

export const programService = new ProgramService();
