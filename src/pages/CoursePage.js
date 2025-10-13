import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";

export default function CoursePage() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Use route state course if provided (HomePage passes it), otherwise mock
  const location = useLocation();
  const routeCourse = location?.state?.course;

  const defaultCourse = {
    id,
    title: "Discrete Structures for Computing (CO1007)_Trần Tuấn Anh (CLC_HK251)",
    tags: "[CC01,CC02]",
    sections: [
      {
        id: "general",
        title: "General",
        items: [
          { id: "g1", title: "Discrete Structures for Computing (CO1007)_Video", type: "link" },
        ],
      },
      {
        id: "resource",
        title: "Resource",
        items: [
          { id: "r1", title: "Syllabus", type: "pdf" },
          { id: "r2", title: "ds11 tree", type: "pdf" },
          { id: "r3", title: "ds10connectivity", type: "pdf" },
          { id: "r4", title: "ds9graphintro", type: "pdf" },
        ],
      },
    ],
  };

  const course = {
    ...defaultCourse,
    ...(routeCourse || {}),
    // ensure sections is always an array
    sections: Array.isArray(routeCourse?.sections)
      ? routeCourse.sections
      : defaultCourse.sections,
    // prefer nicer title if passed
    title: routeCourse?.title || routeCourse?.name || (routeCourse?.code ? `${routeCourse.code} - ${routeCourse.name || ''}` : defaultCourse.title),
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Left sidebar */}
        <aside className={`bg-gray-50 border-r transition-all ${sidebarOpen ? 'w-72' : 'w-16'}`}>
          <div className="p-3 flex items-center justify-between">
            <button className="text-sm p-1" onClick={() => setSidebarOpen((s) => !s)}>
              {sidebarOpen ? 'X' : '☰'}
            </button>
            <div className="text-xs text-gray-500">{sidebarOpen ? 'Contents' : ''}</div>
          </div>

          <div className="px-3 pb-6 overflow-y-auto" style={{height: '80vh'}}>
            {course.sections.map((sec) => (
              <div key={sec.id} className="mb-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">{sec.title}</div>
                <ul className="space-y-1 text-sm">
                  {sec.items.map((it) => (
                    <li key={it.id} className="text-gray-700 hover:text-indigo-600">
                      <Link to="#" className="block py-1">{it.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-blue-700">{course.title} <span className="text-sm text-gray-500">{course.tags}</span></h1>

          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Course</button>
            <button className="px-4 py-2 bg-gray-100 rounded">Grades</button>
            <button className="px-4 py-2 bg-gray-100 rounded">Competencies</button>
          </div>

          {/* Sections */}
          <div className="mt-6 space-y-4 max-w-4xl">
            {course.sections.map((sec) => (
              <section key={sec.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">{sec.title}</h2>
                  <button className="text-sm text-blue-600">Collapse all</button>
                </div>

                <div className="mt-3 space-y-2">
                  {sec.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 p-3 border rounded">
                      <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-600 font-bold">{it.type === 'pdf' ? 'PDF' : '🔗'}</div>
                      <div className="flex-1">
                        <div className="text-sm text-blue-600">{it.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
