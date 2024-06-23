module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
            return res.redirect("http://localhost:3000/SingIn");
          
    }
    next();
};
