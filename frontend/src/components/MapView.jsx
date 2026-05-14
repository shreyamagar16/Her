import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useLang } from "../services/LangContext";

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const flaggedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const policeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Comprehensive Pune police station list — curated because OSM data is
// incomplete for Indian police stations (Overpass API misses many).
const ALL_PUNE_POLICE_STATIONS = [
  // Central / Camp
  { lat: 18.5204, lng: 73.8567, name: "Pune Cantonment Police Station", address: "Camp, Pune" },
  { lat: 18.5170, lng: 73.8553, name: "Bundgarden Police Station", address: "Koregaon Park, Pune" },
  { lat: 18.5089, lng: 73.8553, name: "Swargate Police Station", address: "Swargate, Pune" },
  { lat: 18.5314, lng: 73.8446, name: "Shivajinagar Police Station", address: "FC Road, Shivajinagar" },
  { lat: 18.5195, lng: 73.8553, name: "Deccan Police Station", address: "Deccan Gymkhana, Pune" },
  { lat: 18.5236, lng: 73.8625, name: "Vishrambaug Police Station", address: "Vishrambaug, Pune" },
  // West Pune
  { lat: 18.5089, lng: 73.8259, name: "Kothrud Police Station", address: "Kothrud, Pune" },
  { lat: 18.4855, lng: 73.8233, name: "Warje-Malwadi Police Station", address: "Warje, Pune" },
  { lat: 18.5447, lng: 73.8076, name: "Baner Police Station", address: "Baner, Pune" },
  { lat: 18.5793, lng: 73.8143, name: "Aundh Police Station", address: "Aundh, Pune" },
  { lat: 18.5620, lng: 73.7856, name: "Bavdhan Police Station", address: "Bavdhan, Pune" },
  // South Pune / Katraj belt
  { lat: 18.4528, lng: 73.8492, name: "Sinhagad Road Police Station", address: "Sinhagad Road, Pune" },
  { lat: 18.4626, lng: 73.8673, name: "Kondhwa Police Station", address: "Kondhwa, Pune" },
  { lat: 18.4547, lng: 73.8413, name: "Dhayari Police Station", address: "Dhayari, Pune" },
  { lat: 18.4389, lng: 73.8618, name: "Katraj Police Station", address: "Katraj, Pune" },
  { lat: 18.4462, lng: 73.8750, name: "Ambegaon Police Station", address: "Ambegaon Budruk, Pune" },
  { lat: 18.4310, lng: 73.8490, name: "Narhe Police Station", address: "Narhe, Pune" },
  { lat: 18.4200, lng: 73.8670, name: "Haveli Police Station", address: "Haveli, Pune" },
  { lat: 18.4580, lng: 73.9010, name: "Wanowrie Police Station", address: "Wanowrie, Pune" },
  { lat: 18.4730, lng: 73.8940, name: "Bibwewadi Police Station", address: "Bibwewadi, Pune" },
  // East Pune
  { lat: 18.5362, lng: 73.8740, name: "Yerwada Police Station", address: "Yerwada, Pune" },
  { lat: 18.5620, lng: 73.9197, name: "Viman Nagar Police Station", address: "Viman Nagar, Pune" },
  { lat: 18.5500, lng: 73.9400, name: "Lohegaon Police Station", address: "Lohegaon, Pune" },
  { lat: 18.5050, lng: 73.9100, name: "Hadapsar Police Station", address: "Hadapsar, Pune" },
  { lat: 18.4870, lng: 73.9200, name: "Saswad Road Police Station", address: "Fursungi, Pune" },
  { lat: 18.5270, lng: 73.9050, name: "Mundhwa Police Station", address: "Mundhwa, Pune" },
  // North Pune / PCMC
  { lat: 18.5935, lng: 73.7412, name: "Pimpri Police Station", address: "Pimpri, Pune" },
  { lat: 18.6298, lng: 73.7997, name: "Chinchwad Police Station", address: "Chinchwad, Pune" },
  { lat: 18.6520, lng: 73.7740, name: "Nigdi Police Station", address: "Nigdi, Pune" },
  { lat: 18.6100, lng: 73.8300, name: "Bhosari Police Station", address: "Bhosari, Pune" },
  { lat: 18.6480, lng: 73.8020, name: "Akurdi Police Station", address: "Akurdi, Pune" },
  { lat: 18.5800, lng: 73.8600, name: "Dapodi Police Station", address: "Dapodi, Pune" },
];

// Haversine filter — only show stations within radiusMeters of center
function getStationsNear(lat, lng, radiusMeters = 50000) {
  const R = 6371000;
  return ALL_PUNE_POLICE_STATIONS.filter((ps) => {
    const dLat = ((ps.lat - lat) * Math.PI) / 180;
    const dLng = ((ps.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((ps.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) <= radiusMeters;
  });
}

function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function LocationPicker({ onLocationPick }) {
  useMapEvents({
    click(e) {
      if (onLocationPick) onLocationPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView({
  center,
  flaggedLocations = [],
  showPolice = true,
  pickLocation = false,
  onLocationPick = null,
  pickedLocation = null,
}) {
  const { t } = useLang();
  const mapCenter = center || [18.5204, 73.8567];
  const zoom = center ? 12 : 11;

  const policeStations = showPolice && center
    ? getStationsNear(center[0], center[1])
    : showPolice ? ALL_PUNE_POLICE_STATIONS : [];

  const getDirectionsUrl = (lat, lng, name) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;

  return (
    <div className="relative h-full w-full">
      <MapContainer center={mapCenter} zoom={zoom} className="h-full w-full rounded-lg">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={mapCenter} zoom={zoom} />
        {pickLocation && <LocationPicker onLocationPick={onLocationPick} />}

        {center && (
          <Marker position={center} icon={userIcon}>
            <Popup>{t("map.yourLocation")}</Popup>
          </Marker>
        )}
        {pickedLocation && (
          <Marker position={[pickedLocation.lat, pickedLocation.lng]} icon={userIcon}>
            <Popup>📍 Selected Location</Popup>
          </Marker>
        )}
        {flaggedLocations.map((loc, idx) => (
          <div key={idx}>
            <Marker position={[loc.lat, loc.lng]} icon={flaggedIcon}>
              <Popup>{t("map.flaggedZone")} — {loc.reportCount} reports</Popup>
            </Marker>
            <Circle
              center={[loc.lat, loc.lng]}
              radius={500}
              pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.15 }}
            />
          </div>
        ))}
        {policeStations.map((ps, idx) => (
          <Marker key={`ps-${idx}`} position={[ps.lat, ps.lng]} icon={policeIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-green-700 mb-1">🚔 {ps.name}</div>
                {ps.address && <div className="text-gray-600 text-xs mb-2">📍 {ps.address}</div>}
                <a
                  href={getDirectionsUrl(ps.lat, ps.lng, ps.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  🗺️ Get Directions
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
