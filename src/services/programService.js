import { supabase } from "../lib/supabaseClient";

class ProgramService {
  async insertProgram(
    name,
    code,
    description = null,
    faculty = "Computer Science and Engineering",
    maxStudents = 30,
    numClasses = 1,
    periodPerWeek = 2,
    numberOfWeek = 7
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
          period_per_week: periodPerWeek,
          number_of_week: numberOfWeek
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
          max_students,
          current_students,
          schedules (
            id,
            day,
            period,
            weeks,
            room
          )
        )
      `)
      .eq("status", "active") // only active programs
      .order("id", { ascending: true });
  
    console.log("Data", data);
    if (error) throw error;
  
    return data.map((program) => ({
      ...program,
      classes: (program.classes || []).map((cls) => ({
        ...cls,
        schedule: cls.schedules || [],
      })),
    }));
  }
  
  async getProgramsWithClasses() {
    // Fetch all programs
    const { data: programs, error: programError } = await supabase
      .from('programs')
      .select('*')
      .order('id', { ascending: true });
  
    if (programError) throw programError;
  
    // Fetch all classes with tutor_id
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .order('id', { ascending: true });
  
    if (classError) throw classError;
  
    // Merge programs with their related classes
    const formatted = programs.map((program) => {
      const relatedClasses = classes
        .filter((cls) => cls.program_id === program.id)
        .map((cls) => ({
          id: cls.id,
          class_code: cls.class_code,
          tutor_name: cls.tutor_name,
          tutor_id: cls.tutor_id,
          //  Available if no tutor is assigned
          available: !cls.tutor_name || cls.tutor_name.trim() === '',
        }));
  
      return {
        id: program.id,
        name: program.name,
        program_code: program.program_code,
        description: program.description,
        period_per_week: program.period_per_week,
        number_of_week: program.number_of_week,
        start_week: program.start_week,
        faculty: program.category,
        end_week: program.end_week,
        classes: relatedClasses,
      };
    });
  
    return formatted;
  }
  
  async getTakenSchedules() {
    // 1️ Fetch classes
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('id, class_code, tutor_name');
  
    if (classError) throw classError;
  
    // 2️ Fetch schedules
    const { data: schedules, error: scheduleError } = await supabase
      .from('schedules')
      .select('class_id, day, period, weeks, room');
  
    if (scheduleError) throw scheduleError;
  
    // 3️ Build a map of class_id → class info
    const classMap = Object.fromEntries(classes.map((cls) => [cls.id, cls]));
  
    // 4️ Group schedules by class
    const grouped = {};
  
    schedules.forEach((sch) => {
      const cls = classMap[sch.class_id];
      if (!cls) return;
  
      if (!grouped[cls.id]) {
        grouped[cls.id] = {
          class_code: cls.class_code,
          tutor_name: cls.tutor_name,
          schedules: [],
        };
      }
  
      grouped[cls.id].schedules.push({
        week: parseInt(sch.weeks, 10),  
        day: parseInt(sch.day, 10),
        period: parseInt(sch.period, 10),
        room: sch.room,
      });
    });
  
    // 5️ Convert to array
    return Object.values(grouped);

    // Example output:
    // [
    //   {
    //     class_code: 'CC02',
    //     tutor_name: 'Dr. Smith',
    //     schedules: [
    //       { week: 35, day: 1, period: 1, room: 'A1-101' },
    //       { week: 36, day: 1, period: 1, room: 'A1-101' },
    //       { week: 37, day: 1, period: 1, room: 'A1-101' }
    //     ]
    //   },
    //   {
    //     class_code: 'CC05',
    //     tutor_name: 'Prof. Johnson',
    //     schedules: [
    //       { week: 30, day: 2, period: 2, room: 'B1-201' },
    //       { week: 31, day: 2, period: 2, room: 'B1-201' },
    //       { week: 32, day: 2, period: 2, room: 'B1-201' }
    //     ]
    //   }
    // ];
  }

  async saveSchedulesForClass(classId, weekConfigurations, tutorInfo = null) {
    // 1 Flatten weekConfigurations into rows
    const newSchedules = [];
    for (const [week, config] of Object.entries(weekConfigurations)) {
      config.periods.forEach((p) => {
        newSchedules.push({
          class_id: classId,
          weeks: week.toString(),
          day: p.day.toString(),
          period: p.period.toString(),
          room: p.room,
        });
      });
    }
  
    // 2 Replace existing schedules
    const { error: deleteError } = await supabase
      .from('schedules')
      .delete()
      .eq('class_id', classId);
  
    if (deleteError) throw deleteError;
  
    const { error: insertError } = await supabase
      .from('schedules')
      .insert(newSchedules);
  
    if (insertError) throw insertError;
  

    // 3 Update class with tutor information if provided
    if (tutorInfo) {
      const { error: classUpdateError } = await supabase
        .from('classes')
        .update({
          tutor_name: tutorInfo.name,
          tutor_id: tutorInfo.id
        })
        .eq('id', classId);
  
      if (classUpdateError) throw classUpdateError;
    }
  
    // 4 Fetch the program_id of this class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('program_id')
      .eq('id', classId)
      .single();
  
    if (classError) throw classError;
  
    const programId = classData.program_id;
  
    // 5 Check if any class under this program has a tutor
    const { data: existingTutors, error: tutorError } = await supabase
      .from('classes')
      .select('id')
      .eq('program_id', programId)
      .not('tutor_name', 'is', null);
  
    if (tutorError) throw tutorError;
  
    // 6 If any class has a tutor, set program.status = 'active'
    if (existingTutors.length > 0) {
      const { error: updateError } = await supabase
        .from('programs')
        .update({ status: 'active' })
        .eq('id', programId);
  
      if (updateError) throw updateError;
    } else {
      // (Optional) If no tutor, revert to upcoming
      const { error: revertError } = await supabase
        .from('programs')
        .update({ status: 'upcoming' })
        .eq('id', programId);
  
      if (revertError) throw revertError;
    }
  
    return { success: true };
  }

  async updateTutorAssignment(classId, weekConfigurations, tutorInfo) {
    // 1 Flatten weekConfigurations into rows
    const newSchedules = [];
    for (const [week, config] of Object.entries(weekConfigurations)) {
      config.periods.forEach((p) => {
        newSchedules.push({
          class_id: classId,
          weeks: week.toString(),
          day: p.day.toString(),
          period: p.period.toString(),
          room: p.room,
        });
      });
    }
  
    // 2 Replace existing schedules for this class
    const { error: deleteError } = await supabase
      .from('schedules')
      .delete()
      .eq('class_id', classId);
  
    if (deleteError) throw deleteError;
  
    // 3 Insert new schedules
    const { error: insertError } = await supabase
      .from('schedules')
      .insert(newSchedules);
  
    if (insertError) throw insertError;
  
    // 4 Update class with tutor information
    const { error: classUpdateError } = await supabase
      .from('classes')
      .update({
        tutor_name: tutorInfo.name,
        tutor_id: tutorInfo.id
      })
      .eq('id', classId);
  
    if (classUpdateError) throw classUpdateError;
  
    return { success: true };
  }

  async unregisterTutorFromClass(classId) {
    // 1 Delete all schedules for this class
    const { error: deleteSchedulesError } = await supabase
      .from('schedules')
      .delete()
      .eq('class_id', classId);
  
    if (deleteSchedulesError) throw deleteSchedulesError;
  
    // 2 Clear tutor information from the class
    const { error: classUpdateError } = await supabase
      .from('classes')
      .update({
        tutor_name: null,
        tutor_id: null
      })
      .eq('id', classId);
  
    if (classUpdateError) throw classUpdateError;
  
    // 3 Fetch the program_id of this class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('program_id')
      .eq('id', classId)
      .single();
  
    if (classError) throw classError;
  
    const programId = classData.program_id;
  
    // 4 Check if any class under this program still has a tutor
    const { data: remainingTutors, error: tutorError } = await supabase
      .from('classes')
      .select('id')
      .eq('program_id', programId)
      .not('tutor_name', 'is', null);
  
    if (tutorError) throw tutorError;
  
    // 5 If no tutors remain, set program status to 'upcoming'
    if (remainingTutors.length === 0) {
      const { error: updateError } = await supabase
        .from('programs')
        .update({ status: 'upcoming' })
        .eq('id', programId);
  
      if (updateError) throw updateError;
    }
  
    return { success: true };
  }

}

export const programService = new ProgramService();
