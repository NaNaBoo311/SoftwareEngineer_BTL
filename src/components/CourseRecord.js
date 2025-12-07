import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { classService } from '../services/classService';
import { recordService } from '../services/recordService';
import { Loader2, Users, ArrowLeft, GraduationCap, Edit, Save, X } from 'lucide-react';

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
    // We need the studentId (uuid from public.students) to fetch grades.
    // The context might only have user.id (auth).
    // Luckily recordService.getStudentGrades needs studentId.
    // We might need to fetch studentId first?
    // Actually, classService.getStudentsInClass returns studentId.
    // But for a logged in student, we might not have it handy in 'user' object if not populated.
    // We can fetch it or pass it. 
    // Ideally user.details.id is the student_id if we have it?
    // Let's assume user.details.id is correct (from StudentRoute wrapper usually).

    const studentData = {
      fullName: user?.full_name || user?.details?.full_name || 'Student',
      studentCode: user?.details?.student_code || 'N/A',
      email: user?.email || 'N/A',
      studentId: user?.details?.id,
    };

    return <StudentRecordView studentData={studentData} courseTitle={courseTitle} classId={classId} />;
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
          classId={classId}
          isTutorView={true}
        />
      </div>
    );
  }

  return null;
};

// Component to display individual student record
const StudentRecordView = ({ studentData, courseTitle, classId, isTutorView = false }) => {
  const [assessments, setAssessments] = useState([]);
  const [grades, setGrades] = useState({}); // Map assessmentId -> grade object
  const [attendanceWeeks, setAttendanceWeeks] = useState([]); // Array of attended weeks
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({}); // Local state for edits
  const [editAttendanceWeeks, setEditAttendanceWeeks] = useState([]);
  const [weekRange, setWeekRange] = useState({ start: 1, end: 15 }); // Default range

  useEffect(() => {
    fetchData();
  }, [classId, studentData.studentId]);

  const fetchData = async () => {
    if (!classId || !studentData.studentId) return;
    try {
      setLoading(true);
      const [asses, grds, attWeeks, classDetails] = await Promise.all([
        recordService.getAssessments(classId),
        recordService.getStudentGrades(studentData.studentId, classId),
        recordService.getAttendance(studentData.studentId, classId),
        classService.getClassById(classId)
      ]);

      setAssessments(asses);

      // Map grades for easier access
      const gMap = {};
      grds.forEach(g => {
        gMap[g.assessment_id] = g;
      });
      setGrades(gMap);

      setAttendanceWeeks(attWeeks);
      setEditAttendanceWeeks(attWeeks);

      if (classDetails?.program) {
        setWeekRange({
          start: classDetails.program.start_week,
          end: classDetails.program.end_week
        });
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      setLoading(true);
      await recordService.initializeDefaultAssessments(classId);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to initialize");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Save attendance (always save array)
      if (JSON.stringify(editAttendanceWeeks) !== JSON.stringify(attendanceWeeks)) {
        await recordService.saveAttendance(studentData.studentId, classId, editAttendanceWeeks);
      }

      // Save changed grades
      const promises = Object.keys(editValues).map(async (assessmentId) => {
        const val = editValues[assessmentId];
        if (val === undefined || val === '') return; // Skip empty?
        await recordService.saveGrade(studentData.studentId, assessmentId, parseFloat(val));
      });

      await Promise.all(promises);

      setIsEditing(false);
      fetchData(); // Refresh
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
      setLoading(false);
    }
  };

  // Group assessments
  const assignments = assessments.filter(a => a.type === 'assignment');
  const quizzes = assessments.filter(a => a.type === 'quiz');
  const midterm = assessments.find(a => a.type === 'midterm');
  const finalExam = assessments.find(a => a.type === 'final');

  const getScore = (id) => {
    if (isEditing && editValues[id] !== undefined) return editValues[id];
    return grades[id]?.score ?? '';
  };

  const handleScoreChange = (id, val) => {
    setEditValues(prev => ({ ...prev, [id]: val }));
  };

  const toggleWeek = (week) => {
    if (!isEditing) return;
    setEditAttendanceWeeks(prev => {
      if (prev.includes(week)) {
        return prev.filter(w => w !== week);
      } else {
        return [...prev, week].sort((a, b) => a - b);
      }
    });
  };

  const getAttendancePercentage = (weeks) => {
    const totalWeeks = weekRange.end - weekRange.start + 1;
    if (totalWeeks <= 0) return 0;
    const count = weeks.filter(w => w >= weekRange.start && w <= weekRange.end).length;
    return Math.round((count / totalWeeks) * 100);
  };

  const getCurrentPercentage = () => {
    return isEditing ? getAttendancePercentage(editAttendanceWeeks) : getAttendancePercentage(attendanceWeeks);
  }

  const getGradeColor = (score, maxScore) => {
    if (score == null || score === '') return 'text-gray-500';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateProgress = () => {
    let totalWeight = 0;
    let completedWeight = 0;
    let weightedSum = 0;

    assessments.forEach(a => {
      totalWeight += a.weight;
      const g = grades[a.id];
      if (g && g.score != null) {
        completedWeight += a.weight;
        weightedSum += (g.score / a.max_score) * 100 * (a.weight / 100);
      }
    });

    const progressPercentage = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
    const currentGrade = completedWeight > 0 ? (weightedSum / (completedWeight / 100)) / 10 : 0;

    return {
      progressPercentage: Math.round(progressPercentage),
      currentGrade: currentGrade.toFixed(1),
      completedWeight: Math.round(completedWeight)
    };
  };

  const progress = calculateProgress();
  const currentAttendancePct = getCurrentPercentage();

  // Generate weeks array
  const weeks = [];
  for (let i = weekRange.start; i <= weekRange.end; i++) {
    weeks.push(i);
  }

  if (loading) return <div className="text-center py-8">Loading record...</div>;

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
        <p className="text-gray-500 mb-4">No grading structure defined for this course.</p>
        {isTutorView && (
          <button
            onClick={handleInitializeDefaults}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Initialize Default Grading Structure
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg relative">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{studentData.fullName}</h2>
            <p className="text-blue-100 mb-3">Student Code: {studentData.studentCode}</p>
            {isTutorView && studentData && (
              <p className="text-blue-100 text-sm">Email: {studentData.email}</p>
            )}
            <div className="flex items-center gap-6 mt-3">
              <div>
                <div className="text-sm text-blue-100 mb-1">Current Grade</div>
                <div className="text-3xl font-bold">{progress.currentGrade} / 10</div>
              </div>
              <div>
                <div className="text-sm text-blue-100 mb-1">Attendance</div>
                <div className="text-3xl font-bold">
                  {currentAttendancePct}%
                </div>
              </div>
              <div>
                <div className="text-sm text-blue-100 mb-1">Course Progress</div>
                <div className="text-3xl font-bold">{progress.progressPercentage}%</div>
              </div>
            </div>
          </div>

          {isTutorView && (
            <div className="absolute top-6 right-6">
              {!isEditing ? (
                <button
                  onClick={() => {
                    setEditValues({}); // Clear edits
                    setEditAttendanceWeeks(attendanceWeeks);
                    setIsEditing(true);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                >
                  <Edit className="w-4 h-4" /> Edit Record
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white/20 hover:bg-red-500/50 text-white px-3 py-2 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Attendance ({weekRange.start} - {weekRange.end})</h3>
        <div className="grid grid-cols-10 gap-2">
          {weeks.map(week => {
            const isAttended = isEditing ? editAttendanceWeeks.includes(week) : attendanceWeeks.includes(week);
            return (
              <div
                key={week}
                onClick={() => toggleWeek(week)}
                className={`
                     h-10 flex items-center justify-center rounded-lg font-medium text-sm border cursor-pointer transition-all
                     ${isAttended
                    ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }
                     ${isEditing ? 'ring-2 ring-transparent hover:ring-blue-300' : 'cursor-default'}
                   `}
                title={`Week ${week}`}
              >
                W{week}
              </div>
            );
          })}
        </div>
      </div>

      {/* Assignments */}
      {assignments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Assignments</h3>
          </div>
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const score = grades[assignment.id]?.score;
              return (
                <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900">{assignment.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'N/A'}</span>
                        <span>Weight: {assignment.weight}%</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="w-20 border rounded px-2 py-1 text-right"
                            value={getScore(assignment.id)}
                            placeholder={score ?? '-'}
                            onChange={(e) => handleScoreChange(assignment.id, e.target.value)}
                          />
                          <span className="text-gray-500">/ {assignment.max_score}</span>
                        </div>
                      ) : (
                        score !== undefined ? (
                          <>
                            <div className={`text-2xl font-bold ${getGradeColor(score, assignment.max_score)}`}>
                              {score} / {assignment.max_score}
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-400 text-base">Pending</div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quizzes</h3>
          <div className="space-y-3">
            {quizzes.map((quiz) => {
              const score = grades[quiz.id]?.score;
              return (
                <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900">{quiz.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Weight: {quiz.weight}%</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="w-20 border rounded px-2 py-1 text-right"
                            value={getScore(quiz.id)}
                            placeholder={score ?? '-'}
                            onChange={(e) => handleScoreChange(quiz.id, e.target.value)}
                          />
                          <span className="text-gray-500">/ {quiz.max_score}</span>
                        </div>
                      ) : (
                        score !== undefined ? (
                          <div className={`text-2xl font-bold ${getGradeColor(score, quiz.max_score)}`}>
                            {score} / {quiz.max_score}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-base">Pending</div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exams */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Exams</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Midterm */}
          {midterm && (
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">{midterm.title}</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <div>Weight: {midterm.weight}%</div>
              </div>
              <div className="mt-4">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-right"
                      value={getScore(midterm.id)}
                      placeholder={grades[midterm.id]?.score ?? '-'}
                      onChange={(e) => handleScoreChange(midterm.id, e.target.value)}
                    />
                    <span className="text-gray-500">/ {midterm.max_score}</span>
                  </div>
                ) : (
                  grades[midterm.id]?.score !== undefined ? (
                    <div className={`text-3xl font-bold ${getGradeColor(grades[midterm.id].score, midterm.max_score)}`}>
                      {grades[midterm.id].score} / {midterm.max_score}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-base">Upcoming</div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Final Exam */}
          {finalExam && (
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">{finalExam.title}</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <div>Weight: {finalExam.weight}%</div>
              </div>
              <div className="mt-4">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-right"
                      value={getScore(finalExam.id)}
                      placeholder={grades[finalExam.id]?.score ?? '-'}
                      onChange={(e) => handleScoreChange(finalExam.id, e.target.value)}
                    />
                    <span className="text-gray-500">/ {finalExam.max_score}</span>
                  </div>
                ) : (
                  grades[finalExam.id]?.score !== undefined ? (
                    <div className={`text-3xl font-bold ${getGradeColor(grades[finalExam.id].score, finalExam.max_score)}`}>
                      {grades[finalExam.id].score} / {finalExam.max_score}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-base">Upcoming</div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseRecord;
