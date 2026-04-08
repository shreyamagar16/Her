const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ email: "admin@ngo.org" });
    if (existing) return;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    await User.create({
      name: "NGO Admin",
      email: "admin@ngo.org",
      password: hashedPassword,
      phone: "9999999999",
      role: "ngo",
    });

    console.log("NGO Admin seeded: admin@ngo.org / admin123");
  } catch (error) {
    console.error("Seed error:", error.message);
  }
};

module.exports = seedAdmin;
