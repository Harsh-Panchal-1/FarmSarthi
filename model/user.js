// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true},
  phone: { type: String, required: true},
  address: String,
  role: {type: String, enum: ["seller", "buyer" ], default: "buyer" },
});

const User = mongoose.model("User", userSchema);

module.exports = User;