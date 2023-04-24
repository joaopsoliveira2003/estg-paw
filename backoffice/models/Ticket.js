const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  visible: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Ticket", TicketSchema);

