import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getReportById,
  getMessages,
  sendMessage,
  updateReportStatus,
  scheduleVisit,
  submitVisitStudy,
} from "../services/api";
import { useAuth } from "../services/AuthContext";

const STATUS_LABELS = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  visit_scheduled: { label: "Visit Scheduled", color: "bg-indigo-100 text-indigo-800" },
  visited: { label: "Visited", color: "bg-purple-100 text-purple-800" },
  reviewed: { label: "Reviewed", color: "bg-teal-100 text-teal-800" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
};

const QUICK_QUESTIONS = [
  "Can you share the full address where the incident occurred?",
  "When would you prefer the NGO team to visit?",
  "Can you share the abuser's name?",
  "What is your relation with the abuser?",
  "Can you describe the abuser's appearance?",
  "How long has this been happening?",
  "Are there any witnesses?",
  "Do you feel you are in immediate danger right now?",
];

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const isNgo = user?.role === "ngo";

  const [report, setReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeSection, setActiveSection] = useState("conversation");

  // Visit scheduling
  const [visitDate, setVisitDate] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Visit study
  const [study, setStudy] = useState({ summary: "", findings: "", recommendation: "" });
  const [studyMedia, setStudyMedia] = useState(null);
  const [submittingStudy, setSubmittingStudy] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportRes, msgRes] = await Promise.all([
        getReportById(id),
        getMessages(id),
      ]);
      setReport(reportRes.data);
      setMessages(msgRes.data);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content) => {
    if (!content?.trim()) return;
    setSending(true);
    try {
      const type = isNgo ? "question" : "answer";
      const res = await sendMessage(id, content.trim(), type);
      setMessages((prev) => [...prev, res.data]);
      setNewMsg("");
      if (report.status === "pending") {
        setReport((prev) => ({ ...prev, status: "in_progress" }));
      }
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleScheduleVisit = async () => {
    if (!visitDate) return;
    setScheduling(true);
    try {
      const res = await scheduleVisit(id, visitDate);
      setReport((prev) => ({ ...prev, ...res.data.report, status: "visit_scheduled", visitDate }));
      await handleSendMessage(`Visit has been scheduled for ${new Date(visitDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`);
    } catch (err) {
      console.error("Schedule error:", err);
    } finally {
      setScheduling(false);
    }
  };

  const handleSubmitStudy = async (e) => {
    e.preventDefault();
    if (!study.summary || !study.findings) return;
    setSubmittingStudy(true);
    try {
      const formData = new FormData();
      formData.append("summary", study.summary);
      formData.append("findings", study.findings);
      formData.append("recommendation", study.recommendation);
      if (studyMedia) formData.append("media", studyMedia);

      await submitVisitStudy(id, formData);
      setReport((prev) => ({
        ...prev,
        status: "reviewed",
        visitStudy: { ...study, completedAt: new Date() },
      }));
      await handleSendMessage("Visit study has been completed and uploaded. The report is now marked as Reviewed.");
    } catch (err) {
      console.error("Study submit error:", err);
    } finally {
      setSubmittingStudy(false);
    }
  };

  const handleMarkResolved = async () => {
    try {
      await updateReportStatus(id, "resolved");
      setReport((prev) => ({ ...prev, status: "resolved" }));
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-20 text-gray-500">Report not found</div>;
  }

  const st = STATUS_LABELS[report.status] || STATUS_LABELS.pending;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Back button */}
      <button
        onClick={() => navigate(isNgo ? "/dashboard" : "/my-reports")}
        className="text-purple-700 hover:text-purple-900 text-sm font-medium mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      {/* Report Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Report #{report._id.slice(-6).toUpperCase()}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                {report.abuseType}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                {st.label}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(report.createdAt).toLocaleString()}
          </span>
        </div>

        <p className="text-gray-700 mb-4">{report.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium text-gray-700">Location:</span>{" "}
            {report.location?.address || `${report.location?.lat?.toFixed(4)}, ${report.location?.lng?.toFixed(4)}`}
          </div>
          {report.visitDate && (
            <div>
              <span className="font-medium text-gray-700">Visit Date:</span>{" "}
              {new Date(report.visitDate).toLocaleDateString("en-IN", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </div>
          )}
          {report.abuserDetails?.name && (
            <div>
              <span className="font-medium text-gray-700">Abuser:</span>{" "}
              {report.abuserDetails.name}
              {report.abuserDetails.relation && ` (${report.abuserDetails.relation})`}
            </div>
          )}
          {report.abuserDetails?.description && (
            <div>
              <span className="font-medium text-gray-700">Abuser Description:</span>{" "}
              {report.abuserDetails.description}
            </div>
          )}
        </div>

        {/* Visit Study Summary (if completed) */}
        {report.visitStudy?.summary && (
          <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
            <h4 className="font-semibold text-teal-800 mb-2">Visit Study Report</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><span className="font-medium">Summary:</span> {report.visitStudy.summary}</p>
              <p><span className="font-medium">Findings:</span> {report.visitStudy.findings}</p>
              {report.visitStudy.recommendation && (
                <p><span className="font-medium">Recommendation:</span> {report.visitStudy.recommendation}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* NGO Actions tabs */}
      {isNgo && (
        <div className="flex gap-2 mb-4">
          {["conversation", "schedule", "visitStudy"].map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeSection === sec
                  ? "bg-purple-700 text-white"
                  : "bg-white text-gray-700 hover:bg-purple-50 border"
              }`}
            >
              {sec === "conversation" && "Conversation"}
              {sec === "schedule" && "Schedule Visit"}
              {sec === "visitStudy" && "Visit Study"}
            </button>
          ))}

          {report.status !== "resolved" && (
            <button
              onClick={handleMarkResolved}
              className="ml-auto bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Mark Resolved
            </button>
          )}
        </div>
      )}

      {/* Conversation Section */}
      {(activeSection === "conversation" || !isNgo) && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-purple-50 px-6 py-3 border-b">
            <h3 className="font-semibold text-gray-800">
              {isNgo ? "Conversation with Reporter" : "Messages from NGO"}
            </h3>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                {isNgo
                  ? "Start by asking questions about this report"
                  : "No messages yet. The NGO will contact you here."}
              </p>
            ) : (
              messages.map((msg) => {
                const isMine =
                  (isNgo && msg.senderRole === "ngo") ||
                  (!isNgo && msg.senderRole === "user");
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMine
                          ? "bg-purple-600 text-white rounded-br-md"
                          : "bg-white text-gray-800 border rounded-bl-md shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${isMine ? "text-purple-200" : "text-gray-500"}`}>
                          {msg.senderRole === "ngo" ? "NGO Admin" : "Reporter"}
                        </span>
                        <span className={`text-xs ${isMine ? "text-purple-300" : "text-gray-400"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions for NGO */}
          {isNgo && (
            <div className="px-4 py-2 bg-purple-50 border-t">
              <p className="text-xs text-gray-500 mb-1.5">Quick questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    disabled={sending}
                    className="text-xs bg-white border border-purple-200 text-purple-700 px-2.5 py-1 rounded-full hover:bg-purple-100 transition disabled:opacity-50"
                  >
                    {q.length > 40 ? q.slice(0, 40) + "..." : q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message input */}
          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage(newMsg)}
              placeholder={isNgo ? "Ask a question..." : "Type your reply..."}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
            <button
              onClick={() => handleSendMessage(newMsg)}
              disabled={sending || !newMsg.trim()}
              className="bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-800 transition disabled:bg-gray-300"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {/* Schedule Visit Section (NGO only) */}
      {isNgo && activeSection === "schedule" && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Schedule a Visit</h3>

          {report.visitDate && (
            <div className="bg-indigo-50 text-indigo-800 p-3 rounded-lg mb-4 text-sm">
              Current scheduled date:{" "}
              <strong>
                {new Date(report.visitDate).toLocaleDateString("en-IN", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </strong>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Visit Date
              </label>
              <input
                type="date"
                value={visitDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <button
              onClick={handleScheduleVisit}
              disabled={scheduling || !visitDate}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-gray-300"
            >
              {scheduling ? "Scheduling..." : report.visitDate ? "Reschedule" : "Schedule"}
            </button>
          </div>
        </div>
      )}

      {/* Visit Study Section (NGO only) */}
      {isNgo && activeSection === "visitStudy" && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Submit Visit Study</h3>

          {report.visitStudy?.completedAt ? (
            <div className="bg-teal-50 text-teal-800 p-4 rounded-lg text-sm">
              Visit study was already submitted on{" "}
              <strong>{new Date(report.visitStudy.completedAt).toLocaleDateString()}</strong>.
            </div>
          ) : (
            <form onSubmit={handleSubmitStudy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  value={study.summary}
                  onChange={(e) => setStudy({ ...study, summary: e.target.value })}
                  placeholder="Brief summary of the visit..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Findings *
                </label>
                <textarea
                  required
                  rows={4}
                  value={study.findings}
                  onChange={(e) => setStudy({ ...study, findings: e.target.value })}
                  placeholder="Detailed findings from the visit..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommendation
                </label>
                <textarea
                  rows={2}
                  value={study.recommendation}
                  onChange={(e) => setStudy({ ...study, recommendation: e.target.value })}
                  placeholder="Recommended next steps..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Document (optional)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*,.pdf"
                  onChange={(e) => setStudyMedia(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>

              <button
                type="submit"
                disabled={submittingStudy}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition disabled:bg-gray-300"
              >
                {submittingStudy ? "Submitting..." : "Submit Visit Study & Mark Reviewed"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
