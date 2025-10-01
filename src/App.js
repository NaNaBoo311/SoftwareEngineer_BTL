import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import FloatingMenu from "./components/FloatingMenu";
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
      </Routes>

      {/* Floating Menu (always visible) */}
      <FloatingMenu />
    </Router>
  );
}
