import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import FloatingMenu from "./components/FloatingMenu";
import ApiPlayground from "./pages/ApiPlayGround";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <ProfilePage />
            </Layout>
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

      {/* Floating Menu (always visible) */}
      <FloatingMenu />
    </Router>
  );
}
