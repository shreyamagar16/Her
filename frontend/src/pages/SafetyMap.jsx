import { useState, useEffect, useRef } from "react";
import MapView from "../components/MapView";
import { getFlaggedLocations } from "../services/api";
import { useLang } from "../services/LangContext";

// Geocode a search query using Nominatim (free OpenStreetMap geocoder)
async function geocodeSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  return res.json();
}

export default function SafetyMap() {
  const { t } = useLang();
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [flagged, setFlagged] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setMapCenter(loc);
      },
      () => {
        const fallback = [18.5204, 73.8567];
        setUserLocation(fallback);
        setMapCenter(fallback);
      }
    );
    getFlaggedLocations().then((res) => setFlagged(res.data)).catch(() => {});
  }, []);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await geocodeSearch(val);
        setSuggestions(results);
      } catch { setSuggestions([]); }
    }, 400);
  };

  const handleSelectSuggestion = (result) => {
    setSearchQuery(result.display_name.split(",").slice(0, 2).join(","));
    setSuggestions([]);
    setMapCenter([parseFloat(result.lat), parseFloat(result.lon)]);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    setSuggestions([]);
    try {
      const results = await geocodeSearch(searchQuery);
      if (results.length === 0) setSearchError("No results found. Try a different area name.");
      else setMapCenter([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
    } catch { setSearchError("Search failed. Please try again."); }
    finally { setSearching(false); }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h2 className="text-xl sm:text-2xl font-bold text-[#3b0764] mb-4">{t("map.title")}</h2>

      {/* Search bar */}
      <div className="mb-4 relative">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              placeholder="Search area or landmark… (e.g. Katraj, Baner, Viman Nagar)"
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSuggestions([]); setSearchError(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-[#3b0764] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-900 transition disabled:opacity-60 flex items-center gap-1.5 flex-shrink-0"
          >
            {searching
              ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
              : "🔍"
            }
            <span className="hidden sm:inline">Search</span>
          </button>
          <button
            type="button"
            onClick={() => userLocation && setMapCenter([...userLocation])}
            title="Back to my location"
            className="bg-blue-500 text-white px-3 py-2.5 rounded-lg text-sm hover:bg-blue-600 transition flex-shrink-0"
          >
            📍
          </button>
        </form>

        {/* Autocomplete dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute z-[1001] top-full left-0 right-16 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 border-b border-gray-100 last:border-0 truncate"
                >
                  📍 {s.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}

        {searchError && <p className="mt-1 text-xs text-red-500">{searchError}</p>}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-500 rounded-full inline-block flex-shrink-0" />
          {t("map.yourLocation")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-red-500 rounded-full inline-block flex-shrink-0" />
          {t("map.flaggedZone")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-green-500 rounded-full inline-block flex-shrink-0" />
          {t("map.policeStation")}
        </span>
      </div>

      {/* Map */}
      <div className="h-[60vh] min-h-[320px] max-h-[600px] rounded-xl overflow-hidden shadow-lg">
        {mapCenter ? (
          <MapView center={mapCenter} flaggedLocations={flagged} showPolice={true} />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm gap-2">
            <span className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full inline-block" />
            Getting your location…
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-2 text-right">
        Police station data © OpenStreetMap contributors
      </p>
    </div>
  );
}
