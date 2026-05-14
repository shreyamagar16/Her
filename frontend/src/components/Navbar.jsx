import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { useLang } from "../services/LangContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const close = () => setMenuOpen(false);

  return (
    <nav className="bg-[#3b0764] text-white shadow-xl border-b border-purple-950 relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={close} className="text-xl font-bold tracking-wide flex items-center gap-2">
          🛡️ {t("appName")}
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <DesktopLinks user={user} t={t} lang={lang} toggleLang={toggleLang} handleLogout={handleLogout} />
        </div>

        {/* Mobile: lang + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleLang}
            className="bg-purple-800 px-2 py-1 rounded text-xs font-medium hover:bg-purple-700 transition"
          >
            {lang === "en" ? "हिंदी" : "English"}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded hover:bg-purple-800 transition"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-[#2d0052] px-4 pb-4 pt-2 flex flex-col gap-0 text-sm border-t border-purple-900">
          <MobileLink to="/" onClick={close}>{t("nav.home")}</MobileLink>

          {user && (
            <>
              <MobileLink to="/report" onClick={close}>{t("nav.report")}</MobileLink>
              {user.role !== "ngo" && (
                <MobileLink to="/sos" onClick={close}>{t("nav.sos")}</MobileLink>
              )}
              <MobileLink to="/map" onClick={close}>{t("nav.map")}</MobileLink>
            </>
          )}

          {user && user.role !== "ngo" && (
            <>
              <MobileLink to="/my-reports" onClick={close}>{t("nav.myReports")}</MobileLink>
              <MobileLink to="/volunteer" onClick={close}>{t("nav.volunteer")}</MobileLink>
              <MobileLink to="/emergency-contacts" onClick={close}>
                🆘 Contacts
              </MobileLink>
            </>
          )}

          {user?.role === "ngo" && (
            <MobileLink to="/dashboard" onClick={close}>{t("nav.dashboard")}</MobileLink>
          )}

          <div className="mt-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 px-3 py-2.5 rounded-lg text-sm hover:bg-red-600 transition font-medium"
              >
                {t("nav.logout")}
              </button>
            ) : (
              <Link
                to="/login"
                onClick={close}
                className="block text-center bg-white text-purple-900 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-100 transition"
              >
                {t("nav.login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="py-3 border-b border-purple-900/60 hover:text-purple-300 transition text-purple-100"
    >
      {children}
    </Link>
  );
}

function DesktopLinks({ user, t, lang, toggleLang, handleLogout }) {
  return (
    <>
      <Link to="/" className="hover:text-purple-300 transition">{t("nav.home")}</Link>

      {user && (
        <>
          <Link to="/report" className="hover:text-purple-300 transition">{t("nav.report")}</Link>
          {user.role !== "ngo" && (
            <Link to="/sos" className="hover:text-purple-300 transition">{t("nav.sos")}</Link>
          )}
          <Link to="/map" className="hover:text-purple-300 transition">{t("nav.map")}</Link>
        </>
      )}

      {user && user.role !== "ngo" && (
        <>
          <Link to="/my-reports" className="hover:text-purple-300 transition">{t("nav.myReports")}</Link>
          <Link to="/volunteer" className="hover:text-purple-300 transition">{t("nav.volunteer")}</Link>
          <Link to="/emergency-contacts" className="hover:text-purple-300 transition text-purple-200 font-medium">
            🆘 Contacts
          </Link>
        </>
      )}

      {user?.role === "ngo" && (
        <Link to="/dashboard" className="hover:text-purple-300 transition">{t("nav.dashboard")}</Link>
      )}

      <button
        onClick={toggleLang}
        className="bg-purple-800 px-2 py-1 rounded text-xs font-medium hover:bg-purple-700 transition"
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
          className="bg-white text-purple-900 px-3 py-1 rounded text-sm font-medium hover:bg-purple-100 transition"
        >
          {t("nav.login")}
        </Link>
      )}
    </>
  );
}
