require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const session = require('express-session');

const fs = require('fs');
const tipsFile = path.join(__dirname, 'farming_tips.json');
const readTips = () => JSON.parse(fs.readFileSync(tipsFile));


const authRoute = require("./router/auth");
const productRoute = require("./router/product");
const homeRoute = require("./router/home");

const app = express();
const port = 3000;

mongoose
  .connect( process.env.MONGO_URL , {
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


app.use(
  session({
    secret: "farmsarthi_secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


app.use("/", homeRoute);
app.use("/login", authRoute);
app.use("/product", productRoute);


app.get("/aboutUs", (req, res) => {
    res.render("Homepage.ejs");
});

app.get("/buy-crop", (req, res) => {
    res.render("buyCrop.ejs");
});

app.get("/sell-crop", (req, res) => {
    res.render("sellCrop.ejs");
});

app.get("/crop-calendar", (req, res) => {
    res.render("cropCalender.ejs");
});

app.get("/login-page", (req, res) => {
    res.render("loginPage.ejs");
});

app.get('/profile', (req, res) => {
  // render user profile page
  res.render('profile', { user: req.user });
});



app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get("/successStories", (req, res) => {
  const isUserLoggedIn = req.session.user ? true : false;
  res.render("successStories", { isUserLoggedIn });
});

app.get("/marketInsights", (req, res) => {
  const isUserLoggedIn = req.session.user ? true : false;
  res.render("marketInsights", { isUserLoggedIn });
});

app.get("/harvest", (req, res) => {
  const isUserLoggedIn = req.session.user ? true : false;
  res.render("harvest", { isUserLoggedIn });
});

app.get("/trends", (req, res) => {
  const isUserLoggedIn = req.session.user ? true : false;
  res.render("trends", { isUserLoggedIn });
});
app.get("/aboutus", (req, res) => {
  const isUserLoggedIn = req.session.user ? true : false;
  res.render("aboutUs", { isUserLoggedIn });
});

app.get('/tips', async (req, res) => {
  const tips = await readTips();
  const page = parseInt(req.query.page) || 1;
  const perPage = 10;

  const start = (page - 1) * perPage;
  const end = page * perPage;

  const paginatedTips = tips.slice(start, end);
  const totalPages = Math.ceil(tips.length / perPage);

  const isUserLoggedIn = req.session.user ? true : false;

  res.render('tips', {isUserLoggedIn,
    farming_tips: paginatedTips,
    currentPage: page,
    totalPages: totalPages
  });
});


app.get("/seller-detail", (req, res) => {
    // Example products and sellerName; you can fetch from DB instead
    const sellerName = "OrganicFarm";
    const products = [
        { name: "Wheat", price: 2250, test: "Moisture: 12%, Purity: 98%" },
        { name: "Barley", price: 1950, test: "Moisture: 13%, Purity: 96%" },
        { name: "Millet", price: 2100, test: "Moisture: 11%, Purity: 97%" },
    ];

    res.render("sellerDetail.ejs", { sellerName, products });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});