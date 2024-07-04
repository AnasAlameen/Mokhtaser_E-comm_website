const db = require("../../helpers/databas");


exports.getAddEmploy= (req, res, next) => {
    res.render("shop/admin/addEmployee", {
      pageTitle: "Add Employee",
      path: "shop/addEmployee",
    });
  };