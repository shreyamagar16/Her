const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "ngo"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["question", "answer", "note"],
      default: "question",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
