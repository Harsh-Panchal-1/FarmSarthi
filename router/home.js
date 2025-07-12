const express = require("express");
const Product = require("../model/product");
const User = require("../model/user");
const isAuthenticated = require("../middleware/authCheck");
const router = express.Router();

router.get("/", async (req,res) =>{
    const response = await Product.find();
    const user = req.session.user ? true : false;
    res.render('Homepage', {data: response, isUserLoggedIn: user})
})
router.get("/market-prices", async (req,res) =>{
    const user = req.session.user ? true : false;
     const states = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
    'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
    'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
    'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
    'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
    'Uttarakhand','West Bengal'
  ];

    res.render('marketPrice', { states, isUserLoggedIn: user})
})
router.get("/dashboard", isAuthenticated, async (req,res) =>{
    const user = req.session.user ? true : false;
    const userData = req.session.user;

    res.render('sellerDashboard', { isUserLoggedIn: user, user: userData})
})
router.get("/list-product", isAuthenticated, async (req,res) =>{
    const user = req.session.user ? true : false;
    const userData = req.session.user;
    console.log(userData)

    res.render('listProduct', { isUserLoggedIn: user, user: userData})
})

router.get("/payment/:id",isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const response = await Product.findById(id).populate("sellerID");
  const user = req.session.user ? true : false;
  res.render("payment", { isUserLoggedIn: user, product: response });
});

module.exports = router;