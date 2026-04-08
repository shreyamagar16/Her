const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "ngo"],
      default: "user",
    },
    emergencyContacts: [
      {
        name: String,
        phone: String,
      },
    ],
    isVolunteer: {
      type: Boolean,
      default: false,
    },
    volunteerLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      area: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
