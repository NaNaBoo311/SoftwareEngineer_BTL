import { supabase } from "../lib/supabaseClient";

class AuthService {
  // Sign in user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { status: "Sign out successfully!" };
  }

  // Get current user session
  async getUser() {
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();
    if (sessionError || !user) throw new Error("Not logged in");

    const { data, error } = await supabase.rpc("get_user_profile", {
      uid: user.id,
    });

    if (error) throw error;
    return data?.[0]; // RPC returns an array
  }

  async deleteUserAccount(userId) {
    const { data, error } = await supabase.rpc("delete_user_account", {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  async getUserProfile() {
    // Step 1️: Get current authenticated user from Supabase Auth
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!authUser) throw new Error("No authenticated user found.");

    const userId = authUser.id;

    // Step 2️: Fetch base user info from your `users` table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error("User record not found in database.");

    // Step 3️: Depending on role, fetch student or tutor details
    let details = null;

    if (user.role === "student") {
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (studentError && studentError.code !== "PGRST116") throw studentError;
      details = student;
    } else if (user.role === "tutor") {
      const { data: tutor, error: tutorError } = await supabase
        .from("tutors")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (tutorError && tutorError.code !== "PGRST116") throw tutorError;
      details = tutor;
    }

    // Step 4️: Combine everything
    return {
      ...user,
      details,
    };
  }
}

export const authService = new AuthService();
