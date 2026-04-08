import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyReports } from "../services/api";
import { useLang } from "../services/LangContext";

const STATUS_LABELS = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  visit_scheduled: { label: "Visit Scheduled", color: "bg-indigo-100 text-indigo-800" },
  visited: { label: "Visited", color: "bg-purple-100 text-purple-800" },
  reviewed: { label: "Reviewed", color: "bg-teal-100 text-teal-800" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
};

export default function MyReports() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReports()
      .then((res) => setReports(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Reports</h2>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-500 text-lg mb-4">You haven't submitted any reports yet.</p>
          <button
            onClick={() => navigate("/report")}
            className="bg-purple-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-800 transition"
          >
            {t("nav.report")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const st = STATUS_LABELS[report.status] || STATUS_LABELS.pending;
            return (
              <div
                key={report._id}
                onClick={() => navigate(`/report/${report._id}`)}
                className="bg-white rounded-lg shadow-md p-5 border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition relative"
              >
                {report.hasUnreadForUser && (
                  <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}

                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                      {report.abuseType}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-gray-700 mb-2 line-clamp-2">{report.description}</p>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    📍 {report.location?.address || `${report.location?.lat?.toFixed(4)}, ${report.location?.lng?.toFixed(4)}`}
                  </span>
                  {report.visitDate && (
                    <span className="text-indigo-600 font-medium">
                      Visit: {new Date(report.visitDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs text-purple-600 font-medium">
                  Click to view details & messages →
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
