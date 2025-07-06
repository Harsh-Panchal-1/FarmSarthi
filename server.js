require("dotenv").config();
const express = require("express");
const path = require("path");
const {
    ClerkExpressRequireAuth,
    ClerkExpressWithAuth,
    users
} = require("@clerk/clerk-sdk-node");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Clerk middleware
app.use(ClerkExpressWithAuth());

// Public Landing Page
app.get("/", (req, res) => {
    res.render("index");
});

// Role Selection Form
app.get("/login", (req, res) => {
    res.render("select-role");
});

// Handle Role Selection and Redirect to Clerk
app.post("/login", (req, res) => {
    const { role } = req.body;
    const redirectUrl = `https://${process.env.CLERK_DOMAIN}/sign-in?redirect_url=http://localhost:${port}/dashboard&__metadata_role=${role}`;
    res.redirect(redirectUrl);
});

// Protected Dashboard
app.get("/dashboard", ClerkExpressRequireAuth(), async (req, res) => {
    const user = await users.getUser(req.auth.userId);

  // Save role to metadata if not saved already
if (!user.privateMetadata?.role && req.query.__metadata_role) {
    await users.updateUserMetadata(req.auth.userId, {
        privateMetadata: { role: req.query.__metadata_role }
    });
}

const role = user.privateMetadata?.role || req.query.__metadata_role || "unknown";

    res.render("dashboard", { userId: user.id, role });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});