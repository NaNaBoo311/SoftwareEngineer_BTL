import React, { useState } from "react";
import { studentService } from "../services/studentService";

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
        name: "getStudentInfoByCode",
        description: "Fetch a student record by student code",
        params: ["studentCode"],
        handler: async (params) =>
          await studentService.getStudentInfoByCode(params.studentCode),
      },
      {
        name: "getAllStudent",
        description: "Get all student available in the system",
        params: [],
        handler: async () => await studentService.getAllStudent(),
      },
      {
        name: "insertStudent",
        description: "Insert a new student record and return user_id",
        params: ["fullName", "email", "studentCode", "program", "major"],
        handler: async (params) =>
          await studentService.insertStudent(
            params.fullName,
            params.email,
            params.studentCode,
            params.program,
            params.major
          ),
      },
    ],
    Tutor: [
      {
        name: "getTutorInfoByCode",
        description: "Fetch a tutor record by tutor code",
        params: ["tutorCode"],
        handler: async (params) => {
          // Example placeholder
          return { message: `Tutor code received: ${params.tutorCode}` };
        },
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
      setError(err.message);
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
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category ? null : category
                )
              }
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
              <p className="text-sm text-gray-500 mb-4">
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
