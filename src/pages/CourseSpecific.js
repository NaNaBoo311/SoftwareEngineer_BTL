import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";

export default function CourseSpecific() {
  const { courseId, courseName } = useParams();
  const location = useLocation();
  const [isGeneralExpanded, setIsGeneralExpanded] = useState(true);
  const [isResourceExpanded, setIsResourceExpanded] = useState(false);

  // Determine active tab from URL
  const activeTab = location.pathname.split("/").pop();

  // Sample course resources (you can replace with real data)
  const resources = [
    { id: "syllabus", name: "Syllabus", type: "pdf" },
    { id: "ds11", name: "ds11 tree", type: "pdf" },
    { id: "ds10", name: "ds10connectivity", type: "pdf" },
    { id: "ds9", name: "ds9graphIntro", type: "pdf" },
    { id: "ds8", name: "ds8 probability", type: "pdf" },
    { id: "ds4", name: "ds4sets", type: "pdf" },
    { id: "ds2", name: "ds2predicate", type: "pdf" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                {courseName?.replace(/-/g, " ")} ({courseId})
              </h1>
              <p className="text-gray-600 mt-1">[CC01,CC02]</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg
                className="w-6 h-6 text-gray-600"
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

          {/* Navigation Tabs */}
          <div className="flex space-x-8 mt-6">
            <Link
              to={`/course/${courseId}/${courseName}/course`}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "course"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Course
            </Link>
            <Link
              to={`/course/${courseId}/${courseName}/grades`}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "grades"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Grades
            </Link>
            <Link
              to={`/course/${courseId}/${courseName}/competencies`}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "competencies"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Competencies
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="col-span-1 space-y-4">
            {/* General Section */}
            <div className="bg-white rounded-lg shadow">
              <button
                onClick={() => setIsGeneralExpanded(!isGeneralExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <span className="font-medium text-gray-900">General</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    isGeneralExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isGeneralExpanded && (
                <div className="px-4 pb-4">
                  <Link
                    to="#"
                    className="flex items-center gap-2 text-blue-600 hover:underline py-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Video Introduction
                  </Link>
                </div>
              )}
            </div>

            {/* Resource Section */}
            <div className="bg-white rounded-lg shadow">
              <button
                onClick={() => setIsResourceExpanded(!isResourceExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <span className="font-medium text-gray-900">Resource</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    isResourceExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isResourceExpanded && (
                <div className="px-4 pb-4">
                  {resources.map((resource) => (
                    <Link
                      key={resource.id}
                      to="#"
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {resource.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {activeTab === "course" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Course Content
                  </h2>
                </div>
              )}
              {activeTab === "grades" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Grades</h2>
                </div>
              )}
              {activeTab === "competencies" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Competencies</h2>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
