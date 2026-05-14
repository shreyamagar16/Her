import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { useLang } from "../services/LangContext";

export default function Home() {
  const { user } = useAuth();
  const { t } = useLang();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2d0052] via-[#3b0764] to-[#6b21a8] text-white py-16 sm:py-24 relative overflow-hidden">
        {/* Subtle animated bg circles */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-md leading-tight">
            {t("home.hero")}
          </h1>
          <p className="text-base sm:text-xl text-purple-200 mb-8 sm:mb-10">{t("home.heroSub")}</p>

          {/* Buttons: stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            {user ? (
              <>
                <Link
                  to="/sos"
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600 px-8 py-3.5 rounded-xl text-base sm:text-lg font-bold transition shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 text-center"
                >
                  🚨 {t("nav.sos")}
                </Link>
                <Link
                  to="/report"
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/20 px-8 py-3.5 rounded-xl text-base sm:text-lg font-bold transition shadow-xl hover:scale-105 active:scale-95 text-center"
                >
                  📝 {t("nav.report")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-white text-[#3b0764] hover:bg-purple-50 px-8 py-3.5 rounded-xl text-base sm:text-lg font-bold transition shadow-xl hover:scale-105 active:scale-95 text-center"
                >
                  {t("auth.registerBtn")}
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto border-2 border-white/60 hover:bg-white/10 backdrop-blur-sm px-8 py-3.5 rounded-xl text-base sm:text-lg font-bold transition hover:scale-105 active:scale-95 text-center"
                >
                  {t("auth.loginBtn")}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto py-12 sm:py-16 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard icon="📋" title={t("home.feature1Title")} desc={t("home.feature1Desc")} />
          <FeatureCard icon="🚨" title={t("home.feature2Title")} desc={t("home.feature2Desc")} />
          <FeatureCard icon="🗺️" title={t("home.feature3Title")} desc={t("home.feature3Desc")} />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-[#2d0052]/5 via-purple-50 to-[#2d0052]/5 py-10 sm:py-12 border-y border-purple-100">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 sm:gap-8 text-center px-4">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#3b0764]">24/7</div>
            <div className="text-gray-600 mt-1 text-xs sm:text-base">Always Available</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#3b0764]">100%</div>
            <div className="text-gray-600 mt-1 text-xs sm:text-base">Anonymous</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-[#3b0764]">Instant</div>
            <div className="text-gray-600 mt-1 text-xs sm:text-base">SOS Alerts</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 text-center hover:shadow-xl transition hover:-translate-y-1 border border-purple-50 group">
      <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform inline-block">{icon}</div>
      <h3 className="text-lg sm:text-xl font-bold text-[#3b0764] mb-2">{title}</h3>
      <p className="text-gray-600 text-sm sm:text-base">{desc}</p>
    </div>
  );
}
