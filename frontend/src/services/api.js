import axios from "axios";

const API = axios.create({
  baseURL: "https://her-backend-jofx.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// Reports
export const submitReport = (formData) =>
  API.post("/reports", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getReports = (params) => API.get("/reports", { params });
export const getReportById = (id) => API.get(`/reports/${id}`);
export const getMyReports = () => API.get("/reports/mine");
export const updateReportStatus = (id, status) =>
  API.patch(`/reports/${id}/status`, { status });
export const scheduleVisit = (id, visitDate) =>
  API.patch(`/reports/${id}/schedule-visit`, { visitDate });
export const submitVisitStudy = (id, formData) =>
  API.patch(`/reports/${id}/visit-study`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateAbuserDetails = (id, details) =>
  API.patch(`/reports/${id}/abuser-details`, details);

// Messages
export const getMessages = (reportId) => API.get(`/messages/${reportId}`);
export const sendMessage = (reportId, content, type) =>
  API.post(`/messages/${reportId}`, { content, type });

// SOS
export const sendSos = (data) => API.post("/sos", data);
export const getSosAlerts = () => API.get("/sos");
export const getSosById = (id) => API.get(`/sos/${id}`);
export const getMySosAlerts = () => API.get("/sos/mine");
export const dispatchPolice = (id, data) => API.patch(`/sos/${id}/dispatch-police`, data);
export const markPoliceArrived = (id) => API.patch(`/sos/${id}/police-arrived`);
export const getNearbyVolunteers = (id) => API.get(`/sos/${id}/nearby-volunteers`);
export const alertVolunteer = (id, volunteerId) =>
  API.patch(`/sos/${id}/alert-volunteer`, { volunteerId });
export const respondToVolunteerAlert = (id, response) =>
  API.patch(`/sos/${id}/volunteer-respond`, { response });
export const getMyVolunteerAlerts = () => API.get("/sos/volunteer-alerts");
export const resolveSos = (id, resolutionNote) =>
  API.patch(`/sos/${id}/resolve`, { resolutionNote });

// Volunteer
export const getVolunteerProfile = () => API.get("/volunteer/profile");
export const toggleVolunteer = (data) => API.patch("/volunteer/toggle", data);

// Flagged Locations
export const getFlaggedLocations = () => API.get("/flagged");

export default API;
