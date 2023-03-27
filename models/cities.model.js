const mongoose = require("mongoose");

const citySchema = mongoose.Schema({
  prefferedCity: { type: String, required: true },
  userId: { type: String },
});

const cityModel = mongoose.model("citie", citySchema);

module.exports = { cityModel };
