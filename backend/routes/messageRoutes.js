const express = require("express");
const router = express.Router();
const { getMessages, sendMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

router.get("/:reportId", protect, getMessages);
router.post("/:reportId", protect, sendMessage);

module.exports = router;
