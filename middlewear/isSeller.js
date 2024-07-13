const db = require("../helpers/databas");

const haveRoles = async (req, res, next) => {
    if (!req.session.type==="seller") {
        return res.redirect("http://localhost:3000/SingIn");
    }
    next();
};

module.exports = haveRoles;
