const mongoose = require("mongoose");

const PatrimonySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  files: {
    type: Array,
    required: true,
  }
});

module.exports = mongoose.model("Patrimony", PatrimonySchema);