const db = require("../../helpers/databas");
exports.getHome = (req, res, next) => {
    res.render("users/home", {
      pageTitle: "general home",
      path: "users/home",
    });
  };
  exports.getproductDetals = (req, res, next) => {
    res.render("users/productDetals", {
      pageTitle: "general home",
      path: "users/productDetals",
    });
  };