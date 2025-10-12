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
    },
    {
      id: "79748_CO2013_003183_CLC",
      code: "CO3005",
      short: "Principles of Programming Languages",
      instructor: "Nguyễn Hứa Phùng",
      faculty: "Computer Science and Engineering",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded shadow-sm">
        {/* Top controls */}
        <div className="flex items-center gap-3 p-4 border-b">
          <button className="px-3 py-1 bg-teal-600 text-white rounded">All</button>
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Tìm kiếm"
          />
          <select className="border rounded px-3 py-2">
            <option>Sort by short name</option>
          </select>
          <div className="border rounded px-3 py-2">List ▾</div>
        </div>

        {/* Semester header */}
        <div className="p-4 border-b">
          <button className="text-blue-600 font-semibold">▾ Học kỳ (Semester) 1/2025-2026</button>
        </div>

        {/* Course list */}
        <div className="p-4 space-y-3">
          {courses.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 p-3 border rounded hover:shadow-sm"
            >
              {/* Thumbnail */}
              <div className="w-28 h-14 rounded overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 flex-shrink-0">
                {/* placeholder graphic */}
              </div>

              {/* Main details */}
              <div className="flex-1">
                <div className="text-xs text-gray-500">| {c.id}</div>
                <div>
                  <Link
                    to={`/courses/${encodeURIComponent(c.id)}`}
                    className="text-sm text-teal-600 font-semibold block px-2 py-1 rounded hover:bg-teal-50 touch-manipulation"
                  >
                    {c.short}_{c.instructor} [{c.code}]
                  </Link>
                </div>
                <div className="text-xs text-gray-500">{c.faculty}</div>
              </div>

              {/* Actions (three dots) */}
              <div className="w-8 text-right">
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
