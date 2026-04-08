const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    abuseType: {
      type: String,
      required: true,
      enum: ["physical", "verbal", "sexual", "domestic", "cyber", "stalking", "other"],
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: "" },
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "visit_scheduled", "visited", "reviewed", "resolved"],
      default: "pending",
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    abuserDetails: {
      name: { type: String, default: "" },
      relation: { type: String, default: "" },
      description: { type: String, default: "" },
    },
    visitDate: {
      type: Date,
      default: null,
    },
    visitStudy: {
      summary: { type: String, default: "" },
      findings: { type: String, default: "" },
      recommendation: { type: String, default: "" },
      mediaUrl: { type: String, default: "" },
      completedAt: { type: Date, default: null },
    },
    hasUnreadForUser: {
      type: Boolean,
      default: false,
    },
    hasUnreadForNgo: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
