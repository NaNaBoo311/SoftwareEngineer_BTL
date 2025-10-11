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
}

export const authService = new AuthService();
