const mongoose = require("mongoose");

const UserTicketSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  ticket_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("UserTicket", UserTicketSchema);
