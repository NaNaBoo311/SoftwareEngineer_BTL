import { useState, useEffect } from "react";
import { Search, Users, User, ChevronDown, ChevronUp, X } from "lucide-react";
import { programService } from "../services/programService";
import { studentService } from "../services/studentService";
import { useUser } from "../context/UserContext";

export default function StudentRegister() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [unregistering, setUnregistering] = useState({});

  // Fetch programs for registration
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await programService.getProgramsForRegistration();
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
      // You might want to show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  // Fetch student enrollments to check if already enrolled
  const fetchStudentEnrollments = async () => {
    if (!user || !user.details?.id || user.role !== "student") return;
    
    try {
      const enrollments = await studentService.getStudentEnrollments(user.details.id);
      setStudentEnrollments(enrollments);
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchStudentEnrollments();
  }, [user]);


  
  const categories = ["all", "Academic", "Non-Academic"];
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.program_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || program.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      upcoming: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
    };
    return styles[status] || styles.active;
  };

  const toggleProgram = (programId) => {
    setExpandedPrograms((prev) => ({
      ...prev,
      [programId]: !prev[programId],
    }));
  };

  const handleRegister = (programData, classData) => {
    setSelectedClass({ program: programData, class: classData });
    setShowModal(true);
  };

  const getScheduleSummary = (schedule) => {
    const days = schedule.map((s) => s.day.slice(0, 3)).join(", ");
    const period = schedule[0].period;
    return `${days} Period ${period}`;
  };

  // Helper function to convert day number to day name
  const getDayName = (dayNumber) => {
    const dayNames = {
      '1': 'Monday',
      '2': 'Tuesday',
      '3': 'Wednesday',
      '4': 'Thursday',
      '5': 'Friday',
      '6': 'Saturday',
      '7': 'Sunday'
    };
    return dayNames[dayNumber.toString()] || dayNumber;
  };

  // Helper function to format consecutive periods
  const formatPeriods = (periods) => {
    if (periods.length === 0) return '';
    if (periods.length === 1) return periods[0].toString();

    // Sort periods
    const sorted = [...periods].sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        // Consecutive period
        end = sorted[i];
      } else {
        // Non-consecutive, save the range
        if (start === end) {
          ranges.push(start.toString());
        } else {
          ranges.push(`${start}-${end}`);
        }
        start = sorted[i];
        end = sorted[i];
      }
    }

    // Add the last range
    if (start === end) {
      ranges.push(start.toString());
    } else {
      ranges.push(`${start}-${end}`);
    }

    return ranges.join(', ');
  };

  // Helper function to group schedule by day
  const groupScheduleByDay = (schedule) => {
    // First, consolidate by day-period-room to merge weeks
    const consolidatedMap = {};
    
    schedule.forEach(item => {
      const key = `${item.day}-${item.period}-${item.room}`;
      if (!consolidatedMap[key]) {
        consolidatedMap[key] = {
          day: item.day,
          period: item.period,
          room: item.room,
          weeks: []
        };
      }
      // Add week if not already present
      if (!consolidatedMap[key].weeks.includes(item.weeks)) {
        consolidatedMap[key].weeks.push(item.weeks);
      }
    });

    // Now group by day only
    const dayMap = {};
    Object.values(consolidatedMap).forEach(item => {
      const day = item.day;
      if (!dayMap[day]) {
        dayMap[day] = {
          day: day,
          periods: new Set(), // Use Set to avoid duplicates
          room: null, // Will be set later
          scheduledWeeks: item.weeks.map(w => parseInt(w))
        };
      }
      
      // Always try to set room if we have a valid one and haven't set it yet
      if (item.room && item.room !== 'undefined' && !dayMap[day].room) {
        dayMap[day].room = item.room;
      }
      
      dayMap[day].periods.add(parseInt(item.period));
      // Merge weeks from different periods
      item.weeks.forEach(w => {
        const weekNum = parseInt(w);
        if (!dayMap[day].scheduledWeeks.includes(weekNum)) {
          dayMap[day].scheduledWeeks.push(weekNum);
        }
      });
    });

    // Convert to array and format periods
    return Object.values(dayMap).map(dayData => ({
      ...dayData,
      periodsFormatted: formatPeriods(Array.from(dayData.periods))
    }));
  };

  const confirmRegistration = async () => {
    if (!user || !user.details?.id) {
      alert("You must be logged in to register for classes.");
      return;
    }

    try {
      setRegistering(true);
      
      // Enroll the student in the class
      const result = await studentService.enrollStudentInClass(
        user.details.id, // studentId
        selectedClass.class.id // classId
      );

      alert(
        `Successfully registered for ${selectedClass.class.class_code} with ${selectedClass.class.tutor_name}!`
      );
      
      // Clear the modal and selected class
      setShowModal(false);
      setSelectedClass(null);
      
      // Refresh the programs list and student enrollments
      await fetchPrograms();
      await fetchStudentEnrollments();
      
    } catch (error) {
      console.error("Registration error:", error);
      alert(`Registration failed: ${error.message}`);
    } finally {
      setRegistering(false);
    }
  };

  // Unregister from a class
  const handleUnregister = async (classId) => {
    if (!user || !user.details?.id) {
      alert("You must be logged in to unregister from classes.");
      return;
    }

    if (!window.confirm("Are you sure you want to unregister from this class?")) {
      return;
    }

    try {
      setUnregistering(prev => ({ ...prev, [classId]: true }));
      
      await studentService.unenrollStudentFromClass(user.details.id, classId);
      
      alert("Successfully unregistered from the class!");
      
      // Refresh the programs list and student enrollments
      await fetchPrograms();
      await fetchStudentEnrollments();
      
    } catch (error) {
      console.error("Unregistration error:", error);
      alert(`Unregistration failed: ${error.message}`);
    } finally {
      setUnregistering(prev => ({ ...prev, [classId]: false }));
    }
  };

  const isFull = (classData) =>
    classData.current_students >= classData.max_students;
  
  const isAlreadyEnrolled = (classId) => {
    return studentEnrollments.some(enrollment => enrollment.class?.id === classId);
  };
  
  const isEnrolledInProgram = (programId) => {
    return studentEnrollments.some(enrollment => enrollment.program?.id === programId);
  };
  
  const canRegister = (program, classData) => {
    if (program.status !== "active") return false;
    if (isFull(classData)) return false;
    if (isAlreadyEnrolled(classData.id)) return false;
    if (isEnrolledInProgram(program.id)) return false; // One class per program
    return true;
  };

  const getTotalEnrolled = (classes) => {
    return classes.reduce((sum, cls) => sum + cls.current_students, 0);
  };

  const getTotalCapacity = (classes) => {
    return classes.reduce((sum, cls) => sum + cls.max_students, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Program Registration
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Loading programs...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrograms.map((program) => {
              // Filter classes to only show those with tutors
              const classesWithTutors = program.classes.filter(classItem => classItem.tutor_name && classItem.tutor_name.trim() !== '');
              
              // Skip programs with no classes that have tutors
              if (classesWithTutors.length === 0) return null;
              
              return (
                <div
                  key={program.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {program.program_code} - {program.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {program.description}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded ml-4 ${getStatusBadge(
                      program.status
                    )}`}
                  >
                    {program.status}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {getTotalEnrolled(classesWithTutors)} students enrolled
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>
                        {classesWithTutors.length}{" "}
                        {classesWithTutors.length === 1 ? "class" : "classes"}{" "}
                        available
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleProgram(program.id)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    {expandedPrograms[program.id] ? (
                      <>
                        <span>Hide Classes</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>View Classes</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {expandedPrograms[program.id] && (
                  <div className="border-t pt-4 space-y-4">
                    {classesWithTutors.map((classData) => (
                      <div
                        key={classData.id}
                        className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Class Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-blue-100">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md">
                                    <h4 className="text-2xl font-bold text-white">
                                      {classData.class_code}
                                    </h4>
                                  </div>
                                  {isAlreadyEnrolled(classData.id) && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full border border-green-300">
                                      ✓ Enrolled
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-6 ml-14">
                                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-lg border border-purple-200">
                                  <span className="text-3xl">👨‍🏫</span>
                                  <div>
                                    <span className="text-purple-600 text-xs font-medium uppercase tracking-wide">Instructor</span>
                                    <p className="font-bold text-gray-900 text-base">{classData.tutor_name}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200">
                                  <span className="text-3xl">👥</span>
                                  <div>
                                    <span className="text-green-600 text-xs font-medium uppercase tracking-wide">Capacity</span>
                                    <p className="font-bold text-gray-900 text-base">
                                      {classData.current_students}/{classData.max_students} students
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {isAlreadyEnrolled(classData.id) ? (
                                <button
                                  onClick={() => handleUnregister(classData.id)}
                                  disabled={unregistering[classData.id]}
                                  className="flex items-center gap-2 px-6 py-3 text-base text-red-600 bg-white hover:bg-red-50 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-300 shadow-sm hover:shadow"
                                >
                                  <X className="w-5 h-5" />
                                  {unregistering[classData.id] ? "Unregistering..." : "Unregister"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRegister(program, classData)}
                                  disabled={!canRegister(program, classData)}
                                  className={`px-8 py-3 text-base rounded-lg font-semibold transition-all shadow-sm ${
                                    canRegister(program, classData)
                                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
                                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  {isEnrolledInProgram(program.id)
                                    ? "Already in Program"
                                    : isFull(classData)
                                    ? "Class Full"
                                    : program.status === "completed"
                                    ? "Completed"
                                    : program.status === "upcoming"
                                    ? "Coming Soon"
                                    : "Register Now"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Schedule Details */}
                        <div className="p-6 bg-gray-50">
                          <div className="flex items-center gap-2 mb-5">
                            <span className="text-2xl">📅</span>
                            <h5 className="text-lg font-bold text-gray-800">Class Schedule</h5>
                          </div>
                          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                  <th className="text-left py-4 px-5 font-bold text-gray-800 text-lg">Day</th>
                                  <th className="text-left py-4 px-5 font-bold text-gray-800 text-lg">Periods</th>
                                  <th className="text-left py-4 px-5 font-bold text-gray-800 text-lg">Room</th>
                                  <th className="text-left py-4 px-5 font-bold text-gray-800 text-lg">Weeks</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupScheduleByDay(classData.schedule).map((scheduleItem, idx) => {
                                  // Generate weeks 35-50
                                  const allWeeks = Array.from({ length: 16 }, (_, i) => i + 35);
                                  const scheduledWeeks = scheduleItem.scheduledWeeks || [];
                                  
                                  return (
                                    <tr
                                      key={idx}
                                      className="border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors"
                                    >
                                      <td className="py-5 px-5 font-bold text-gray-900 text-base">
                                        {getDayName(scheduleItem.day)}
                                      </td>
                                      <td className="py-5 px-5">
                                        <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                                          {scheduleItem.periodsFormatted}
                                        </span>
                                      </td>
                                      <td className="py-5 px-5">
                                        <span className="inline-block min-w-[100px] px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg font-bold text-sm border border-purple-300 shadow-sm text-center">
                                          {scheduleItem.room || 'TBA'}
                                        </span>
                                      </td>
                                      <td className="py-5 px-5">
                                        <div className="flex flex-wrap gap-2">
                                          {allWeeks.map((week) => {
                                            const isScheduled = scheduledWeeks.includes(week);
                                            return (
                                              <span
                                                key={week}
                                                className={`inline-block px-3 py-1.5 rounded-md text-sm font-bold shadow-sm ${
                                                  isScheduled
                                                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300"
                                                    : "bg-gray-200 text-gray-500"
                                                }`}
                                              >
                                                {week}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
              );
            })}

            {filteredPrograms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No programs found matching your criteria
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Confirm Registration
            </h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                You are about to register for:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Program</p>
                  <h3 className="font-semibold text-gray-900">
                    {selectedClass.program.program_code} -{" "}
                    {selectedClass.program.name}
                  </h3>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-1">Class</p>
                  <p className="font-semibold text-gray-900">
                    {selectedClass.class.class_code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tutor</p>
                  <p className="font-medium text-gray-900">
                    {selectedClass.class.tutor_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedClass.class.tutor_department}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Schedule</p>
                  <p className="text-gray-900">
                    {getScheduleSummary(selectedClass.class.schedule)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Available Slots</p>
                  <p className="text-gray-900">
                    {selectedClass.class.max_students -
                      selectedClass.class.current_students}{" "}
                    slots remaining
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={registering}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmRegistration}
                disabled={registering}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registering ? "Registering..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
