// users.js
const express = require("express");
const router = express.Router();

const isAuth = require("../middlewear/isAuth");
const isUser = require("../middlewear/isAuthUser");
const UsersControlers = require("../controllers/users/home");
const shopControler=require("../controllers/shop/shop");

router.get("/prdoduct/detlas",isAuth,isUser,shopControler.getproductDetals);

router.get("/home", isAuth, isUser, UsersControlers.getUserHomePage);

router.get("/stores", isAuth, isUser, UsersControlers.getStores);

router.get('/subCategoriesPage',UsersControlers.getsubCategoriesPage);

router.get('/subCategoriesProducts',UsersControlers.getsubCategoriesProducts);

router.get('/SerchResult',UsersControlers.getSearchResults);



exports.router = router;
