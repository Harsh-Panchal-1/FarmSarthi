const express = require("express")
const router = express.Router();

router.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    res.render("login",{env:{
      API_KEY: process.env.API_KEY,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    }});
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
      return res.redirect("/select-role");
    }

    // Existing user
    req.session.user = {
      uid: user.uid,
      phone: user.phone,
      role: user.role,
    };

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).send("Unauthorized");
  }
});


router.get("/select-role", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.render("selectRole");
});

// routes/auth.js
router.post("/select-role", async (req, res) => {
  const { role } = req.body;
  if (!req.session.user) return res.redirect("/");

  // Save in DB
  const { uid, phone } = req.session.user;
  await User.create({ uid, phone, role });

  req.session.user.role = role;
  res.redirect("/dashboard");
});

module.exports = router;