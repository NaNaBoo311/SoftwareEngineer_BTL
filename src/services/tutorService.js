import { supabase } from "../lib/supabaseClient";

class TutorService {
  async insertTutor(
    fullName,
    email,
    password,
    tutorCode,
    program,
    faculty,
    title
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

    // Step 2: Insert into users + tutors tables
    const { data, error } = await supabase.rpc("insert_tutor_profile", {
      p_user_id: userId,
      p_full_name: fullName,
      p_email: email,
      p_tutor_code: tutorCode,
      p_program: program,
      p_faculty: faculty,
      p_title: title,
    });

    if (error) throw error;

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
}

export const tutorService = new TutorService();
