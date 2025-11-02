import React, { useState } from "react";
import { studentService } from "../services/studentService";
import { tutorService } from "../services/tutorService";
import { authService } from "../services/authService";
import { programService } from "../services/programService";
export default function ApiPlayground() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedApi, setSelectedApi] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //  Grouped API definitions
  const apiGroups = {
    Student: [
      {
        name: "insertStudent",
        description: "List of major:\n 1/ Computer Science\n 2/ Computer Engineering\n 3/ Automotive Engineering\n 4/ Aerospace Engineering\n 5/ Architecture\n 6/ Biotechnology\n 7/ Industrial Management (Minor: Business Administration / Operations & Supply Chain Management)\n 8/ Civil Engineering\n 9/ Chemical Engineering\n 10/ Electrical Electronics Engineering\n 11/ Environmental Engineering\n 12/ Food Technology\n 13/ Logistics & Supply Chain Management\n 14/ Advanced Materials Engineering\n 15/ Mechanical Engineering\n 16/ Mechatronics Engineering\n 17/ Mechatronics Engineering (Minor: Robot Engineering)\n 18/ Natural Resources & Environmental Management\n 19/ Petroleum Engineering\n 20/ Physics Engineering (Minor: Biomedical Engineering)",
        params: [
          "fullName",
          "email",
          "password",
          "studentCode",
          "major",
          "faculty",
        ],
        handler: async (params) =>
          await studentService.insertStudent(
            params.fullName,
            params.email,
            params.password,
            params.studentCode,
            params.major,
            params.faculty
          ),
      },
      {
        name: "getStudentInfoByCode",
        description: "Fetch a student record by student code",
        params: ["studentCode"],
        handler: async (params) =>
          await studentService.getStudentInfoByCode(params.studentCode),
      },
      {
        name: "getAllStudents",
        description: "Get all students available in the system",
        params: [],
        handler: async () => await studentService.getAllStudents(),
      },
      {
        name: "getStudentEnrollments",
        description: "Fetch the detailed enrollments for a student",
        params: ["studentId"],
        handler: async (params) =>
          await studentService.getStudentEnrollments(params.studentId),
      },
      {
        name: "enrollStudentInClass",
        description: "Enroll a student in a specific class",
        params: ["studentId", "classId"],
        handler: async (params) =>
          await studentService.enrollStudentInClass(params.studentId, params.classId),
      },
      {
        name: "unenrollStudentFromClass",
        description: "Remove a student from a class",
        params: ["studentId", "classId"],
        handler: async (params) =>
          await studentService.unenrollStudentFromClass(params.studentId, params.classId),
      },
    ],
    Tutor: [
      {
        name: "insertTutor",
        description:
          "1/ Register the tutor account. \n2/ Fill in the profile.\n3/ Return tutor id.",
        params: [
          "fullName",
          "email",
          "password",
          "tutorCode",
          "faculty",
          "title",
        ],
        handler: async (params) =>
          tutorService.insertTutor(
            params.fullName,
            params.email,
            params.password,
            params.tutorCode,
            params.faculty,
            params.title
          ),
      },
      {
        name: "getTutorInfoByCode",
        description: "Fetch a tutor record by tutor code",
        params: ["tutorCode"],
        handler: async (params) =>
          tutorService.getTutorInfoByCode(params.tutorCode),
      },

      {
        name: "getAllTutor",
        description: "Get all the tutor in the database",
        params: [],
        handler: async () => tutorService.getAllTutor(),
      },
      {
        name: "getTutorSchedules",
        description: "Get the schedules for a tutor",
        params: ["tutorId"],
        handler: async (params) => tutorService.getTutorSchedules(params.tutorId),
      },
      {
        name: "getTutorEnrollments",
        description: "Get the enrollments for a tutor",
        params: ["tutorId"],
        handler: async (params) => tutorService.getTutorEnrollments(params.tutorId),
      },
    ],
    Authentication: [
      {
        name: "signIn",
        description: "Login to a tutor/student account",
        params: ["username", "password"],
        handler: async (params) =>
          await authService.signIn(
            `${params.username}@hcmut.edu.vn`,
            params.password
          ),
      },
      {
        name: "signOut",
        description: "Logout from a tutor/student account",
        params: [],
        handler: async () => await authService.signOut(),
      },
      {
        name: "getCurrentUser",
        description: "Get the current login user",
        params: [],
        handler: async () => await authService.getUser(),
      },
      {
        name: "getUserProfile",
        description: "Get the current login user",
        params: [],
        handler: async () => await authService.getUserProfile(),
      },
      {
        name: "deleteUserAccount",
        description:
          "Delete the user account as well as tutor/student information.",
        params: ["userId"],
        handler: async (params) =>
          await authService.deleteUserAccount(params.userId),
      },
    ],
    Program: [
      {
        name: "insertProgram",
        description: "Insert a program to the system.",
        params: ["name", "code", "description", "faculty", "maxStudents", "numClasses", "periodPerWeek", "numberOfWeek"],
        handler: async (params) =>
          await programService.insertProgram(
            params.name,
            params.code,
            params.description,
            params.faculty,
            params.maxStudents,
            params.numClasses, 
            params.periodPerWeek,
            params.numberOfWeek,
          ),
      },
      {
        name: "getAllProgram",
        description: "Get all the program in the database",
        params: [],
        handler: async () => programService.getAllPrograms(),
      },
      {
        name: "getProgramByCode",
        description: "Get the program by its code.",
        params: ["code"],
        handler: async (params) => programService.getProgramByCode(params.code),
      },
      {
        name: "getProgramsForRegistration",
        description: "Get all the program for registration",
        params: [],
        handler: async () => programService.getProgramsForRegistration(),
      },
      {
        name: "getProgramsWithClasses",
        description: "Get all the program with its classes",
        params: [],
        handler: async () => programService.getProgramsWithClasses(),
      },
      {
        name: "getTakenSchedules",
        description: "Get all the taken schedules",
        params: [],
        handler: async () => programService.getTakenSchedules(),
      },
      {
        name: "deleteProgram",
        description: "Delete the program by its code.",
        params: ["code"],
        handler: async (params) => programService.deleteProgram(params.code),
      },

    ],
  };

  const handleRun = async () => {
    if (!selectedApi || !selectedCategory) return;
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const api = apiGroups[selectedCategory].find(
        (a) => a.name === selectedApi
      );
      const data = await api.handler(paramValues);
      setResult(data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-blue-50">
      {/* Sidebar */}
      <div className="w-72 bg-blue-600 text-white p-4 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">
          API Playground
        </h2>

        {Object.entries(apiGroups).map(([category, apis]) => (
          <div key={category}>
            <button
              onClick={() => {
                const newCategory =
                  selectedCategory === category ? null : category;
                setSelectedCategory(newCategory);
                if (newCategory === null) {
                  setSelectedApi(null);
                  setParamValues({});
                  setResult(null);
                  setError(null);
                }
              }}
              className={`w-full text-left font-semibold text-lg px-3 py-2 rounded-md transition ${
                selectedCategory === category
                  ? "bg-blue-800"
                  : "hover:bg-blue-700"
              }`}
            >
              {category}
            </button>

            {/* Expand APIs under category */}
            {selectedCategory === category && (
              <div className="pl-4 mt-2 space-y-1">
                {apis.map((api) => (
                  <button
                    key={api.name}
                    onClick={() => {
                      setSelectedApi(api.name);
                      setParamValues({});
                      setResult(null);
                      setError(null);
                    }}
                    className={`block w-full text-left px-3 py-1.5 rounded-md text-sm ${
                      selectedApi === api.name
                        ? "bg-blue-900"
                        : "hover:bg-blue-800"
                    }`}
                  >
                    {api.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
        <h1 className="text-3xl font-bold text-blue-700">
          Supabase API Playground
        </h1>

        {selectedApi ? (
          <div className="space-y-6">
            {/* API Info + Input */}
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {selectedApi}
              </h2>
              <p
                className="text-sm text-gray-500 mb-4"
                style={{ whiteSpace: "pre-line" }}
              >
                {
                  apiGroups[selectedCategory].find(
                    (a) => a.name === selectedApi
                  )?.description
                }
              </p>

              {/*  Dynamically render all params */}
              {apiGroups[selectedCategory]
                .find((a) => a.name === selectedApi)
                ?.params.map((p) => (
                  <div key={p} className="mt-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1 capitalize">
                      {p}
                    </label>
                    <input
                      type="text"
                      value={paramValues[p] || ""}
                      onChange={(e) =>
                        setParamValues((prev) => ({
                          ...prev,
                          [p]: e.target.value,
                        }))
                      }
                      placeholder={`Enter ${p}...`}
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                ))}

              <button
                onClick={handleRun}
                disabled={loading}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md"
              >
                {loading ? "Running..." : "Run Test"}
              </button>
            </div>

            {/* Result Panel */}
            <div className="p-6 bg-white rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-700">
                Result
              </h3>
              {error ? (
                <pre className="text-red-600 whitespace-pre-wrap">{error}</pre>
              ) : result ? (
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-400">No results yet.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-lg">
            Select a category and API from the sidebar to begin.
          </p>
        )}
      </div>
    </div>
  );
}
