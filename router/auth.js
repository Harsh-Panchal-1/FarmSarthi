const express = require("express");
const User = require("../model/user");
const admin = require("../firebase");
const checkRoleSelection = require("../middleware/checkRole");
const router = express.Router();

router.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    const user = req.session.user ? true : false;
    res.render("login",{env:{
      API_KEY: process.env.API_KEY,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    }, isUserLoggedIn: user});
  }
});

router.post("/verify", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const phone = decoded.phone_number;

    let user = await User.findOne({ uid });

    if (!user) {
      // User is logging in for the first time
      req.session.user = { uid, phone, role: null };
      return res.redirect("/login/select-role");
    }

    // Existing user
    req.session.user = {
      uid: user.uid,
      phone: user.phone,
      role: user.role,
      name: user.name,
      address: user.address
    };

    res.redirect("/");
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).send("Unauthorized");
  }
});


router.get("/select-role",checkRoleSelection, (req, res) => {
  if (!req.session.user) return res.redirect("/");
  const user = req.session.user ? true : false;
  res.render("selectRole", {isUserLoggedIn: user});
});

// routes/auth.js
router.post("/select-role", async (req, res) => {
  const { role, name, address } = req.body;
  if (!req.session.user) return res.redirect("/");

  // Save in DB
  const { uid, phone } = req.session.user;
  const user = req.session.user
    req.session.user = {
      ...user,
      name: name,
      address: address,
    };
  await User.create({ uid, phone, role, name, address });

  req.session.user.role = role;
  res.redirect("/");
});

module.exports = router;