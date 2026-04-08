import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import { LangProvider } from "./services/LangContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportPage from "./pages/ReportPage";
import SosPage from "./pages/SosPage";
import SafetyMap from "./pages/SafetyMap";
import Dashboard from "./pages/Dashboard";
import ReportDetail from "./pages/ReportDetail";
import MyReports from "./pages/MyReports";
import SosDetail from "./pages/SosDetail";
import VolunteerPage from "./pages/VolunteerPage";

export default function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/report"
                  element={
                    <ProtectedRoute>
                      <ReportPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report/:id"
                  element={
                    <ProtectedRoute>
                      <ReportDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-reports"
                  element={
                    <ProtectedRoute>
                      <MyReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sos"
                  element={
                    <ProtectedRoute>
                      <SosPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sos/:id"
                  element={
                    <ProtectedRoute>
                      <SosDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer"
                  element={
                    <ProtectedRoute>
                      <VolunteerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/map"
                  element={
                    <ProtectedRoute>
                      <SafetyMap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute ngoOnly>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <footer className="bg-gray-800 text-gray-400 text-center py-4 text-sm">
              SafeHer &copy; {new Date().getFullYear()} — Women's Safety Platform
            </footer>
          </div>
        </BrowserRouter>
      </LangProvider>
    </AuthProvider>
  );
}
