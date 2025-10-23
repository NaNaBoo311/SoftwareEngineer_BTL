import { supabase } from "../lib/supabaseClient";

class ProgramService {
  async insertProgram(
    name,
    code,
    description = null,
    faculty = "Computer Science and Engineering",
    maxStudents = 30,
    numClasses = 1
  ) {
    // Step 1: Insert the program
    const { data: program, error: programError } = await supabase
      .from("programs")
      .insert([
        {
          program_code: code,
          name,
          description,
          category: faculty,
          max_student: maxStudents,
          num_classes: numClasses,
        },
      ])
      .select()
      .single();
  
    if (programError) throw programError;
  
    // Step 2: Create corresponding classes
    const classesToInsert = [];
    for (let i = 1; i <= numClasses; i++) {
      const classCode = `CC${String(i).padStart(2, "0")}`;
      classesToInsert.push({
        class_code: classCode,
        program_id: program.id,
        max_students: maxStudents,
      });
    }
  
    const { error: classError } = await supabase
      .from("classes")
      .insert(classesToInsert);
  
    if (classError) throw classError;
  
    // Step 3: Return the created program with its classes
    return {
      ...program,
      classes: classesToInsert,
    };
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
