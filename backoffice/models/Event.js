const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  patrimony_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  }
});

module.exports = mongoose.model("Event", EventSchema);
