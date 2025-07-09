// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  phone: String,
  role: {type: String, enum: ["seller", "buyer" ], default: "buyer" },
});

const User = mongoose.model("User", userSchema);

module.exports = User;