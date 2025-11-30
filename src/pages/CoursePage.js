import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import LearningResourcesModal from "../components/LearningResourcesModal";
import CommunityForum from "../components/CommunityForum";
import CourseRecord from "../components/CourseRecord";
import CourseFeedback from "../components/CourseFeedback";

export default function CoursePage() {
  const { user } = useUser();
  const { id } = useParams();
  const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
  const [addedResources, setAddedResources] = useState([]);
  const [activeTab, setActiveTab] = useState('course'); // 'course', 'record', 'community', or 'feedback'

  // Use route state course if provided (HomePage passes it), otherwise mock
  const location = useLocation();
  const routeCourse = location?.state?.course;
  const classItem = location?.state?.classItem; // From TutorHomePage
  const program = location?.state?.program; // From StudentHomePage

  const defaultCourse = {
    id,
    title: "Discrete Structures for Computing (CO1007)_Trần Tuấn Anh (CLC_HK251)",
    tags: "[CC01]",
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
        title: "Slides",
        items: [
          { id: "r1", title: "Syllabus", type: "pdf" },
          { id: "r2", title: "ds11 tree", type: "pdf" },
          { id: "r3", title: "ds10connectivity", type: "pdf" },
          { id: "r4", title: "ds9graphintro", type: "pdf" },
        ],
      },
    ],
  };

  // Build course object from classItem if available (from TutorHomePage)
  let courseFromClassItem = null;
  if (classItem) {
    const programCode = classItem.programs?.program_code || '';
    const programName = classItem.programs?.name || '';
    const classCode = classItem.class_code || '';

    courseFromClassItem = {
      id: classItem.id,
      title: `${programCode} - ${programName} (${classCode})`,
      tags: `[${classCode}]`,
      sections: defaultCourse.sections, // Use default sections for now
    };
  }

  // Build course object from program if available (from StudentHomePage)
  let courseFromProgram = null;
  if (program) {
    const programCode = program.program_code || '';
    const programName = program.program_name || '';
    const classCode = program.class_code || '';

    courseFromProgram = {
      id: program.class_id,
      title: `${programCode} - ${programName} (${classCode})`,
      tags: `[${classCode}]`,
      sections: defaultCourse.sections, // Use default sections for now
    };
  }

  const course = {
    ...defaultCourse,
    ...(courseFromProgram || courseFromClassItem || routeCourse || {}),
    // ensure sections is always an array
    sections: Array.isArray(routeCourse?.sections)
      ? routeCourse.sections
      : courseFromProgram?.sections || courseFromClassItem?.sections || defaultCourse.sections,
    // prefer nicer title if passed
    title: courseFromProgram?.title || courseFromClassItem?.title || routeCourse?.title || routeCourse?.name || (routeCourse?.code ? `${routeCourse.code} - ${routeCourse.name || ''}` : defaultCourse.title),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
            {course.title}
          </h1>
          {course.tags && (
            <span className="inline-block text-base text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
              {course.tags}
            </span>
          )}
        </div>

        <div className="mb-8 flex gap-3">
          <button
            onClick={() => setActiveTab('course')}
            className={`px-6 py-3 rounded-lg font-medium text-base transition-colors shadow-sm ${activeTab === 'course'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            Course
          </button>
          <button
            onClick={() => setActiveTab('record')}
            className={`px-6 py-3 rounded-lg font-medium text-base transition-colors shadow-sm ${activeTab === 'record'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            Record
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-6 py-3 rounded-lg font-medium text-base transition-colors shadow-sm ${activeTab === 'community'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            Community
          </button>
          {/* Hide Feedback tab for tutors */}
          {user?.role !== 'tutor' && (
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-6 py-3 rounded-lg font-medium text-base transition-colors shadow-sm ${activeTab === 'feedback'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              Feedback
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'community' ? (
          <CommunityForum courseTitle={course.title} />
        ) : activeTab === 'record' ? (
          <CourseRecord courseTitle={course.title} classId={course.id} />
        ) : activeTab === 'feedback' ? (
          <CourseFeedback courseTitle={course.title} />
        ) : (
          <>
            {/* Learning Resources Section */}
            <section className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mb-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Your Learning Resources</h2>
                  {addedResources.length > 0 && (
                    <p className="text-sm text-gray-600">
                      {addedResources.length} resource{addedResources.length !== 1 ? 's' : ''} added to this course
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsResourcesModalOpen(true)}
                className="w-full mb-4 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-base hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
              >
                <span>📚</span>
                <span>Add Materials</span>
                <span>→</span>
              </button>

              {/* Display Added Resources */}
              {addedResources.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {addedResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
                        {resource.type === 'pdf' ? '📄' : resource.type === 'video' ? '🎥' : '🔗'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                          {resource.title}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{resource.description}</div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                            {resource.category}
                          </span>
                          <span>{resource.size}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => window.open(resource.url, '_blank')}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = resource.url;
                            link.download = resource.title;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="px-3 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => {
                            setAddedResources(addedResources.filter(r => r.id !== resource.id));
                          }}
                          className="px-3 py-2 bg-red-50 text-red-600 border border-red-300 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors"
                          title="Remove from course"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="text-4xl mb-3">📚</div>
                  <p className="text-base text-gray-600 font-medium">No resources added yet</p>
                  <p className="text-sm text-gray-500 mt-1">Click "Add Materials" to add learning resources to this course</p>
                </div>
              )}
            </section>

            {/* Sections */}
            <div className="space-y-6">
              {course.sections.map((sec) => (
                <section key={sec.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-gray-900">{sec.title}</h2>
                    <button className="text-base text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      Collapse all
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sec.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer group"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
                          {it.type === 'pdf' ? 'PDF' : '🔗'}
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {it.title}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Learning Resources Modal */}
      <LearningResourcesModal
        isOpen={isResourcesModalOpen}
        onClose={() => setIsResourcesModalOpen(false)}
        onAddResource={(resource) => {
          // Check if resource is already added
          if (!addedResources.find(r => r.id === resource.id)) {
            setAddedResources([...addedResources, resource]);
          }
        }}
        addedResourceIds={addedResources.map(r => r.id)}
      />
    </div>
  );
}
