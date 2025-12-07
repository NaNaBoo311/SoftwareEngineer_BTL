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
  const [classDetails, setClassDetails] = useState(null);

  // Bulk Attendance State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkWeek, setBulkWeek] = useState(null);
  const [bulkSession, setBulkSession] = useState(null);
  const [bulkAttendanceMap, setBulkAttendanceMap] = useState({}); // studentId -> boolean

  // Helper to get sessions for a week
  const getSessionsForWeek = (week) => {
    if (!classDetails?.schedules) return [];
    return classDetails.schedules
      .filter(s => s.weeks.includes(week) || s.weeks.includes(String(week)))
      .map(s => ({
        day: s.day,
        period: s.period,
        label: `${getDayName(s.day)} - Period ${s.period}`,
        key: `${week}-${s.day}-${s.period}`
      }))
      .sort((a, b) => a.day - b.day || a.period - b.period);
  };

  const getDayName = (day) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[day] || `Day ${day}`;
  };

  const openBulkModal = () => {
    if (students.length > 0) {
      // Default to first scheduled week and first session
      const firstStudent = students[0];
      const firstWeek = firstStudent.scheduledWeeks?.[0] || 35;
      setBulkWeek(firstWeek);

      // Wait for sessions to calculate? No, calculate directly
      // Need to set session after we know week. 
      // Effect will handle it or we set here.
      // Let's rely on render logic or set it here safely.
      setShowBulkModal(true);
    }
  };

  // Prepare Bulk Data when session changes
  useEffect(() => {
    if (showBulkModal && bulkWeek) {
      const sessions = getSessionsForWeek(bulkWeek);
      if (sessions.length > 0 && !bulkSession) {
        setBulkSession(sessions[0]);
      }
    }
  }, [showBulkModal, bulkWeek]);

  useEffect(() => {
    if (showBulkModal && bulkSession) {
      const map = {};
      students.forEach(s => {
        map[s.studentId] = s.attendedSlots.includes(bulkSession.key);
      });
      setBulkAttendanceMap(map);
    }
  }, [bulkSession]);

  // Fetch students function
  const fetchStudents = async () => {
    if (user?.role !== 'tutor' || !classId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [studentsData, gradesData, attendanceData, classData] = await Promise.all([
        classService.getStudentsInClass(classId),
        recordService.getClassGrades(classId),
        recordService.getClassAttendance(classId),
        classService.getClassById(classId)
      ]);

      setClassDetails(classData);

      // Extract scheduled weeks
      let scheduledWeeks = [];
      if (classData?.schedules && classData.schedules.length > 0) {
        scheduledWeeks = [...new Set(classData.schedules.map(s => parseInt(s.weeks, 10)))].sort((a, b) => a - b);
      } else if (classData?.program) {
        for (let i = classData.program.start_week; i <= classData.program.end_week; i++) {
          scheduledWeeks.push(i);
        }
      } else {
        scheduledWeeks = [35, 36, 37, 38, 39, 40];
      }

      // Process Grades and Attendance
      const enrichedStudents = studentsData.map(student => {
        // Attendance
        const attendanceRecord = attendanceData.find(a => a.student_id === student.studentId);
        const attendedWeeks = attendanceRecord?.attended_weeks || [];
        const attendedSlots = attendanceRecord?.attended_slots || [];

        const studentGrades = gradesData.filter(g => g.student_id === student.studentId);
        let completedWeight = 0;
        let weightedSum = 0;

        studentGrades.forEach(g => {
          const weight = g.course_assessments.weight;
          const maxScore = g.course_assessments.max_score;
          if (g.score != null) {
            completedWeight += weight;
            weightedSum += (g.score / maxScore) * 100 * (weight / 100);
          }
        });

        const currentGrade = completedWeight > 0 ? (weightedSum / (completedWeight / 100)) / 10 : 0;

        return {
          ...student,
          attendedWeeks,
          attendedSlots,
          scheduledWeeks,
          progressPercentage: Math.round(completedWeight),
          currentGrade: currentGrade.toFixed(1)
        };
      });

      setStudents(enrichedStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user, classId]);

  const handleBulkSave = async () => {
    if (!bulkSession) return;
    setLoading(true);
    try {
      const updates = students.map(student => {
        const isAttended = bulkAttendanceMap[student.studentId];
        const currentSlots = new Set(student.attendedSlots || []);

        if (isAttended) {
          currentSlots.add(bulkSession.key);
        } else {
          currentSlots.delete(bulkSession.key);
        }

        const newSlots = Array.from(currentSlots);

        // Recalculate weeks
        // For each scheduled week, check if all sessions present
        const newAttendedWeeks = [];
        const scheduledWeeks = student.scheduledWeeks || [];

        scheduledWeeks.forEach(week => {
          const sessions = getSessionsForWeek(week);
          // If all sessions for this week are in newSlots, then week is attended
          const allPresent = sessions.every(sess => newSlots.includes(sess.key));

          // IF there are no sessions (shouldn't happen if scheduled), assume true? No.
          if (sessions.length > 0 && allPresent) {
            newAttendedWeeks.push(week);
          }
        });

        return {
          student_id: student.studentId,
          class_id: classId,
          attended_weeks: newAttendedWeeks,
          attended_slots: newSlots
        };
      });

      await recordService.saveBulkAttendance(updates);
      setShowBulkModal(false);
      await fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance: " + err.message);
    } finally {
      setLoading(false);
    }
  };


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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Student Records</h2>
            </div>
            <p className="text-blue-100">
              {students.length} student{students.length !== 1 ? 's' : ''} enrolled in this class
            </p>
          </div>
          <button
            onClick={openBulkModal}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Manage Attendance
          </button>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Attendance</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Course Progress</th>
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
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {student.scheduledWeeks && student.scheduledWeeks.length > 0 ? (
                            student.scheduledWeeks.map(week => {
                              const isAttended = student.attendedWeeks?.includes(week);
                              return (
                                <span
                                  key={week}
                                  className={`text-xs px-1.5 py-0.5 rounded ${isAttended
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-gray-100 text-gray-400 border border-gray-200"
                                    }`}
                                  title={isAttended ? `Attended Week ${week}` : `Absent Week ${week}`}
                                >
                                  {week}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-gray-400 italic">No classes scheduled</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{student.currentGrade} / 10</span>
                          <span className="text-xs text-gray-500">{student.progressPercentage}% completed</span>
                        </div>
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

        {/* Bulk Attendance Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Manage Attendance</h3>
                <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="flex gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
                    <select
                      value={bulkWeek || ''}
                      onChange={(e) => setBulkWeek(parseInt(e.target.value))}
                      className="border rounded-lg px-3 py-2 w-32"
                    >
                      {students[0]?.scheduledWeeks?.map(w => (
                        <option key={w} value={w}>Week {w}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                    <select
                      value={bulkSession?.key || ''}
                      onChange={(e) => {
                        const sess = getSessionsForWeek(bulkWeek).find(s => s.key === e.target.value);
                        setBulkSession(sess);
                      }}
                      className="border rounded-lg px-3 py-2 w-full"
                    >
                      {getSessionsForWeek(bulkWeek).map(s => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {bulkSession ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">Students</span>
                      <div className="space-x-2 text-sm">
                        <button
                          onClick={() => {
                            const map = {};
                            students.forEach(s => map[s.studentId] = true);
                            setBulkAttendanceMap(map);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => setBulkAttendanceMap({})}
                          className="text-gray-500 hover:underline"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    {students.map(student => (
                      <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setBulkAttendanceMap(prev => ({ ...prev, [student.studentId]: !prev[student.studentId] }))}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${bulkAttendanceMap[student.studentId] ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                            {bulkAttendanceMap[student.studentId] && <span className="text-white text-xs">✓</span>}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{student.fullName}</div>
                            <div className="text-xs text-gray-500">{student.studentCode}</div>
                          </div>
                        </div>
                        {student.attendedSlots.includes(bulkSession.key) && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Recorded</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">No sessions available for this week</div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSave}
                  disabled={!bulkSession}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Attendance
                </button>
              </div>
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
  const [activeWeeks, setActiveWeeks] = useState([]); // Array of weeks to display
  const [classDetails, setClassDetails] = useState(null);

  useEffect(() => {
    fetchData();
  }, [classId, studentData.studentId]);

  const fetchData = async () => {
    if (!classId || !studentData.studentId) return;
    try {
      setLoading(true);
      const [asses, grds, attData, classDetails] = await Promise.all([
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

      setAttendanceWeeks(attData.attendedWeeks);
      setEditAttendanceWeeks(attData.attendedWeeks);
      setClassDetails(classDetails);
      // We can add state for slots if needed, but for now detail view mainly uses weeks.
      // If we want detail view to be robust, we should store slots too.
      // But let's stick to the minimal change for detail view first to avoid breaking it.

      if (classDetails?.schedules && classDetails.schedules.length > 0) {
        // Extract unique weeks from schedule
        const uniqueWeeks = [...new Set(classDetails.schedules.map(s => parseInt(s.weeks, 10)))].sort((a, b) => a - b);
        setActiveWeeks(uniqueWeeks);
      } else if (classDetails?.program) {
        // Fallback to program range if no specific schedules found
        const weeks = [];
        for (let i = classDetails.program.start_week; i <= classDetails.program.end_week; i++) {
          weeks.push(i);
        }
        setActiveWeeks(weeks);
      } else {
        // Default fallback
        setActiveWeeks([35, 36, 37, 38, 39, 40]);
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
      // Save attendance
      // If Detail View is used, we assume toggling a week means ALL SESSIONS attended or NONE.
      // So we need to reconstruct attended_slots based on the weeks.
      // We need schedule info for this.
      let newSlots = [];
      if (classDetails?.schedules) {
        editAttendanceWeeks.forEach(week => {
          // Find all schedules for this week
          const weeklySchedules = classDetails.schedules.filter(s => s.weeks.includes(week) || s.weeks.includes(String(week)));
          weeklySchedules.forEach(s => {
            newSlots.push(`${week}-${s.day}-${s.period}`);
          });
        });
      }

      if (JSON.stringify(editAttendanceWeeks) !== JSON.stringify(attendanceWeeks)) {
        await recordService.saveAttendance(studentData.studentId, classId, editAttendanceWeeks, newSlots);
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
    const totalWeeks = activeWeeks.length;
    if (totalWeeks <= 0) return 0;
    // Count matches between weeks (attended) and activeWeeks (scheduled)
    const count = weeks.filter(w => activeWeeks.includes(w)).length;
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
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Attendance {activeWeeks.length > 0 ? `(Weeks: ${activeWeeks.join(', ')})` : ''}
        </h3>
        <div className="grid grid-cols-10 gap-2">
          {activeWeeks.map(week => {
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
