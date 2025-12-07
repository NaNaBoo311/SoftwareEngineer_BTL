import { supabase } from "../lib/supabaseClient";

class TutorService {
  async insertTutor(
    fullName,
    email,
    password,
    tutorCode,
    faculty,
    title,
    teachingYear = 0,
    ratingStar = 0
  ) {
    // Step 1: Register the user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: { full_name: fullName, role: "tutor" },
        },
      }
    );

    if (signUpError) throw signUpError;

    const userId = signUpData.user?.id;
    if (!userId) throw new Error("User ID not returned from Supabase Auth.");

    // Step 2: Insert into users table
    const { error: userError } = await supabase
      .from("users")
      .insert({
        id: userId,
        full_name: fullName,
        email: email,
        role: "tutor",
      });

    if (userError) throw userError;

    // Step 3: Insert into tutors table
    const { error: tutorError } = await supabase
      .from("tutors")
      .insert({
        user_id: userId,
        tutor_code: tutorCode,
        faculty: faculty,
        title: title,
        teaching_year: teachingYear,
        rating_star: ratingStar,
      });

    if (tutorError) throw tutorError;

    return { userId };
  }

  async getAllTutor() {
    const { data, error } = await supabase.rpc("get_all_tutor");
    if (error) throw error;
    return data;
  }

  async getTutorInfoByCode(tutorCode) {
    const { data, error } = await supabase.rpc("get_tutor_info_by_code", {
      p_tutor_code: tutorCode,
    });
    if (error) throw error;
    return data;
  }

  async getTutorSchedules(tutorId) {
    const { data, error } = await supabase
      .from("schedules")
      .select(`
        id,
        day,
        period,
        weeks,
        room,
        created_at,
        class:class_id (
          id,
          class_code,
          tutor_name,
          program:program_id (
            id,
            program_code,
            name,
            start_week,
            end_week,
            number_of_week,
            period_per_week
          )
        )
      `)
      .eq("class.tutor_id", tutorId);

    if (error) {
      console.error("Error fetching tutor schedules:", error);
      return [];
    }

    return data;
  }

  async getTutorEnrollments(tutorId) {
    const { data, error } = await supabase
      .from('classes')
      .select(`
      id,
      class_code,
      current_students,
      max_students,
      programs (
        id,
        program_code,
        name,
        status
      )
    `)
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tutor enrollments:', error);
      throw error;
    }

    return data;
  }



}

export const tutorService = new TutorService();
