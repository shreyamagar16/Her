import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getReports,
  getSosAlerts,
  getFlaggedLocations,
} from "../services/api";
import MapView from "../components/MapView";
import { useLang } from "../services/LangContext";

const STATUS_LABELS = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  visit_scheduled: { label: "Visit Scheduled", color: "bg-indigo-100 text-indigo-800" },
  visited: { label: "Visited", color: "bg-purple-100 text-purple-800" },
  reviewed: { label: "Reviewed", color: "bg-teal-100 text-teal-800" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
  active: { label: "Active", color: "bg-red-100 text-red-800" },
  police_dispatched: { label: "Police Dispatched", color: "bg-orange-100 text-orange-800" },
  police_arrived: { label: "Police On Scene", color: "bg-blue-100 text-blue-800" },
  volunteer_dispatched: { label: "Volunteer En Route", color: "bg-indigo-100 text-indigo-800" },
};

export default function Dashboard() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [tab, setTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const [reportsRes, sosRes, flaggedRes] = await Promise.all([
        getReports(params),
        getSosAlerts(),
        getFlaggedLocations(),
      ]);

      setReports(reportsRes.data);
      setSosAlerts(sosRes.data);
      setFlagged(flaggedRes.data);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "reports", label: t("dashboard.reports"), count: reports.length },
    { key: "sos", label: t("dashboard.sosAlerts"), count: sosAlerts.length },
    { key: "flagged", label: t("dashboard.flaggedAreas"), count: flagged.length },
    { key: "map", label: "Map View", count: null },
  ];

  const statusBadge = (status) => {
    const st = STATUS_LABELS[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
        {st.label}
      </span>
    );
  };

  const filterStatuses = ["", "pending", "in_progress", "visit_scheduled", "reviewed", "resolved"];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("dashboard.title")}</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === item.key
                ? "bg-purple-700 text-white"
                : "bg-white text-gray-700 hover:bg-purple-50 border"
            }`}
          >
            {item.label}
            {item.count !== null && (
              <span className="ml-1.5 bg-white/20 px-1.5 rounded-full text-xs">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
        </div>
      ) : (
        <>
          {/* Reports Tab */}
          {tab === "reports" && (
            <div>
              <div className="mb-4 flex gap-2 items-center flex-wrap">
                <span className="text-sm text-gray-600">{t("dashboard.filter")}:</span>
                {filterStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      statusFilter === s
                        ? "bg-purple-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {s ? (STATUS_LABELS[s]?.label || s) : t("dashboard.all")}
                  </button>
                ))}
              </div>

              {reports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t("dashboard.noReports")}</p>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      onClick={() => navigate(`/report/${report._id}`)}
                      className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500 cursor-pointer hover:shadow-lg hover:border-purple-700 transition relative"
                    >
                      {report.hasUnreadForNgo && (
                        <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                            {report.abuseType}
                          </span>
                          {statusBadge(report.status)}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-2 line-clamp-2">{report.description}</p>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          📍 {report.location?.address || `${report.location?.lat?.toFixed(4)}, ${report.location?.lng?.toFixed(4)}`}
                        </span>
                        <span className="text-xs text-purple-600 font-medium">
                          Click to open →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SOS Tab */}
          {tab === "sos" && (
            <div>
              {sosAlerts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t("dashboard.noAlerts")}</p>
              ) : (
                <div className="space-y-3">
                  {sosAlerts.map((alert) => {
                    const borderColors = {
                      active: "border-red-500",
                      police_dispatched: "border-orange-500",
                      police_arrived: "border-blue-500",
                      volunteer_dispatched: "border-indigo-500",
                      resolved: "border-green-500",
                    };
                    return (
                      <div
                        key={alert._id}
                        onClick={() => navigate(`/sos/${alert._id}`)}
                        className={`bg-white rounded-lg shadow p-5 border-l-4 cursor-pointer hover:shadow-lg transition ${
                          borderColors[alert.status] || "border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">
                              {alert.user?.name || "Unknown User"}
                            </span>
                            {statusBadge(alert.status)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <span>📍 {alert.location?.lat?.toFixed(4)}, {alert.location?.lng?.toFixed(4)}</span>
                            {alert.user?.phone && (
                              <span className="ml-4">📞 {alert.user.phone}</span>
                            )}
                          </div>
                          <span className="text-xs text-purple-600 font-medium">
                            Click to manage →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Flagged Tab */}
          {tab === "flagged" && (
            <div>
              {flagged.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t("dashboard.noFlagged")}</p>
              ) : (
                <div className="space-y-4">
                  {flagged.map((loc) => (
                    <div key={loc._id} className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-800">
                            📍 {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                          </span>
                          <span className="ml-3 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            {loc.reportCount} reports
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Flagged: {new Date(loc.flaggedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Map Tab */}
          {tab === "map" && (
            <div className="h-[500px] rounded-xl overflow-hidden shadow-lg">
              <MapView
                center={[20.5937, 78.9629]}
                flaggedLocations={flagged}
                showPolice={true}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
