const db = require("../../helpers/databas");
exports.getCart=(req,res,next)=>{
    res.render("users/cart",{
        pageTitle: "Cart",
        path: "users/cart",
    })
}