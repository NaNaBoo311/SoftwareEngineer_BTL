import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

import CommunityForum from "../components/CommunityForum";
import CourseRecord from "../components/CourseRecord";
import CourseFeedback from "../components/CourseFeedback";

import ScheduleEditor from "../components/ScheduleEditor";
import CourseMaterials from "../components/CourseMaterials";

export default function CoursePage() {
  const { user } = useUser();
  const { id } = useParams();
  /* Removed unused modal state */
  const [activeTab, setActiveTab] = useState('course'); // 'course', 'record', 'community', 'feedback', or 'schedule'

  // Use route state course if provided (HomePage passes it), otherwise mock
  const location = useLocation();
  const routeCourse = location?.state?.course;
  const classItem = location?.state?.classItem; // From TutorHomePage
  const program = location?.state?.program; // From StudentHomePage

  const defaultCourse = {
    id,
    title: "Discrete Structures for Computing (CO1007)_Trần Tuấn Anh (CLC_HK251)",
    tags: "[CC01]",
    sections: [],
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
      sections: [], // No hardcoded sections
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
      sections: [], // No hardcoded sections
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


          {/* Show Schedule tab only for tutors */}
          {user?.role === 'tutor' && (
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-3 rounded-lg font-medium text-base transition-colors shadow-sm ${activeTab === 'schedule'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              Manage Session
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
        ) : activeTab === 'schedule' ? (
          <ScheduleEditor classId={course.id} tutorId={user?.details?.id} />
        ) : (
          <>
            {/* Learning Resources (Now Course Materials) Section */}
            <div className="mb-6">
              <CourseMaterials courseId={course.id} isTutor={user?.role === 'tutor'} />
            </div>


          </>
        )
        }
      </main >


    </div >
  );
}
