import SosButton from "../components/SosButton";
import { useLang } from "../services/LangContext";

export default function SosPage() {
  const { t } = useLang();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{t("sos.title")}</h2>
      <p className="text-gray-600 mb-10 text-center max-w-md">{t("sos.subtitle")}</p>
      <SosButton />
    </div>
  );
}
