const express = require("express");
const router = express.Router();
const { getFlaggedLocations } = require("../controllers/flaggedController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getFlaggedLocations);

module.exports = router;
