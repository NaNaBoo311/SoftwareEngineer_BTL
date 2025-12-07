import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { profileService } from "../services/profileService";

export default function ProfilePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const roleParam = params.get("role") || "student";
  const { user } = useUser(); // Get authenticated user from context

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let data;
        if (user.role === "student") {
          data = await profileService.getStudentProfile(user.id);
        } else if (user.role === "tutor") {
          data = await profileService.getTutorProfile(user.id);
        }

        setProfileData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Prepare form data based on role
  const getFormData = () => {
    if (!profileData) return {};

    if (user?.role === "tutor") {
      return {
        name: profileData.user?.fullName || "",
        tutorId: profileData.tutorCode || "",
        email: profileData.user?.email || "",
        faculty: profileData.faculty || "",
        title: profileData.title || "",
        teachingYear: profileData.teachingYear || 0,
        role: "Tutor",
        teachingClasses: profileData.teachingClasses || [],
      };
    } else {
      return {
        name: profileData.user?.fullName || "",
        studentId: profileData.studentCode || "",
        email: profileData.user?.email || "",
        faculty: profileData.faculty || "",
        major: profileData.major || "",
        gpa: profileData.gpa || 0,
        academicYear: profileData.academicYear || 1,
        role: "Student",
        enrolledClasses: profileData.enrolledClasses || [],
      };
    }
  };

  const [form, setForm] = useState(getFormData());

  // Update form when profileData changes
  useEffect(() => {
    if (profileData) {
      setForm(getFormData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSave() {
    try {
      setError(null);

      if (user?.role === "student") {
        // Update user info (name, email)
        await profileService.updateUserInfo(user.id, {
          full_name: form.name,
          email: form.email,
        });

        // Update student-specific info
        await profileService.updateStudentProfile(profileData.id, {
          major: form.major,
          faculty: form.faculty,
          gpa: parseFloat(form.gpa) || 0,
          academic_year: parseInt(form.academicYear) || 1,
        });
      } else if (user?.role === "tutor") {
        // Update user info (name, email)
        await profileService.updateUserInfo(user.id, {
          full_name: form.name,
          email: form.email,
        });

        // Update tutor-specific info
        await profileService.updateTutorProfile(profileData.id, {
          faculty: form.faculty,
          title: form.title,
          teaching_year: parseInt(form.teachingYear) || 0,
        });
      }

      // Refresh profile data
      const updatedData = user.role === "student"
        ? await profileService.getStudentProfile(user.id)
        : await profileService.getTutorProfile(user.id);

      setProfileData(updatedData);
      setEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile");
    }
  }

  function handleCancel() {
    setForm(getFormData());
    setEditing(false);
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#210F7A] text-white rounded-md hover:bg-[#1a0b5e]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show message if no user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Please log in to view your profile</div>
        </div>
      </div>
    );
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
              {user.role === "tutor" ? form.tutorId : form.studentId}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#FFCF00] mb-2">Personal Information</h3>
            <ul className="space-y-2 text-sm">
              {user.role === "student" && (
                <>
                  <li><strong>GPA:</strong> {form.gpa?.toFixed(2) || "N/A"}</li>
                  <li><strong>Year:</strong> {form.academicYear || "N/A"}</li>
                </>
              )}
              {user.role === "tutor" && (
                <>
                  <li><strong>Title:</strong> {form.title || "N/A"}</li>
                  <li><strong>Teaching Years:</strong> {form.teachingYear || "N/A"}</li>
                </>
              )}
            </ul>
          </div>

          {/* Edit/Save buttons */}
          <div className="mt-auto pt-6 space-y-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="w-full px-4 py-2 bg-[#FFCF00] text-[#210F7A] font-semibold rounded-md hover:bg-yellow-400 transition"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white rounded-tl-3xl shadow-inner p-10 overflow-auto">
          <h1 className="text-2xl font-bold text-[#210F7A] mb-6">Personal Information</h1>

          <div className="grid grid-cols-2 gap-6 max-w-4xl">
            {user.role === "tutor" ? (
              <>
                <div>
                  <label className="text-sm text-gray-600">Full name</label>
                  <input
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Tutor ID</label>
                  <input
                    name="tutorId"
                    value={form.tutorId || ""}
                    disabled={true}
                    className="mt-1 p-2 border rounded-md w-full bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Faculty</label>
                  <input
                    name="faculty"
                    value={form.faculty || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Title</label>
                  <input
                    name="title"
                    value={form.title || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Teaching Years</label>
                  <input
                    name="teachingYear"
                    type="number"
                    min="0"
                    value={form.teachingYear || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Role</label>
                  <input
                    name="role"
                    value={form.role}
                    disabled={true}
                    className="mt-1 p-2 border rounded-md w-full bg-gray-100"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm text-gray-600">Full name</label>
                  <input
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Student ID</label>
                  <input
                    name="studentId"
                    value={form.studentId || ""}
                    disabled={true}
                    className="mt-1 p-2 border rounded-md w-full bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Faculty</label>
                  <input
                    name="faculty"
                    value={form.faculty || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Major</label>
                  <input
                    name="major"
                    value={form.major || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">GPA</label>
                  <input
                    name="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={form.gpa || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Academic Year</label>
                  <input
                    name="academicYear"
                    type="number"
                    min="1"
                    max="6"
                    value={form.academicYear || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="mt-1 p-2 border rounded-md w-full disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Role</label>
                  <input
                    name="role"
                    value={form.role}
                    disabled={true}
                    className="mt-1 p-2 border rounded-md w-full bg-gray-100"
                  />
                </div>
              </>
            )}
          </div>

          {/* Classes section */}
          {user.role === "tutor" ? (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-[#990033] mb-3">Teaching Classes</h3>
              <div className="bg-[#f7f8fa] border rounded-lg p-4">
                {form.teachingClasses && form.teachingClasses.length > 0 ? (
                  <div className="space-y-3">
                    {form.teachingClasses.map((classItem, i) => (
                      <div key={i} className="bg-white p-3 rounded border">
                        <div className="font-semibold text-gray-800">
                          {classItem.classCode} - {classItem.program?.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Students: {classItem.currentStudents}/{classItem.maxStudents}
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-3">
                    {form.enrolledClasses.map((classItem, i) => (
                      <div key={i} className="bg-white p-3 rounded border">
                        <div className="font-semibold text-gray-800">
                          {classItem.classCode} - {classItem.program?.name}
                        </div>
                      </div>
                    ))}
                  </div>
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
