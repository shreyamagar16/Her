const FlaggedLocation = require("../models/FlaggedLocation");

const getFlaggedLocations = async (req, res) => {
  try {
    const flagged = await FlaggedLocation.find().sort({ reportCount: -1 });
    res.json(flagged);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getFlaggedLocations };
