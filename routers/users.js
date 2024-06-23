// users.js
const express = require("express");
const router = express.Router();

const isAuth = require("../middlewear/isAuth");
const isUser = require("../middlewear/isAuthUser");
const UsersControlers = require("../controllers/users/home");
const shopControler=require("../controllers/shop/shop");

router.get("/prdoduct/detlas",isAuth,isUser,shopControler.getproductDetals);
router.get("/home", isAuth, isUser, UsersControlers.getUserHomePage);

exports.router = router;
