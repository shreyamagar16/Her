const User = require("../models/User");

const toggleVolunteer = async (req, res) => {
  try {
    const { isVolunteer, lat, lng, area } = req.body;

    const update = { isVolunteer: !!isVolunteer };

    if (isVolunteer) {
      if (lat == null || lng == null) {
        return res.status(400).json({ message: "Location is required to register as volunteer" });
      }
      update.volunteerLocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        area: area || "",
      };
    } else {
      update.volunteerLocation = { lat: null, lng: null, area: "" };
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select("-password");

    res.json({
      message: isVolunteer ? "You are now a volunteer!" : "Volunteer status removed",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getVolunteerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name phone isVolunteer volunteerLocation");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { toggleVolunteer, getVolunteerProfile };
