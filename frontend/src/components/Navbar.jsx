import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { useLang } from "../services/LangContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-wide">
          🛡️ {t("appName")}
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-purple-200 transition">
            {t("nav.home")}
          </Link>

          {user && (
            <>
              <Link to="/report" className="hover:text-purple-200 transition">
                {t("nav.report")}
              </Link>
              <Link to="/sos" className="hover:text-purple-200 transition">
                {t("nav.sos")}
              </Link>
              <Link to="/map" className="hover:text-purple-200 transition">
                {t("nav.map")}
              </Link>
            </>
          )}

          {user && user.role !== "ngo" && (
            <>
              <Link to="/my-reports" className="hover:text-purple-200 transition">
                {t("nav.myReports")}
              </Link>
              <Link to="/volunteer" className="hover:text-purple-200 transition">
                {t("nav.volunteer")}
              </Link>
            </>
          )}

          {user?.role === "ngo" && (
            <Link to="/dashboard" className="hover:text-purple-200 transition">
              {t("nav.dashboard")}
            </Link>
          )}

          <button
            onClick={toggleLang}
            className="bg-purple-600 px-2 py-1 rounded text-xs font-medium hover:bg-purple-500 transition"
          >
            {lang === "en" ? "हिंदी" : "English"}
          </button>

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600 transition"
            >
              {t("nav.logout")}
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-white text-purple-700 px-3 py-1 rounded text-sm font-medium hover:bg-purple-100 transition"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
