import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { classService } from '../services/classService';
import { Loader2, Users, ArrowLeft, GraduationCap } from 'lucide-react';

const CourseRecord = ({ courseTitle, classId }) => {
  const { user } = useUser();
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch students if user is a tutor
  useEffect(() => {
    const fetchStudents = async () => {
      if (user?.role !== 'tutor' || !classId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const studentsData = await classService.getStudentsInClass(classId);
        setStudents(studentsData);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, classId]);

  // Handle student selection
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setView('detail');
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedStudent(null);
    setView('list');
  };

  // If user is a student, show their own record directly
  if (user?.role === 'student') {
    // Prepare student data from user context
    const studentData = {
      fullName: user?.full_name || user?.details?.full_name || 'Student',
      studentCode: user?.details?.student_code || 'N/A',
      email: user?.email || 'N/A',
      studentId: user?.details?.id,
    };

    return <StudentRecordView studentData={studentData} courseTitle={courseTitle} />;
  }

  // If user is a tutor and viewing the list
  if (user?.role === 'tutor' && view === 'list') {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-600 mr-3" />
          <span className="text-indigo-600 font-medium">Loading students...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">Error loading students</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Student Records</h2>
          </div>
          <p className="text-blue-100">
            {students.length} student{students.length !== 1 ? 's' : ''} enrolled in this class
          </p>
        </div>

        {/* Student List */}
        {students.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No students enrolled yet</p>
            <p className="text-gray-400 text-sm mt-2">Students will appear here once they enroll in this class</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Student Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Full Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Major</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Enrolled Date</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr
                      key={student.enrollmentId}
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => handleStudentClick(student)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {student.studentCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.major}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudentClick(student);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          View Record
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If user is a tutor and viewing a specific student's record
  if (user?.role === 'tutor' && view === 'detail' && selectedStudent) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Student List
        </button>

        {/* Student Record */}
        <StudentRecordView
          studentData={selectedStudent}
          courseTitle={courseTitle}
          isTutorView={true}
        />
      </div>
    );
  }

  return null;
};

// Component to display individual student record
const StudentRecordView = ({ studentData, courseTitle, isTutorView = false }) => {
  // Mock data - in a real app, this would come from an API based on studentData
  const [recordData] = useState({
    studentName: studentData?.fullName || 'Nguyễn Văn A',
    studentCode: studentData?.studentCode || 'SV001',
    overallGrade: 8.5,
    attendance: 92,
    assignments: [
      {
        id: 1,
        title: 'Assignment 1: Graph Theory',
        score: 9.0,
        maxScore: 10,
        weight: 15,
        dueDate: '2024-01-15',
        submittedDate: '2024-01-14',
        status: 'graded'
      },
      {
        id: 2,
        title: 'Assignment 2: Tree Structures',
        score: 8.5,
        maxScore: 10,
        weight: 15,
        dueDate: '2024-02-01',
        submittedDate: '2024-01-31',
        status: 'graded'
      },
      {
        id: 3,
        title: 'Assignment 3: Algorithms',
        score: null,
        maxScore: 10,
        weight: 20,
        dueDate: '2024-02-20',
        submittedDate: '2024-02-18',
        status: 'pending'
      }
    ],
    quizzes: [
      {
        id: 1,
        title: 'Quiz 1: Set Theory',
        score: 85,
        maxScore: 100,
        weight: 10,
        date: '2024-01-10',
        status: 'completed'
      },
      {
        id: 2,
        title: 'Quiz 2: Logic',
        score: 92,
        maxScore: 100,
        weight: 10,
        date: '2024-01-24',
        status: 'completed'
      },
      {
        id: 3,
        title: 'Quiz 3: Combinatorics',
        score: null,
        maxScore: 100,
        weight: 10,
        date: '2024-02-10',
        status: 'upcoming'
      }
    ],
    midterm: {
      score: 88,
      maxScore: 100,
      weight: 20,
      date: '2024-01-30',
      status: 'completed'
    },
    finalExam: {
      score: null,
      maxScore: 100,
      weight: 30,
      date: '2024-03-15',
      status: 'upcoming'
    }
  });

  const getGradeColor = (score, maxScore) => {
    if (score === null) return 'text-gray-500';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadge = (score, maxScore) => {
    if (score === null) return 'bg-gray-100 text-gray-600';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'bg-green-100 text-green-700';
    if (percentage >= 80) return 'bg-blue-100 text-blue-700';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const calculateProgress = () => {
    const totalWeight = 100;
    let completedWeight = 0;
    let earnedScore = 0;

    // Assignments
    recordData.assignments.forEach(assignment => {
      if (assignment.score !== null) {
        completedWeight += assignment.weight;
        earnedScore += (assignment.score / assignment.maxScore) * 100 * (assignment.weight / 100);
      }
    });

    // Quizzes
    recordData.quizzes.forEach(quiz => {
      if (quiz.score !== null) {
        completedWeight += quiz.weight;
        earnedScore += (quiz.score / quiz.maxScore) * 100 * (quiz.weight / 100);
      }
    });

    // Midterm
    if (recordData.midterm.score !== null) {
      completedWeight += recordData.midterm.weight;
      earnedScore += (recordData.midterm.score / recordData.midterm.maxScore) * 100 * (recordData.midterm.weight / 100);
    }

    const progressPercentage = (completedWeight / totalWeight) * 100;
    const currentGrade = completedWeight > 0 ? earnedScore / (completedWeight / 100) : 0;

    return {
      progressPercentage: Math.round(progressPercentage),
      currentGrade: currentGrade.toFixed(1),
      completedWeight: Math.round(completedWeight)
    };
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Student Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{recordData.studentName}</h2>
            <p className="text-blue-100 mb-3">Student Code: {recordData.studentCode}</p>
            {isTutorView && studentData && (
              <p className="text-blue-100 text-sm">Email: {studentData.email}</p>
            )}
            <div className="flex items-center gap-6 mt-3">
              <div>
                <div className="text-sm text-blue-100 mb-1">Overall Grade</div>
                <div className="text-3xl font-bold">{recordData.overallGrade.toFixed(1)} / 10</div>
              </div>
              <div>
                <div className="text-sm text-blue-100 mb-1">Attendance</div>
                <div className="text-3xl font-bold">{recordData.attendance}%</div>
              </div>
              <div>
                <div className="text-sm text-blue-100 mb-1">Course Progress</div>
                <div className="text-3xl font-bold">{progress.progressPercentage}%</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">Current Grade (Based on completed work)</div>
            <div className="text-4xl font-bold">{progress.currentGrade} / 10</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Progress Overview</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Course Completion</span>
              <span>{progress.completedWeight}% of total weight completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Attendance</span>
              <span>{recordData.attendance}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${recordData.attendance >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                style={{ width: `${recordData.attendance}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grade Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Grade Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Assignments</div>
            <div className="text-2xl font-bold text-gray-900">
              {recordData.assignments.filter(a => a.score !== null).length} / {recordData.assignments.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Weight: 50%</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Quizzes</div>
            <div className="text-2xl font-bold text-gray-900">
              {recordData.quizzes.filter(q => q.score !== null).length} / {recordData.quizzes.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Weight: 30%</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Midterm</div>
            <div className="text-2xl font-bold text-gray-900">
              {recordData.midterm.score !== null ? '✓' : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Weight: 20%</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Final Exam</div>
            <div className="text-2xl font-bold text-gray-900">
              {recordData.finalExam.score !== null ? '✓' : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Weight: 30%</div>
          </div>
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Assignments</h3>
          <span className="text-sm text-gray-600">Total Weight: 50%</span>
        </div>
        <div className="space-y-3">
          {recordData.assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-base font-semibold text-gray-900">{assignment.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getGradeBadge(assignment.score, assignment.maxScore)}`}>
                      {assignment.status === 'graded' ? 'Graded' : assignment.status === 'pending' ? 'Pending' : 'Not Submitted'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    {assignment.submittedDate && (
                      <span>Submitted: {new Date(assignment.submittedDate).toLocaleDateString()}</span>
                    )}
                    <span>Weight: {assignment.weight}%</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  {assignment.score !== null ? (
                    <>
                      <div className={`text-2xl font-bold ${getGradeColor(assignment.score, assignment.maxScore)}`}>
                        {assignment.score.toFixed(1)} / {assignment.maxScore}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {((assignment.score / assignment.maxScore) * 100).toFixed(1)}%
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-base">Pending</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quizzes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Quizzes</h3>
          <span className="text-sm text-gray-600">Total Weight: 30%</span>
        </div>
        <div className="space-y-3">
          {recordData.quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-base font-semibold text-gray-900">{quiz.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${quiz.status === 'completed' ? 'bg-green-100 text-green-700' :
                      quiz.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {quiz.status === 'completed' ? 'Completed' : quiz.status === 'upcoming' ? 'Upcoming' : 'In Progress'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Date: {new Date(quiz.date).toLocaleDateString()}</span>
                    <span>Weight: {quiz.weight}%</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  {quiz.score !== null ? (
                    <>
                      <div className={`text-2xl font-bold ${getGradeColor(quiz.score, quiz.maxScore)}`}>
                        {quiz.score} / {quiz.maxScore}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {((quiz.score / quiz.maxScore) * 100).toFixed(1)}%
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 text-base">
                      {quiz.status === 'upcoming' ? 'Upcoming' : 'Pending'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exams */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Exams</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Midterm */}
          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">Midterm Exam</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded ${recordData.midterm.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                {recordData.midterm.status === 'completed' ? 'Completed' : 'Upcoming'}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-3">
              <div>Date: {new Date(recordData.midterm.date).toLocaleDateString()}</div>
              <div>Weight: {recordData.midterm.weight}%</div>
            </div>
            {recordData.midterm.score !== null ? (
              <div className="mt-4">
                <div className={`text-3xl font-bold ${getGradeColor(recordData.midterm.score, recordData.midterm.maxScore)}`}>
                  {recordData.midterm.score} / {recordData.midterm.maxScore}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {((recordData.midterm.score / recordData.midterm.maxScore) * 100).toFixed(1)}%
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-base mt-4">Upcoming</div>
            )}
          </div>

          {/* Final Exam */}
          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">Final Exam</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded ${recordData.finalExam.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                {recordData.finalExam.status === 'completed' ? 'Completed' : 'Upcoming'}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-3">
              <div>Date: {new Date(recordData.finalExam.date).toLocaleDateString()}</div>
              <div>Weight: {recordData.finalExam.weight}%</div>
            </div>
            {recordData.finalExam.score !== null ? (
              <div className="mt-4">
                <div className={`text-3xl font-bold ${getGradeColor(recordData.finalExam.score, recordData.finalExam.maxScore)}`}>
                  {recordData.finalExam.score} / {recordData.finalExam.maxScore}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {((recordData.finalExam.score / recordData.finalExam.maxScore) * 100).toFixed(1)}%
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-base mt-4">Upcoming</div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Grade Scale</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-gray-600">Excellent (90-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-gray-600">Good (80-89%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-gray-600">Average (70-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-gray-600">Needs Improvement (&lt;70%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseRecord;
