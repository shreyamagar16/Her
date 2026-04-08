import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSosById,
  dispatchPolice,
  markPoliceArrived,
  getNearbyVolunteers,
  alertVolunteer,
  resolveSos,
} from "../services/api";
import { useAuth } from "../services/AuthContext";

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-red-100 text-red-800", icon: "🔴" },
  police_dispatched: { label: "Police Dispatched", color: "bg-orange-100 text-orange-800", icon: "🚔" },
  police_arrived: { label: "Police On Scene", color: "bg-blue-100 text-blue-800", icon: "👮" },
  volunteer_dispatched: { label: "Volunteer En Route", color: "bg-indigo-100 text-indigo-800", icon: "🏃" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800", icon: "✅" },
};

export default function SosDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNgo = user?.role === "ngo";

  const [sos, setSos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Police form
  const [policeForm, setPoliceForm] = useState({
    stationName: "",
    officerName: "",
    caseNumber: "",
    notes: "",
  });
  const [dispatching, setDispatching] = useState(false);

  // Volunteers
  const [volunteers, setVolunteers] = useState([]);
  const [loadingVol, setLoadingVol] = useState(false);
  const [alertingVol, setAlertingVol] = useState(null);

  // Resolution
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadSos();
  }, [id]);

  const loadSos = async () => {
    setLoading(true);
    try {
      const res = await getSosById(id);
      setSos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchPolice = async (e) => {
    e.preventDefault();
    if (!policeForm.stationName) return;
    setDispatching(true);
    try {
      const res = await dispatchPolice(id, policeForm);
      setSos(res.data.alert);
    } catch (err) {
      console.error(err);
    } finally {
      setDispatching(false);
    }
  };

  const handlePoliceArrived = async () => {
    try {
      const res = await markPoliceArrived(id);
      setSos(res.data.alert);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadVolunteers = async () => {
    setLoadingVol(true);
    try {
      const res = await getNearbyVolunteers(id);
      setVolunteers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVol(false);
    }
  };

  const handleAlertVolunteer = async (volId) => {
    setAlertingVol(volId);
    try {
      const res = await alertVolunteer(id, volId);
      setSos(res.data.alert);
    } catch (err) {
      console.error(err);
    } finally {
      setAlertingVol(null);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      const res = await resolveSos(id, resolutionNote);
      setSos(res.data.alert);
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (!sos) {
    return <div className="text-center py-20 text-gray-500">SOS alert not found</div>;
  }

  const st = STATUS_CONFIG[sos.status] || STATUS_CONFIG.active;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <button
        onClick={() => navigate(isNgo ? "/dashboard" : -1)}
        className="text-purple-700 hover:text-purple-900 text-sm font-medium mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {st.icon} SOS Alert #{sos._id.slice(-6).toUpperCase()}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${st.color}`}>
                {st.label}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(sos.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium text-gray-700">Person in distress:</span>{" "}
            {sos.user?.name || "Unknown"}
          </div>
          <div>
            <span className="font-medium text-gray-700">Phone:</span>{" "}
            {sos.user?.phone || "N/A"}
          </div>
          <div>
            <span className="font-medium text-gray-700">Location:</span>{" "}
            {sos.location.lat.toFixed(4)}, {sos.location.lng.toFixed(4)}
          </div>
          {sos.policeIntervention?.stationName && (
            <div>
              <span className="font-medium text-gray-700">Police Station:</span>{" "}
              {sos.policeIntervention.stationName}
            </div>
          )}
        </div>

        {/* Police Intervention Summary */}
        {sos.policeIntervention?.dispatchedAt && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200 text-sm">
            <h4 className="font-semibold text-orange-800 mb-1">Police Intervention</h4>
            <div className="grid grid-cols-2 gap-2 text-gray-700">
              <div>Station: <strong>{sos.policeIntervention.stationName}</strong></div>
              {sos.policeIntervention.officerName && (
                <div>Officer: <strong>{sos.policeIntervention.officerName}</strong></div>
              )}
              {sos.policeIntervention.caseNumber && (
                <div>Case #: <strong>{sos.policeIntervention.caseNumber}</strong></div>
              )}
              <div>
                Dispatched: <strong>{new Date(sos.policeIntervention.dispatchedAt).toLocaleTimeString()}</strong>
              </div>
              {sos.policeIntervention.arrivedAt && (
                <div>
                  Arrived: <strong>{new Date(sos.policeIntervention.arrivedAt).toLocaleTimeString()}</strong>
                </div>
              )}
            </div>
            {sos.policeIntervention.notes && (
              <p className="mt-1 text-gray-600">Notes: {sos.policeIntervention.notes}</p>
            )}
          </div>
        )}

        {/* Volunteer Assignment Summary */}
        {sos.volunteerAssignment?.status !== "none" && sos.volunteerAssignment?.volunteer && (
          <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-sm">
            <h4 className="font-semibold text-indigo-800 mb-1">Volunteer Assignment</h4>
            <div className="text-gray-700">
              Volunteer: <strong>{sos.volunteerAssignment.volunteer?.name || "N/A"}</strong>
              {" — "}
              Status: <strong className="capitalize">{sos.volunteerAssignment.status}</strong>
            </div>
          </div>
        )}
      </div>

      {/* NGO Action Tabs */}
      {isNgo && sos.status !== "resolved" && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            {["overview", "police", "volunteers", "resolve"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "volunteers") handleLoadVolunteers();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-purple-700 text-white"
                    : "bg-white text-gray-700 hover:bg-purple-50 border"
                }`}
              >
                {tab === "overview" && "Timeline"}
                {tab === "police" && "🚔 Police Intervention"}
                {tab === "volunteers" && "🤝 Volunteers"}
                {tab === "resolve" && "✅ Resolve"}
              </button>
            ))}
          </div>

          {/* Police Intervention Tab */}
          {activeTab === "police" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Request Police Intervention</h3>

              {sos.status === "police_dispatched" && (
                <div className="mb-4">
                  <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-sm mb-3">
                    Police have been dispatched from <strong>{sos.policeIntervention?.stationName}</strong>.
                    Confirm when they arrive on scene.
                  </div>
                  <button
                    onClick={handlePoliceArrived}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    👮 Confirm Police Arrived
                  </button>
                </div>
              )}

              {sos.status === "police_arrived" && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm">
                  Police are on scene. You can now resolve the SOS once the situation is handled.
                </div>
              )}

              {sos.status === "active" || sos.status === "volunteer_dispatched" ? (
                <form onSubmit={handleDispatchPolice} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Police Station Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={policeForm.stationName}
                      onChange={(e) => setPoliceForm({ ...policeForm, stationName: e.target.value })}
                      placeholder="e.g. Pune Central Police Station"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Officer Name
                      </label>
                      <input
                        type="text"
                        value={policeForm.officerName}
                        onChange={(e) => setPoliceForm({ ...policeForm, officerName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Case/Reference Number
                      </label>
                      <input
                        type="text"
                        value={policeForm.caseNumber}
                        onChange={(e) => setPoliceForm({ ...policeForm, caseNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes for Police
                    </label>
                    <textarea
                      rows={2}
                      value={policeForm.notes}
                      onChange={(e) => setPoliceForm({ ...policeForm, notes: e.target.value })}
                      placeholder="Brief situation description for responding officers..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={dispatching}
                    className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition disabled:bg-gray-300"
                  >
                    {dispatching ? "Dispatching..." : "🚔 Dispatch Police"}
                  </button>
                </form>
              ) : null}
            </div>
          )}

          {/* Volunteers Tab */}
          {activeTab === "volunteers" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Nearby Volunteers</h3>
              <p className="text-sm text-gray-500 mb-4">
                Volunteers registered within ~5km of the SOS location. Best suited for public-area emergencies.
                For home/private situations, prefer police intervention first.
              </p>

              {sos.volunteerAssignment?.status === "alerted" && (
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm mb-4">
                  A volunteer has been alerted and is awaiting their response.
                </div>
              )}

              {sos.volunteerAssignment?.status === "accepted" && (
                <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm mb-4">
                  Volunteer <strong>{sos.volunteerAssignment.volunteer?.name}</strong> has accepted and is en route!
                </div>
              )}

              {loadingVol ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : volunteers.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-lg mb-1">No volunteers found nearby</p>
                  <p className="text-sm">Consider dispatching police instead.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {volunteers.map((vol) => (
                    <div
                      key={vol._id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border"
                    >
                      <div>
                        <span className="font-medium text-gray-800">{vol.name}</span>
                        <span className="ml-3 text-sm text-gray-500">📞 {vol.phone}</span>
                        {vol.volunteerLocation?.area && (
                          <span className="ml-3 text-xs text-gray-400">
                            📍 {vol.volunteerLocation.area}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAlertVolunteer(vol._id)}
                        disabled={alertingVol === vol._id || sos.volunteerAssignment?.status === "alerted"}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:bg-gray-300"
                      >
                        {alertingVol === vol._id ? "Alerting..." : "Send Alert"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleLoadVolunteers}
                className="mt-4 text-sm text-purple-700 hover:text-purple-900 font-medium"
              >
                ↻ Refresh list
              </button>
            </div>
          )}

          {/* Resolve Tab */}
          {activeTab === "resolve" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Resolve SOS Alert</h3>
              <p className="text-sm text-gray-500 mb-4">
                Only resolve once the situation has been fully handled (police on scene, person safe, etc.)
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Summary of how the situation was resolved..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-300"
              >
                {resolving ? "Resolving..." : "✅ Mark Resolved"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Timeline — always visible */}
      {(activeTab === "overview" || !isNgo || sos.status === "resolved") && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Action Timeline</h3>

          {sos.timeline && sos.timeline.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-purple-200 space-y-4">
              {sos.timeline.map((entry, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-purple-500 border-2 border-white" />
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-800 text-sm">{entry.action}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-gray-500 mt-1">{entry.note}</p>
                    )}
                    {entry.performedBy && (
                      <p className="text-xs text-purple-500 mt-1">
                        by {entry.performedBy?.name || "System"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No actions recorded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
