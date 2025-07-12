const express = require("express");
const Product = require("../../model/product.js");
const User = require("../../model/user.js");
const router = express.Router();

router.get("/",async (req,res)=>{
    const response = await Product.find().populate("sellerID");
    res.json(response);
})
router.get("/:id",async (req,res)=>{
    const { id } = req.params;
    const response = await Product.findById(id).populate("sellerID")
    res.json(response);
})

module.exports = router;