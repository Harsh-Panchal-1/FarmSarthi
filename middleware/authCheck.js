// middleware/authMiddleware.js
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    // User is authenticated
    next();
  } else {
    // User is not authenticated
    res.redirect('/login'); // or send a 401 response: res.status(401).send("Unauthorized")
  }
}



module.exports = isAuthenticated;
