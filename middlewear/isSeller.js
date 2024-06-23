module.exports = (req, res, next) => {
    if (!(req.session.role === "store")) {
      return res.redirect("http://localhost:3000/user/Home");
    }
    next();
  };
  