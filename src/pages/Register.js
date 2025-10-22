import { useState, useEffect } from "react";
import { Search, Users, User, ChevronDown, ChevronUp } from "lucide-react";
import { programService } from "../services/programService";

export default function Register() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch programs for registration
  useEffect(() => {
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

    fetchPrograms();
  }, []);


  
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

  const confirmRegistration = () => {
    alert(
      `Successfully registered for ${selectedClass.class.class_code} with ${selectedClass.class.tutor_name}!`
    );
    setShowModal(false);
    setSelectedClass(null);
  };

  const isFull = (classData) =>
    classData.current_students >= classData.max_students;
  const canRegister = (program, classData) =>
    program.status === "active" && !isFull(classData);

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
            {filteredPrograms.map((program) => (
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
                        {getTotalEnrolled(program.classes)} students enrolled
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>
                        {program.classes.length}{" "}
                        {program.classes.length === 1 ? "class" : "classes"}{" "}
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
                  <div className="border-t pt-4 space-y-3">
                    {program.classes.map((classData) => (
                      <div
                        key={classData.id}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-gray-900">
                                {classData.class_code}
                              </span>
                              <span className="text-sm text-gray-500">|</span>
                              <span className="text-gray-700">
                                {classData.tutor_name}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>{classData.tutor_department}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {classData.current_students}/
                                {classData.max_students}
                              </div>
                              <div className="text-xs text-gray-500">
                                students
                              </div>
                            </div>
                            <button
                              onClick={() => handleRegister(program, classData)}
                              disabled={!canRegister(program, classData)}
                              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                canRegister(program, classData)
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              {isFull(classData)
                                ? "Full"
                                : program.status === "completed"
                                ? "Completed"
                                : program.status === "upcoming"
                                ? "Coming Soon"
                                : "Register"}
                            </button>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                            Class Schedule
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                    Date
                                  </th>
                                  <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                    Period
                                  </th>
                                  <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                    Week
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {classData.schedule.map((scheduleItem, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-b border-gray-100 last:border-0"
                                  >
                                    <td className="py-3 px-3 text-gray-900">
                                      {scheduleItem.day}
                                    </td>
                                    <td className="py-3 px-3 text-gray-700">
                                      {scheduleItem.period}
                                    </td>
                                    <td className="py-3 px-3">
                                      <div className="flex flex-wrap gap-1">
                                        {scheduleItem.weeks
                                          .split("|")
                                          .map((week, weekIdx) => (
                                            <span
                                              key={weekIdx}
                                              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                                week === "-"
                                                  ? "bg-gray-200 text-gray-600"
                                                  : "bg-blue-100 text-blue-700"
                                              }`}
                                            >
                                              {week === "-" ? "✕" : week}
                                            </span>
                                          ))}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
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
            ))}

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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmRegistration}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
