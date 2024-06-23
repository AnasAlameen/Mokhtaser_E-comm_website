module.exports = (req, res, next) => {
  if (!(req.session.role === "user")) {
    return res.redirect("http://localhost:3000/shop/Home");
  }
  next();
};
