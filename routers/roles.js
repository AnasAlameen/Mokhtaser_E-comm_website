const express=require("express");
const router = express.Router();
const isAuth=require("../middlewear/isAuth")
const path = require("path"); 
const isShop=require("../middlewear/isSeller")
const rolesControler=require("../controllers/admin/roles");

const haveRole=require("../middlewear/haveRoles");

router.get("/addEmployee",isAuth,haveRole,rolesControler.getAddEmploy);
router.get("/search",isAuth,haveRole,rolesControler.getSearches);
router.post("/addrole",isAuth,haveRole,rolesControler.postAddRole);
exports.router = router;
