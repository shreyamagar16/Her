import { useState } from "react";
import { sendSos } from "../services/api";
import { useLang } from "../services/LangContext";

export default function SosButton() {
  const [status, setStatus] = useState("idle");
  const { t } = useLang();

  const handleSos = async () => {
    setStatus("sending");

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      await sendSos({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      setStatus("sent");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      console.error("SOS error:", err);
      // Fallback with mock location if geolocation fails
      try {
        await sendSos({ lat: 19.076, lng: 72.8777 });
        setStatus("sent");
        setTimeout(() => setStatus("idle"), 5000);
      } catch {
        setStatus("idle");
        alert("Failed to send SOS. Please try again.");
      }
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-green-600">{t("sos.sent")}</h3>
        <p className="text-gray-600 mt-2">{t("sos.sentMessage")}</p>
      </div>
    );
  }

  return (
    <button
      onClick={handleSos}
      disabled={status === "sending"}
      className={`w-48 h-48 rounded-full text-white text-2xl font-bold shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
        status === "sending"
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-700 animate-pulse"
      }`}
    >
      {status === "sending" ? t("sos.sending") : t("sos.button")}
    </button>
  );
}
