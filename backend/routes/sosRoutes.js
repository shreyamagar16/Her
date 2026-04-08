const express = require("express");
const router = express.Router();
const {
  createSos,
  getAllSos,
  getSosById,
  getMySosAlerts,
  dispatchPolice,
  markPoliceArrived,
  getNearbyVolunteers,
  alertVolunteer,
  respondToVolunteerAlert,
  getMyVolunteerAlerts,
  resolveSos,
} = require("../controllers/sosController");
const { protect, ngoOnly } = require("../middleware/auth");

router.post("/", protect, createSos);
router.get("/", protect, ngoOnly, getAllSos);
router.get("/mine", protect, getMySosAlerts);
router.get("/volunteer-alerts", protect, getMyVolunteerAlerts);
router.get("/:id", protect, getSosById);
router.patch("/:id/dispatch-police", protect, ngoOnly, dispatchPolice);
router.patch("/:id/police-arrived", protect, ngoOnly, markPoliceArrived);
router.get("/:id/nearby-volunteers", protect, ngoOnly, getNearbyVolunteers);
router.patch("/:id/alert-volunteer", protect, ngoOnly, alertVolunteer);
router.patch("/:id/volunteer-respond", protect, respondToVolunteerAlert);
router.patch("/:id/resolve", protect, ngoOnly, resolveSos);

module.exports = router;
