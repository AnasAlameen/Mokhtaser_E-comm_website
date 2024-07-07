const express = require("express");
const router = express.Router();
const multer = require("multer");
const cartControler = require("../controllers/users/Cart");
const isAuth = require("../middlewear/isAuth");
const isShop=require("../middlewear/isSeller");
const isUser=require("../middlewear/isAuthUser");


router.get("/user/")