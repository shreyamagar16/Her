import { useState, useEffect } from "react";
import {
  getVolunteerProfile,
  toggleVolunteer,
  getMyVolunteerAlerts,
  respondToVolunteerAlert,
} from "../services/api";

const ALERT_STATUS_CONFIG = {
  alerted: { label: "Awaiting Response", color: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800" },
  declined: { label: "Declined", color: "bg-gray-100 text-gray-600" },
  on_site: { label: "On Site", color: "bg-blue-100 text-blue-800" },
};

export default function VolunteerPage() {
  const [profile, setProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [area, setArea] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, alertsRes] = await Promise.all([
        getVolunteerProfile(),
        getMyVolunteerAlerts(),
      ]);
      setProfile(profRes.data);
      setAlerts(alertsRes.data);
      setArea(profRes.data.volunteerLocation?.area || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (optIn) => {
    setToggling(true);
    try {
      if (optIn) {
        setLocationLoading(true);
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });
        setLocationLoading(false);

        const res = await toggleVolunteer({
          isVolunteer: true,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          area,
        });
        setProfile(res.data.user);
      } else {
        const res = await toggleVolunteer({ isVolunteer: false });
        setProfile(res.data.user);
      }
    } catch (err) {
      setLocationLoading(false);
      console.error(err);
      alert("Failed. Make sure location access is enabled.");
    } finally {
      setToggling(false);
    }
  };

  const handleRespond = async (sosId, response) => {
    try {
      await respondToVolunteerAlert(sosId, response);
      setAlerts((prev) =>
        prev.map((a) =>
          a._id === sosId
            ? { ...a, volunteerAssignment: { ...a.volunteerAssignment, status: response } }
            : a
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Volunteer Program</h2>

      {/* Opt-in Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-1">
              {profile?.isVolunteer ? "You are a Volunteer ✅" : "Become a Volunteer"}
            </h3>
            <p className="text-sm text-gray-500 max-w-lg">
              As a volunteer, you may be alerted when an SOS emergency happens near your location.
              You can choose to accept or decline each alert. Your help can make a real difference
              — especially in public-area emergencies.
            </p>
          </div>
          <div
            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${
              profile?.isVolunteer ? "bg-green-500" : "bg-gray-300"
            }`}
            onClick={() => !toggling && handleToggle(!profile?.isVolunteer)}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                profile?.isVolunteer ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
        </div>

        {!profile?.isVolunteer && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Area / Locality
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Kothrud, Pune"
                className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <button
              onClick={() => handleToggle(true)}
              disabled={toggling}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-300"
            >
              {locationLoading
                ? "Getting your location..."
                : toggling
                ? "Registering..."
                : "Register as Volunteer"}
            </button>
          </div>
        )}

        {profile?.isVolunteer && profile?.volunteerLocation && (
          <div className="mt-3 text-sm text-gray-600">
            📍 Registered at: {profile.volunteerLocation.area || `${profile.volunteerLocation.lat?.toFixed(4)}, ${profile.volunteerLocation.lng?.toFixed(4)}`}
          </div>
        )}
      </div>

      {/* Volunteer Alerts */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-800 text-lg mb-4">Your Alerts</h3>

        {alerts.length === 0 ? (
          <p className="text-gray-400 text-center py-6">
            {profile?.isVolunteer
              ? "No alerts yet. You'll be notified when help is needed nearby."
              : "Register as a volunteer to receive alerts."}
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const volSt =
                ALERT_STATUS_CONFIG[alert.volunteerAssignment?.status] ||
                ALERT_STATUS_CONFIG.alerted;

              return (
                <div
                  key={alert._id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.volunteerAssignment?.status === "alerted"
                      ? "border-yellow-400 bg-yellow-50"
                      : alert.volunteerAssignment?.status === "accepted"
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-800">
                        SOS from {alert.user?.name || "Unknown"}
                      </span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${volSt.color}`}>
                        {volSt.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    📍 Location: {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                    {alert.user?.phone && <span className="ml-3">📞 {alert.user.phone}</span>}
                  </div>

                  {alert.volunteerAssignment?.status === "alerted" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(alert._id, "accepted")}
                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                      >
                        ✅ Accept & Go Help
                      </button>
                      <button
                        onClick={() => handleRespond(alert._id, "declined")}
                        className="bg-gray-400 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-500 transition"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {alert.volunteerAssignment?.status === "accepted" && (
                    <div className="text-sm text-green-700 font-medium">
                      You accepted this alert. Head to the location and assist until help arrives.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
