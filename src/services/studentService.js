// utils/services/studentService.js
import { supabase } from "../lib/supabaseClient";

class StudentService {
  async getStudentInfoByCode(studentCode) {
    const { data, error } = await supabase
      .from("students")
      .select(`
        id,
        student_code,
        major,
        faculty,
        created_at,
        updated_at,
        users:user_id (
          id,
          full_name,
          email,
          role
        )
      `)
      .eq("student_code", studentCode)
      .single();

    if (error) throw error;

    // Format the result for cleaner frontend usage
    const formatted = {
      id: data.id,
      student_code: data.student_code,
      major: data.major,
      faculty: data.faculty,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: data.users ? {
        id: data.users.id,
        full_name: data.users.full_name,
        email: data.users.email,
        role: data.users.role,
      } : null,
    };

    return formatted;
  }

  async insertStudent(
    fullName,
    email,
    password,
    studentCode,
    major,
    faculty = "Computer Science and Engineering"
  ) {
    // Step 1: Register the user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: { full_name: fullName, role: "student" },
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
        role: "student"
      });

    if (userError) throw userError;

    // Step 3: Insert into students table
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .insert({
        user_id: userId,
        student_code: studentCode,
        major: major,
        faculty: faculty
      })
      .select()
      .single();

    if (studentError) throw studentError;

    return {
      userId,
      studentId: studentData.id,
      studentCode: studentData.student_code
    };
  }

  async getAllStudents() {
    const { data, error } = await supabase
      .from("students")
      .select(`
        id,
        student_code,
        major,
        faculty,
        created_at,
        updated_at,
        users:user_id (
          id,
          full_name,
          email,
          role
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Optional: format the result for cleaner frontend usage
    const formatted = data.map((student) => ({
      id: student.id,
      student_code: student.student_code,
      major: student.major,
      faculty: student.faculty,
      created_at: student.created_at,
      updated_at: student.updated_at,
      user: student.users ? {
        id: student.users.id,
        full_name: student.users.full_name,
        email: student.users.email,
        role: student.users.role,
      } : null,
    }));

    return formatted;
  }

  async enrollStudentInClass(studentId, classId) {
    // Step 1: Check if the class exists and has available spots
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("id, class_code, max_students, current_students, program_id")
      .eq("id", classId)
      .single();

    if (classError) throw new Error(`Class not found: ${classError.message}`);
    if (!classData) throw new Error("Class not found");

    // Check if class is full
    if (classData.current_students >= classData.max_students) {
      throw new Error("Class is full. No available spots.");
    }

    // Step 2: Check if student is already enrolled in this class
    const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
      .from("student_classes")
      .select("id")
      .eq("student_id", studentId)
      .eq("class_id", classId)
      .single();

    if (existingEnrollment) {
      throw new Error("Student is already enrolled in this class.");
    }

    // Step 3: Enroll the student in the class
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from("student_classes")
      .insert({
        student_id: studentId,
        class_id: classId
      })
      .select()
      .single();

    if (enrollmentError) throw enrollmentError;

    // Step 4: Update the current_students count in the class
    const { error: updateError } = await supabase
      .from("classes")
      .update({
        current_students: classData.current_students + 1
      })
      .eq("id", classId);

    if (updateError) {
      // If updating the count fails, we should rollback the enrollment
      await supabase
        .from("student_classes")
        .delete()
        .eq("id", enrollmentData.id);
      throw new Error("Failed to update class enrollment count. Enrollment cancelled.");
    }

    return {
      enrollmentId: enrollmentData.id,
      studentId: enrollmentData.student_id,
      classId: enrollmentData.class_id,
      enrolledAt: enrollmentData.enrolled_at,
      classCode: classData.class_code,
      programId: classData.program_id
    };
  }

  async unenrollStudentFromClass(studentId, classId) {
    // Step 1: Check if the enrollment exists
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from("student_classes")
      .select("id")
      .eq("student_id", studentId)
      .eq("class_id", classId)
      .single();

    if (enrollmentError || !enrollmentData) {
      throw new Error("Student is not enrolled in this class.");
    }

    // Step 2: Get current class data
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("id, current_students")
      .eq("id", classId)
      .single();

    if (classError) throw new Error(`Class not found: ${classError.message}`);

    // Step 3: Remove the enrollment
    const { error: deleteError } = await supabase
      .from("student_classes")
      .delete()
      .eq("id", enrollmentData.id);

    if (deleteError) throw deleteError;

    // Step 4: Update the current_students count in the class
    const { error: updateError } = await supabase
      .from("classes")
      .update({
        current_students: Math.max(0, classData.current_students - 1)
      })
      .eq("id", classId);

    if (updateError) throw new Error("Failed to update class enrollment count.");

    return {
      success: true,
      message: "Successfully unenrolled from class"
    };
  }

  async getStudentEnrollments(studentId) {
    const { data, error } = await supabase
      .from("student_classes")
      .select(`
        id,
        enrolled_at,
        classes (
          id,
          class_code,
          tutor_name,
          max_students,
          current_students,
          programs (
            id,
            program_code,
            name,
            description
          )
        )
      `)
      .eq("student_id", studentId)
      .order("enrolled_at", { ascending: false });

    if (error) throw error;

    // Format the result for cleaner frontend usage
    const formatted = data.map((enrollment) => {
      const classData = enrollment.classes;
      const programData = classData?.programs;

      return {
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolled_at,
        class: {
          id: classData?.id,
          classCode: classData?.class_code,
          tutorName: classData?.tutor_name,
          maxStudents: classData?.max_students,
          currentStudents: classData?.current_students,
        },
        program: programData ? {
          id: programData.id,
          programCode: programData.program_code,
          name: programData.name,
          description: programData.description,
        } : null,
      };
    });

    return formatted;
  }
  async getStudentWeeklySchedule(studentId) {
    const { data, error } = await supabase
      .from("student_classes")
      .select(`
        classes (
          id,
          class_code,
          tutor_name,
          programs (
            name
          ),
          schedules (
            day,
            period,
            weeks,
            room
          )
        )
      `)
      .eq("student_id", studentId);

    if (error) throw error;

    // Flatten the result to a list of schedule items
    const scheduleItems = [];
    data.forEach(enrollment => {
      const classInfo = enrollment.classes;
      if (classInfo && classInfo.schedules) {
        classInfo.schedules.forEach(schedule => {
          scheduleItems.push({
            ...schedule,
            class_code: classInfo.class_code,
            tutor_name: classInfo.tutor_name,
            program_name: classInfo.programs?.name || "Unknown Program",
            class_id: classInfo.id
          });
        });
      }
    });

    return scheduleItems;
  }
}

// Export a single shared instance
export const studentService = new StudentService();
