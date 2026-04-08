import { Link } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { useLang } from "../services/LangContext";

export default function Home() {
  const { user } = useAuth();
  const { t } = useLang();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-4">{t("home.hero")}</h1>
          <p className="text-xl text-purple-100 mb-8">{t("home.heroSub")}</p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <>
                <Link
                  to="/sos"
                  className="bg-red-500 hover:bg-red-600 px-8 py-3 rounded-lg text-lg font-semibold transition shadow-lg"
                >
                  🚨 {t("nav.sos")}
                </Link>
                <Link
                  to="/report"
                  className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-3 rounded-lg text-lg font-semibold transition shadow-lg"
                >
                  📝 {t("nav.report")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-3 rounded-lg text-lg font-semibold transition shadow-lg"
                >
                  {t("auth.registerBtn")}
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white hover:bg-white hover:text-purple-700 px-8 py-3 rounded-lg text-lg font-semibold transition"
                >
                  {t("auth.loginBtn")}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📋"
            title={t("home.feature1Title")}
            desc={t("home.feature1Desc")}
          />
          <FeatureCard
            icon="🚨"
            title={t("home.feature2Title")}
            desc={t("home.feature2Desc")}
          />
          <FeatureCard
            icon="🗺️"
            title={t("home.feature3Title")}
            desc={t("home.feature3Desc")}
          />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-purple-50 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-700">24/7</div>
            <div className="text-gray-600 mt-1">Always Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-700">100%</div>
            <div className="text-gray-600 mt-1">Anonymous</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-700">Instant</div>
            <div className="text-gray-600 mt-1">SOS Alerts</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
