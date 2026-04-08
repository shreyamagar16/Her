const SosAlert = require("../models/SosAlert");
const User = require("../models/User");

const PROXIMITY_DEGREES = 0.05; // ~5km for volunteer matching

const createSos = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({ message: "Location is required" });
    }

    const alert = await SosAlert.create({
      user: req.user._id,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      timeline: [{ action: "SOS alert created", performedBy: req.user._id }],
    });

    const user = await User.findById(req.user._id);
    const contacts = user.emergencyContacts || [];
    console.log(`[SOS] Alert from ${user.name} at (${lat}, ${lng})`);
    contacts.forEach((c) => {
      console.log(`  -> Notifying ${c.name} at ${c.phone}`);
    });

    res.status(201).json({ message: "SOS alert sent!", alertId: alert._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllSos = async (req, res) => {
  try {
    const alerts = await SosAlert.find()
      .populate("user", "name email phone")
      .populate("volunteerAssignment.volunteer", "name phone")
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getSosById = async (req, res) => {
  try {
    const alert = await SosAlert.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("volunteerAssignment.volunteer", "name phone volunteerLocation")
      .populate("timeline.performedBy", "name role");

    if (!alert) {
      return res.status(404).json({ message: "SOS alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMySosAlerts = async (req, res) => {
  try {
    const alerts = await SosAlert.find({ user: req.user._id })
      .populate("volunteerAssignment.volunteer", "name phone")
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const dispatchPolice = async (req, res) => {
  try {
    const { stationName, officerName, caseNumber, notes } = req.body;

    if (!stationName) {
      return res.status(400).json({ message: "Police station name is required" });
    }

    const alert = await SosAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "SOS alert not found" });
    }

    alert.policeIntervention = {
      stationName,
      officerName: officerName || "",
      caseNumber: caseNumber || "",
      notes: notes || "",
      dispatchedAt: new Date(),
      arrivedAt: null,
    };
    alert.status = "police_dispatched";
    alert.timeline.push({
      action: `Police dispatched from ${stationName}`,
      note: notes || "",
      performedBy: req.user._id,
    });

    await alert.save();

    res.json({ message: "Police dispatched", alert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const markPoliceArrived = async (req, res) => {
  try {
    const alert = await SosAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "SOS alert not found" });
    }

    alert.policeIntervention.arrivedAt = new Date();
    alert.status = "police_arrived";
    alert.timeline.push({
      action: "Police arrived on scene",
      performedBy: req.user._id,
    });

    await alert.save();

    res.json({ message: "Police arrival confirmed", alert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getNearbyVolunteers = async (req, res) => {
  try {
    const alert = await SosAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "SOS alert not found" });
    }

    const { lat, lng } = alert.location;

    const volunteers = await User.find({
      isVolunteer: true,
      "volunteerLocation.lat": {
        $gte: lat - PROXIMITY_DEGREES,
        $lte: lat + PROXIMITY_DEGREES,
      },
      "volunteerLocation.lng": {
        $gte: lng - PROXIMITY_DEGREES,
        $lte: lng + PROXIMITY_DEGREES,
      },
      _id: { $ne: alert.user },
    }).select("name phone volunteerLocation");

    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const alertVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    if (!volunteerId) {
      return res.status(400).json({ message: "Volunteer ID is required" });
    }

    const alert = await SosAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "SOS alert not found" });
    }

    const volunteer = await User.findById(volunteerId);
    if (!volunteer || !volunteer.isVolunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    alert.volunteerAssignment = {
      volunteer: volunteerId,
      status: "alerted",
      alertedAt: new Date(),
      acceptedAt: null,
    };
    alert.timeline.push({
      action: `Volunteer ${volunteer.name} alerted`,
      performedBy: req.user._id,
    });

    await alert.save();

    res.json({ message: `Volunteer ${volunteer.name} has been alerted`, alert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const respondToVolunteerAlert = async (req, res) => {
  try {
    const { response } = req.body;
    if (!["accepted", "declined"].includes(response)) {
      return res.status(400).json({ message: "Response must be 'accepted' or 'declined'" });
    }

    const alert = await SosAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "SOS alert not found" });
    }

    if (alert.volunteerAssignment.volunteer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the assigned volunteer" });
    }

    alert.volunteerAssignment.status = response;
    if (response === "accepted") {
      alert.volunteerAssignment.acceptedAt = new Date();
      alert.status = "volunteer_dispatched";
    }

    alert.timeline.push({
      action: `Volunteer ${response} the alert`,
      performedBy: req.user._id,
    });

    await alert.save();

    res.json({ message: `Alert ${response}`, alert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyVolunteerAlerts = async (req, res) => {
  try {
    const alerts = await SosAlert.find({
      "volunteerAssignment.volunteer": req.user._id,
    })
      .populate("user", "name phone")
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const resolveSos = async (req, res) => {
  try {
    const { resolutionNote } = req.body;

    const alert = await SosAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "SOS alert not found" });
    }

    alert.status = "resolved";
    alert.timeline.push({
      action: "SOS alert resolved",
      note: resolutionNote || "",
      performedBy: req.user._id,
    });

    await alert.save();

    res.json({ message: "SOS alert resolved", alert });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
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
};
