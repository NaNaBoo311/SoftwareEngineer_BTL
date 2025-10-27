import React, { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const user = { name: "Pham Nam An", role: "Student" }; // Mocked for now

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulated API fetch
  useEffect(() => {
    // Replace with actual API call: fetch(`/api/courses?studentId=${user.id}`)
    setTimeout(() => {
      setCourses([
        {
          id: 1,
          code: "CS101",
          name: "Introduction to Programming",
          tutor: "Nguyen Van A",
          schedule: "Mon & Wed, 9:00–10:30",
          location: "Room B1-203",
        },
        {
          id: 2,
          code: "MA201",
          name: "Linear Algebra",
          tutor: "Tran Thi B",
          schedule: "Tue & Thu, 13:00–14:30",
          location: "Online (Zoom)",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user.name}! 👋
        </h1>
      </header>

      {/* Course List */}
      {loading ? (
        <div className="flex justify-center items-center mt-10">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
          <span className="ml-2 text-indigo-600 font-medium">
            Loading courses...
          </span>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <BookOpen className="mx-auto w-10 h-10 mb-3 text-gray-400" />
          <p>You haven’t enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {course.code}
                </h2>
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>

              <h3 className="text-gray-700 font-medium mb-2">{course.name}</h3>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Tutor:</strong> {course.tutor}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Schedule:</strong> {course.schedule}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                <strong>Location:</strong> {course.location}
              </p>

              <Link
                to={`/courses/${course.id}`}
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
