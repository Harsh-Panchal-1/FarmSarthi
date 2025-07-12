// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true},
  phone: { type: String, required: true},
  address: {type:String},
  role: {type: String, enum: ["seller", "buyer" ], default: "buyer" },
  products: [{
    productName: String,
    quality: {type: String, enum: ["A Grade", "B Grade", "C Grade" ], default: "buyer" },

  }]
});



const User = mongoose.model("User", userSchema);

module.exports = User;