import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { useLang } from "../services/LangContext";

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const flaggedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const policeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MOCK_POLICE_STATIONS = [
  { lat: 18.5204, lng: 73.8567, name: "Pune Central Police Station" },
  { lat: 19.076, lng: 72.8777, name: "Mumbai Main Police Station" },
  { lat: 28.6139, lng: 77.209, name: "Delhi Police HQ" },
  { lat: 12.9716, lng: 77.5946, name: "Bangalore City Police" },
];

export default function MapView({ center, flaggedLocations = [], showPolice = true }) {
  const { t } = useLang();
  const mapCenter = center || [20.5937, 78.9629];

  return (
    <MapContainer center={mapCenter} zoom={center ? 13 : 5} className="h-full w-full rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {center && (
        <Marker position={center} icon={userIcon}>
          <Popup>{t("map.yourLocation")}</Popup>
        </Marker>
      )}

      {flaggedLocations.map((loc, idx) => (
        <div key={idx}>
          <Marker position={[loc.lat, loc.lng]} icon={flaggedIcon}>
            <Popup>
              {t("map.flaggedZone")} — {loc.reportCount} reports
            </Popup>
          </Marker>
          <Circle
            center={[loc.lat, loc.lng]}
            radius={500}
            pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.15 }}
          />
        </div>
      ))}

      {showPolice &&
        MOCK_POLICE_STATIONS.map((ps, idx) => (
          <Marker key={`ps-${idx}`} position={[ps.lat, ps.lng]} icon={policeIcon}>
            <Popup>
              {t("map.policeStation")}: {ps.name}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
