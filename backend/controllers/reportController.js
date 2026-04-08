const Report = require("../models/Report");
const FlaggedLocation = require("../models/FlaggedLocation");
const { encrypt, decrypt } = require("../config/encryption");

const FLAG_THRESHOLD = 3;
const PROXIMITY_DEGREES = 0.005;

const createReport = async (req, res) => {
  try {
    const { description, abuseType, lat, lng, address } = req.body;

    if (!description || !abuseType || lat == null || lng == null) {
      return res.status(400).json({ message: "Description, abuse type, and location are required" });
    }

    const encryptedDescription = encrypt(description);

    const report = await Report.create({
      description: encryptedDescription,
      abuseType,
      location: { lat: parseFloat(lat), lng: parseFloat(lng), address: address || "" },
      mediaUrl: req.file ? `/uploads/${req.file.filename}` : "",
      isAnonymous: true,
      submittedBy: req.user._id,
    });

    await checkAndFlagLocation(parseFloat(lat), parseFloat(lng), report._id);

    res.status(201).json({ message: "Report submitted successfully", reportId: report._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function checkAndFlagLocation(lat, lng, reportId) {
  const nearbyReports = await Report.find({
    "location.lat": { $gte: lat - PROXIMITY_DEGREES, $lte: lat + PROXIMITY_DEGREES },
    "location.lng": { $gte: lng - PROXIMITY_DEGREES, $lte: lng + PROXIMITY_DEGREES },
  });

  if (nearbyReports.length >= FLAG_THRESHOLD) {
    let flagged = await FlaggedLocation.findOne({
      lat: { $gte: lat - PROXIMITY_DEGREES, $lte: lat + PROXIMITY_DEGREES },
      lng: { $gte: lng - PROXIMITY_DEGREES, $lte: lng + PROXIMITY_DEGREES },
    });

    if (!flagged) {
      flagged = await FlaggedLocation.create({
        lat,
        lng,
        reportCount: nearbyReports.length,
        reports: nearbyReports.map((r) => r._id),
      });
    } else {
      flagged.reportCount = nearbyReports.length;
      if (!flagged.reports.includes(reportId)) {
        flagged.reports.push(reportId);
      }
      await flagged.save();
    }
  }
}

const getAllReports = async (req, res) => {
  try {
    const { status, abuseType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (abuseType) filter.abuseType = abuseType;

    const reports = await Report.find(filter).sort({ createdAt: -1 });

    const decryptedReports = reports.map((r) => {
      const obj = r.toObject();
      try {
        obj.description = decrypt(obj.description);
      } catch {
        // return as-is
      }
      return obj;
    });

    res.json(decryptedReports);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("submittedBy", "name email phone");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const isNgo = req.user.role === "ngo";
    const isOwner = report.submittedBy?._id?.toString() === req.user._id.toString();

    if (!isNgo && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    const obj = report.toObject();
    try {
      obj.description = decrypt(obj.description);
    } catch {
      // return as-is
    }

    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });

    const decryptedReports = reports.map((r) => {
      const obj = r.toObject();
      try {
        obj.description = decrypt(obj.description);
      } catch {
        // return as-is
      }
      return obj;
    });

    res.json(decryptedReports);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["pending", "in_progress", "visit_scheduled", "visited", "reviewed", "resolved"];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Status updated", report });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const scheduleVisit = async (req, res) => {
  try {
    const { visitDate } = req.body;
    if (!visitDate) {
      return res.status(400).json({ message: "Visit date is required" });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { visitDate: new Date(visitDate), status: "visit_scheduled", hasUnreadForUser: true },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Visit scheduled", report });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const submitVisitStudy = async (req, res) => {
  try {
    const { summary, findings, recommendation } = req.body;

    if (!summary || !findings) {
      return res.status(400).json({ message: "Summary and findings are required" });
    }

    const update = {
      visitStudy: {
        summary,
        findings,
        recommendation: recommendation || "",
        mediaUrl: req.file ? `/uploads/${req.file.filename}` : "",
        completedAt: new Date(),
      },
      status: "reviewed",
      hasUnreadForUser: true,
    };

    const report = await Report.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Visit study submitted", report });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateAbuserDetails = async (req, res) => {
  try {
    const { name, relation, description } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const isOwner = report.submittedBy?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "ngo") {
      return res.status(403).json({ message: "Access denied" });
    }

    report.abuserDetails = {
      name: name || report.abuserDetails?.name || "",
      relation: relation || report.abuserDetails?.relation || "",
      description: description || report.abuserDetails?.description || "",
    };
    await report.save();

    res.json({ message: "Abuser details updated", report });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  getMyReports,
  updateReportStatus,
  scheduleVisit,
  submitVisitStudy,
  updateAbuserDetails,
};
