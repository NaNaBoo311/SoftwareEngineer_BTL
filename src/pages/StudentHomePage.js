import React, { useEffect, useState } from "react";
import { BookOpen, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { studentService } from "../services/studentService";

export default function StudentHomePage() {
  const { user, loading: userLoading } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch student's enrolled programs
  useEffect(() => {
    const fetchStudentPrograms = async () => {
      if (!user || !user.details?.id) {
        setLoading(false);
        return;
      }

      // Only fetch programs if user role is "student"
      if (user.role !== "student") {
        setLoading(false);
        setCourses([]);
        return;
      }

      try {
        setLoading(true);
        const enrollments = await studentService.getStudentEnrollments(user.details.id);

        // Transform enrollment data to match the expected format
        const programs = enrollments.map(enrollment => ({
          program_id: enrollment.program?.id,
          program_code: enrollment.program?.programCode,
          program_name: enrollment.program?.name,
          class_id: enrollment.class?.id,
          class_code: enrollment.class?.classCode,
          tutor_name: enrollment.class?.tutorName,
          enrolled_at: enrollment.enrolledAt
        }));

        setCourses(programs);
      } catch (error) {
        console.error("Error fetching student programs:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentPrograms();
  }, [user]);

  // Manual refresh function
  const handleRefresh = async () => {
    if (!user || !user.details?.id || user.role !== "student") return;

    try {
      setLoading(true);
      const enrollments = await studentService.getStudentEnrollments(user.details.id);

      // Transform enrollment data to match the expected format
      const programs = enrollments.map(enrollment => ({
        program_id: enrollment.program?.id,
        program_code: enrollment.program?.programCode,
        program_name: enrollment.program?.name,
        class_id: enrollment.class?.id,
        class_code: enrollment.class?.classCode,
        tutor_name: enrollment.class?.tutorName,
        enrolled_at: enrollment.enrolledAt
      }));

      setCourses(programs);
    } catch (error) {
      console.error("Error refreshing student programs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header Section */}
      {userLoading ? (
        <header className="mb-8">
          <div className="flex items-center">
            <Loader2 className="animate-spin w-6 h-6 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">
              Loading...
            </h1>
          </div>
        </header>
      ) : (
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome back, {user?.full_name || user?.email || 'User'}!
              </h1>
              {/* <p className="text-sm text-gray-500 mt-1">
                Role: {user?.role || 'Unknown'} • {user?.role === 'student' ? 'Viewing your enrolled programs' : 'Dashboard'}
              </p> */}
            </div>
            {user?.role === 'student' && (
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>
        </header>
      )}

      {/* Content based on user role */}
      {userLoading || loading ? (
        <div className="flex justify-center items-center mt-10">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
          <span className="ml-2 text-indigo-600 font-medium">
            {userLoading ? "Loading user data..." : "Loading your programs..."}
          </span>
        </div>
      ) : user?.role !== 'student' ? (
        <div className="text-center text-gray-500 mt-10">
          <BookOpen className="mx-auto w-10 h-10 mb-3 text-gray-400" />
          <p className="text-lg font-medium mb-2">Welcome to the Dashboard</p>
          <p>This page is designed for students. Your role is: <span className="font-semibold">{user?.role}</span></p>
          <p className="text-sm mt-2">Please use the navigation menu to access features available for your role.</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <BookOpen className="mx-auto w-10 h-10 mb-3 text-gray-400" />
          <p>You haven't enrolled in any programs yet.</p>
          <p className="text-sm mt-2">Visit the <Link to="/register" className="text-indigo-600 hover:underline">Program Registration</Link> page to enroll in programs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((program) => (
            <div
              key={`${program.program_id}-${program.class_code}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {program.program_code}
                </h2>
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>

              <h3 className="text-gray-700 font-medium mb-2">{program.program_name}</h3>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Tutor:</strong> {program.tutor_name}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                <strong>Class:</strong> {program.class_code}
              </p>

              <Link
                to={`/courses/${program.class_id}`}
                state={{ program }}
                className="inline-block mt-2 text-indigo-600 font-medium hover:underline text-sm"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}