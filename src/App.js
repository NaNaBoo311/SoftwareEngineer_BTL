import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import Register from "./pages/Register";
import CoursePage from "./pages/CoursePage";
import FloatingMenu from "./components/FloatingMenu";
import ApiPlayground from "./pages/ApiPlayGround";
import ProtectedRoute from "./components/ProtectedRoute";
export default function App() {
  return (
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
          path="/register"
          element={
            <ProtectedRoute>
              <Layout>
                <Register />
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
      </Routes>

      {/* Always visible */}
      <FloatingMenu />
    </Router>
  );
}
