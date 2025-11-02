import React, { useEffect, useState } from "react";
import { BookOpen, Loader2, RefreshCw, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { tutorService } from "../services/tutorService";

export default function TutorHomePage() {
  const { user, loading: userLoading } = useUser();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tutor's enrolled classes
  useEffect(() => {
    const fetchTutorClasses = async () => {
      if (!user || !user.details?.id) {
        setLoading(false);
        return;
      }

      // Only fetch classes if user role is "tutor"
      if (user.role !== "tutor") {
        setLoading(false);
        setClasses([]);
        return;
      }

      try {
        setLoading(true);
        const enrollments = await tutorService.getTutorEnrollments(user.details.id);
        setClasses(enrollments);
      } catch (error) {
        console.error("Error fetching tutor classes:", error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorClasses();
  }, [user]);

  // Manual refresh function
  const handleRefresh = async () => {
    if (!user || !user.details?.id || user.role !== "tutor") return;
    
    try {
      setLoading(true);
      const enrollments = await tutorService.getTutorEnrollments(user.details.id);
      setClasses(enrollments);
    } catch (error) {
      console.error("Error refreshing tutor classes:", error);
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
                Role: {user?.role || 'Unknown'} • {user?.role === 'tutor' ? 'Viewing your teaching classes' : 'Dashboard'}
              </p> */}
            </div>
            {user?.role === 'tutor' && (
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
            {userLoading ? "Loading user data..." : "Loading your classes..."}
          </span>
        </div>
      ) : user?.role !== 'tutor' ? (
        <div className="text-center text-gray-500 mt-10">
          <BookOpen className="mx-auto w-10 h-10 mb-3 text-gray-400" />
          <p className="text-lg font-medium mb-2">Welcome to the Dashboard</p>
          <p>This page is designed for tutors. Your role is: <span className="font-semibold">{user?.role}</span></p>
          <p className="text-sm mt-2">Please use the navigation menu to access features available for your role.</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <BookOpen className="mx-auto w-10 h-10 mb-3 text-gray-400" />
          <p>You don't have any assigned classes yet.</p>
          <p className="text-sm mt-2">Classes will appear here once they are assigned to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {classItem.programs?.program_code || 'N/A'}
                </h2>
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>

              <h3 className="text-gray-700 font-medium mb-2">
                {classItem.programs?.name || 'Unnamed Program'}
              </h3>
              
              <p className="text-sm text-gray-500 mb-1">
                <strong>Class:</strong> {classItem.class_code}
              </p>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Users className="w-4 h-4" />
                <span>
                  <strong>Students:</strong> {classItem.current_students || 0} / {classItem.max_students || 0}
                </span>
              </div>

              <Link
                to={`/classes/${classItem.id}`}
                state={{ classItem }}
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
