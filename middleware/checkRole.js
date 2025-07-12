// middleware/checkRoleSelection.js
function checkRoleSelection(req, res, next) {
  const user = req.session.user;

  // Allow access only if user is logged in and has NO role (i.e. new user)
  if (user && !user.role) {
    return next();
  }

  // Redirect all others
  res.redirect("/");
}

module.exports = checkRoleSelection;
