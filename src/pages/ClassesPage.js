import { useState } from "react";
import { Link } from "react-router-dom";

export default function ClassesPage() {
  // Dummy data for classes (mirrors screenshot structure)
  const [courses] = useState([
    {
      id: "79748_CO1007_003778_CLC",
      code: "CO1007",
      short: "Discrete Structures for Computing",
      instructor: "Nguyễn An Khương",
      faculty: "Computer Science and Engineering",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "79748_CO2013_003183_CLC",
      code: "CO3005",
      short: "Principles of Programming Languages",
      instructor: "Nguyễn Hứa Phùng",
      faculty: "Computer Science and Engineering",
      color: "from-purple-500 to-purple-600",
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Classes</h1>
          <p className="text-gray-600">Manage and access your enrolled courses</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Top controls */}
          <div className="flex items-center gap-4 p-5 border-b bg-white">
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
              All Classes
            </button>
            <div className="flex-1 relative">
              <input
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 pl-10 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                placeholder="Search for classes..."
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select className="border-2 border-gray-200 rounded-lg px-4 py-2 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none cursor-pointer">
              <option>Sort by name</option>
              <option>Sort by code</option>
              <option>Sort by instructor</option>
            </select>
            <button className="flex items-center gap-2 border-2 border-gray-200 rounded-lg px-4 py-2 hover:border-teal-500 transition-colors">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-gray-600">View</span>
            </button>
          </div>

          {/* Semester header */}
          <div className="bg-gray-50 px-5 py-4 border-b">
            <button className="flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
              Semester 1/2025-2026
            </button>
          </div>

          {/* Course list */}
          <div className="p-5 space-y-4">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex items-stretch gap-6 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white group"
              >
                {/* Course thumbnail with gradient */}
                <div className={`w-32 h-24 rounded-lg overflow-hidden bg-gradient-to-br ${c.color} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                  {c.code}
                </div>

                {/* Main details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">{c.id}</div>
                    <Link
                      to={`/course/${encodeURIComponent(c.code)}/${encodeURIComponent(c.short.replace(/\s+/g, '-'))}/course`}
                      className="text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors block mb-1"
                    >
                      {c.short}
                    </Link>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {c.instructor}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{c.faculty}</div>
                </div>

                {/* Actions menu */}
                <div className="self-start">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-gray-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
