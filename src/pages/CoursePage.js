import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { classService } from "../services/classService";

import CommunityForum from "../components/CommunityForum";
import CourseRecord from "../components/CourseRecord";
import CourseFeedback from "../components/CourseFeedback";
import ScheduleEditor from "../components/ScheduleEditor";
import CourseMaterials from "../components/CourseMaterials";

export default function CoursePage() {
  const { user } = useUser();
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('course');
  
  // State for course data
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from location state if available (prevents extra fetch)
  useEffect(() => {
    const initializeCourse = async () => {
      // 1. Check if we have comprehensive data from state
      const routeCourse = location?.state?.course;
      const classItem = location?.state?.classItem;
      const program = location?.state?.program;

      if (classItem || program || routeCourse) {
        // Construct course object from state
        let course = {};
        
        if (classItem) {
           course = {
            id: classItem.id,
            title: `${classItem.programs?.program_code || ''} - ${classItem.programs?.name || ''} (${classItem.class_code || ''})`,
            tags: `[${classItem.class_code || ''}]`,
          };
        } else if (program) {
          course = {
            id: program.class_id,
            title: `${program.program_code || ''} - ${program.program_name || ''} (${program.class_code || ''})`,
            tags: `[${program.class_code || ''}]`,
          };
        } else if (routeCourse) {
          course = {
             ...routeCourse,
             title: routeCourse.title || routeCourse.name,
             sections: routeCourse.sections || []
          };
        }
        
        setCourseData(course);
        setLoading(false);
        return;
      }

      // 2. Fallback: Fetch from API if no state (e.g. direct link or reload)
      try {
        setLoading(true);
        // We need to fetch class details. Assuming classService has a getById or similar.
        // If classService.getClassById returns everything we need:
        const data = await classService.getClassById(id);
        
        if (data) {
          // Map DB response to UI format
          const mappedCourse = {
            id: data.id,
            title: `${data.programs?.program_code || ''} - ${data.programs?.name || ''} (${data.class_code || ''})`,
            tags: `[${data.class_code || ''}]`,
            sections: [] // Material component handles content
          };
          setCourseData(mappedCourse);
        } else {
             // Handle 404
             setCourseData(null); 
        }
      } catch (err) {
        console.error("Failed to fetch course details:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeCourse();
  }, [id, location.state]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading course...</div>;
  }

  if (!courseData) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Course not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
            {courseData.title}
          </h1>
          {courseData.tags && (
            <span className="inline-block text-base text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
              {courseData.tags}
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
          <CommunityForum courseTitle={courseData.title} classId={courseData.id} />
        ) : activeTab === 'record' ? (
          <CourseRecord courseTitle={courseData.title} classId={courseData.id} />
        ) : activeTab === 'feedback' ? (
          <CourseFeedback courseTitle={courseData.title} />
        ) : activeTab === 'schedule' ? (
          <ScheduleEditor classId={courseData.id} tutorId={user?.details?.id} />
        ) : (
          <>
            {/* Learning Resources (Now Course Materials) Section */}
            <div className="mb-6">
              <CourseMaterials courseId={courseData.id} isTutor={user?.role === 'tutor'} />
            </div>
          </>
        )
        }
      </main >
    </div >
  );
}
