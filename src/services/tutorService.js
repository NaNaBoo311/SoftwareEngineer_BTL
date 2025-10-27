import { supabase } from "../lib/supabaseClient";

class TutorService {
  async insertTutor(
    fullName,
    email,
    password,
    tutorCode,
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
}

export const tutorService = new TutorService();
