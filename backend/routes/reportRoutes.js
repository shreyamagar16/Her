const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createReport,
  getAllReports,
  getReportById,
  getMyReports,
  updateReportStatus,
  scheduleVisit,
  submitVisitStudy,
  updateAbuserDetails,
} = require("../controllers/reportController");
const { protect, ngoOnly } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|webm|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) return cb(null, true);
    cb(new Error("Only image/video/pdf files are allowed"));
  },
});

router.post("/", protect, upload.single("media"), createReport);
router.get("/", protect, ngoOnly, getAllReports);
router.get("/mine", protect, getMyReports);
router.get("/:id", protect, getReportById);
router.patch("/:id/status", protect, ngoOnly, updateReportStatus);
router.patch("/:id/schedule-visit", protect, ngoOnly, scheduleVisit);
router.patch("/:id/visit-study", protect, ngoOnly, upload.single("media"), submitVisitStudy);
router.patch("/:id/abuser-details", protect, updateAbuserDetails);

module.exports = router;
