const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gallery: { type: Array },
  description: { type: String },
  tag: [{ type: String, enum: ["Trending", "A Grade", "B Grade", "C Grade"] }],
  price: { type: Number, required: true },
  discount: { type: Number },
  sellerID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required:true },
  category: { type: String, enum: ["Crop", "Seed" ,"Fruit"], required:true }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
