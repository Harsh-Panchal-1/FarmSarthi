const express = require("express");
const Product = require("../model/product.js");
const User = require("../model/user.js");
const router = express.Router();

router.get("/:id",async (req,res)=>{
    const { id } = req.params;
    const response = await Product.findById(id).populate("sellerID")
    const user = req.session.user ? true : false;
    res.render("productDetail", {data: response, isUserLoggedIn: user});
})

module.exports = router;