module.exports = (req, res, next) => {
    console.log("🔎 Session ID:", req.sessionID);
  console.log("🔎 isLoggedIn:", req.session.isLoggedIn);

    if (!req.session.isLoggedIn) {
        console.log("🔒 Access denied: User not logged in (Session missing)");
        return res.redirect('/auth/login');
    }
    next();
};