const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nif: {
    type: Number,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  acquisitions: {
    type: Number,
    default: 0
  },
  admin: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model("User", UserSchema);
