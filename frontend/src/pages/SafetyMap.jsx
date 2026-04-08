import { useState, useEffect } from "react";
import MapView from "../components/MapView";
import { getFlaggedLocations } from "../services/api";
import { useLang } from "../services/LangContext";

export default function SafetyMap() {
  const { t } = useLang();
  const [userLocation, setUserLocation] = useState(null);
  const [flagged, setFlagged] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setUserLocation([20.5937, 78.9629])
    );

    getFlaggedLocations()
      .then((res) => setFlagged(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("map.title")}</h2>

      <div className="flex gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>
          {t("map.yourLocation")}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
          {t("map.flaggedZone")}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
          {t("map.policeStation")}
        </span>
      </div>

      <div className="h-[500px] rounded-xl overflow-hidden shadow-lg">
        {userLocation && (
          <MapView
            center={userLocation}
            flaggedLocations={flagged}
            showPolice={true}
          />
        )}
      </div>
    </div>
  );
}
