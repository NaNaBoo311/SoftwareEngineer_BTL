import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function ProfilePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const roleParam = params.get("role") || "student";

  const [editing, setEditing] = useState(false);

  // Provide role-specific mock initial data
  const initialForm =
    roleParam.toLowerCase() === "tutor"
      ? {
          name: "Dr. Nguyen Van A",
          tutorId: "T-1001",
          email: "nguyenvana@university.edu.vn",
          department: "Computer Science and Engineering",
          subjects: "Algorithms, Data Structures, Software Engineering",
          role: "Tutor",
          teachingClasses: [
            "CS101 - Introduction to Programming",
            "SE305 - Software Engineering",
          ],
        }
      : {
          name: "Nguyen Truong An",
          studentId: "2351234",
          email: "se123@hcmut.edu.vn",
          faculty: "Computer Science and Engineering",
          major: "Computer Science",
          role: "Student",
          enrolledClasses: [
            "CS101 - Introduction to Programming",
            "SE201 - Data Structures",
            "SE305 - Software Engineering",
          ],
        };

  const [form, setForm] = useState(initialForm);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleSave() {
    console.log("Saved profile", form);
    setEditing(false);
  }

  function handleCancel() {
    setEditing(false);
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col">
      {/* Page Wrapper (below your NavBar) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
          <aside className="w-80 bg-[#210F7A] text-white flex flex-col p-6">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/assets/truongan.jpg"
              alt="avatar"
              className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg mb-4"
            />
            <h2 className="text-xl font-bold">{form.name}</h2>
            <p className="text-sm text-gray-200">
              {roleParam.toLowerCase() === "tutor" ? form.tutorId : form.studentId}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#FFCF00] mb-2">Personal Information</h3>
            <ul className="space-y-2 text-sm">
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white rounded-tl-3xl shadow-inner p-10 overflow-auto">
          <h1 className="text-2xl font-bold text-[#210F7A] mb-6">Personal Information</h1>

          <div className="grid grid-cols-2 gap-6 max-w-4xl">
            {roleParam.toLowerCase() === "tutor" ? (
              <>
                <div>
                  <label className="text-sm text-gray-600">Full name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Tutor ID</label>
                  <input
                    name="tutorId"
                    value={form.tutorId}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Department</label>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Subjects</label>
                  <input
                    name="subjects"
                    value={form.subjects}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full bg-white disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Role</label>
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full bg-white disabled:bg-gray-100"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm text-gray-600">Full name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Student ID</label>
                  <input
                    name="studentId"
                    value={form.studentId}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Faculty</label>
                  <input
                    name="faculty"
                    value={form.faculty}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Major</label>
                  <input
                    name="major"
                    value={form.major}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full bg-white disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Role</label>
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full bg-white disabled:bg-gray-100"
                  />
                </div>
              </>
            )}
          </div>

          {roleParam.toLowerCase() === "tutor" ? (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-[#990033] mb-3">Teaching Classes</h3>
              <div className="bg-[#f7f8fa] border rounded-lg p-4">
                {form.teachingClasses && form.teachingClasses.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                    {form.teachingClasses.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">No classes assigned.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-[#990033] mb-3">Enrolled Classes</h3>
              <div className="bg-[#f7f8fa] border rounded-lg p-4">
                {form.enrolledClasses && form.enrolledClasses.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                    {form.enrolledClasses.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">Not enrolled in any classes.</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
