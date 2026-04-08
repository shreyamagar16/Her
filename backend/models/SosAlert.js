const mongoose = require("mongoose");

const timelineEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const sosAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["active", "police_dispatched", "police_arrived", "volunteer_dispatched", "resolved"],
      default: "active",
    },
    policeIntervention: {
      stationName: { type: String, default: "" },
      officerName: { type: String, default: "" },
      caseNumber: { type: String, default: "" },
      notes: { type: String, default: "" },
      dispatchedAt: { type: Date, default: null },
      arrivedAt: { type: Date, default: null },
    },
    volunteerAssignment: {
      volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      status: {
        type: String,
        enum: ["none", "alerted", "accepted", "declined", "on_site"],
        default: "none",
      },
      alertedAt: { type: Date, default: null },
      acceptedAt: { type: Date, default: null },
    },
    timeline: [timelineEntrySchema],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SosAlert", sosAlertSchema);
