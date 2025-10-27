import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import StudentRegister from "./pages/StudentRegister";
import CoursePage from "./pages/CoursePage";
import ClassesPage from "./pages/ClassesPage";
import Register from "./pages/Register";
import FloatingMenu from "./components/FloatingMenu";
import ApiPlayground from "./pages/ApiPlayGround";
import ProtectedRoute from "./components/ProtectedRoute";
import TutorRegister from "./pages/TutorRegister";
import { UserProvider } from "./context/UserContext";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout>
                  <HomePage />
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
        </Routes>

        {/* Always visible */}
        <FloatingMenu />
      </Router>
    </UserProvider>
  );
}
