const express = require("express");
const router = express.Router();
const { toggleVolunteer, getVolunteerProfile } = require("../controllers/volunteerController");
const { protect } = require("../middleware/auth");

router.get("/profile", protect, getVolunteerProfile);
router.patch("/toggle", protect, toggleVolunteer);

module.exports = router;
