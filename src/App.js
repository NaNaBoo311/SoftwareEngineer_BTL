import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/Login";
import StudentHomePage from "./pages/StudentHomePage";
import ProfilePage from "./pages/ProfilePage";
import StudentRegister from "./pages/StudentRegister";
import ClassesPage from "./pages/ClassesPage";
import CoursePage from "./pages/CoursePage";
import FloatingMenu from "./components/FloatingMenu";
import ApiPlayground from "./pages/ApiPlayGround";
import ProtectedRoute from "./components/ProtectedRoute";
import TutorRegister from "./pages/TutorRegister";
import CourseSpecific from "./pages/CourseSpecific";
import TutorSchedule from "./pages/TutorSchedule";
import StudentSchedule from "./pages/StudentSchedule";
import TutorHomePage from "./pages/TutorHomePage";
import { UserProvider } from "./context/UserContext";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/student-home"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentHomePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor-home"
            element={
              <ProtectedRoute>
                <Layout>
                  <TutorHomePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClassesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId/:courseName/:tab"
            element={
              <ProtectedRoute>
                <Layout>
                  <CourseSpecific />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CoursePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-register"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentRegister />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/api"
            element={
              <Layout>
                <ApiPlayground />
              </Layout>
            }
          />
          <Route
            path="/tutor-register"
            element={
              <Layout>
                <TutorRegister />
              </Layout>
            }
          />
          <Route
            path="/tutor-schedule"
            element={
              <ProtectedRoute>
                <Layout>
                  <TutorSchedule />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-schedule"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentSchedule />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Always visible */}
        {/* <FloatingMenu /> */}
      </Router>
    </UserProvider>
  );
}
