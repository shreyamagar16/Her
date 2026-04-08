const Message = require("../models/Message");
const Report = require("../models/Report");

const getMessages = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const isNgo = req.user.role === "ngo";
    const isOwner = report.submittedBy?.toString() === req.user._id.toString();

    if (!isNgo && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Mark messages as read
    if (isNgo) {
      await Report.findByIdAndUpdate(reportId, { hasUnreadForNgo: false });
    } else {
      await Report.findByIdAndUpdate(reportId, { hasUnreadForUser: false });
    }

    const messages = await Message.find({ report: reportId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { content, type } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const isNgo = req.user.role === "ngo";
    const isOwner = report.submittedBy?.toString() === req.user._id.toString();

    if (!isNgo && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = await Message.create({
      report: reportId,
      sender: req.user._id,
      senderRole: req.user.role,
      content,
      type: type || (isNgo ? "question" : "answer"),
    });

    // Update report status and unread flags
    const update = {};
    if (isNgo) {
      update.hasUnreadForUser = true;
      if (report.status === "pending") {
        update.status = "in_progress";
      }
    } else {
      update.hasUnreadForNgo = true;
    }
    await Report.findByIdAndUpdate(reportId, update);

    const populated = await Message.findById(message._id).populate("sender", "name role");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMessages, sendMessage };
