const express=require("express");
const router = express.Router();
const isAuth=require("../middlewear/isAuth")
const path = require("path"); 
const isShop=require("../middlewear/isSeller")
const rolesControler=require("../controllers/admin/roles");


router.get("/addEmployee",isAuth,isShop,rolesControler.getAddEmploy);

exports.router = router;
