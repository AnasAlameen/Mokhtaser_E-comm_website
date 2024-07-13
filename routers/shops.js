const express=require("express");
const router = express.Router();
const isAuth=require("../middlewear/isAuth")
const isNotAuth=require("../middlewear/isNotAuth")

//3
const shops=require("../middlewear/shops")
const haveRole=require("../middlewear/haveRoles");

const shopControler=require("../controllers/shop/shop");
router.get("/home",isAuth,isNotAuth,haveRole,shopControler.getShopeHomePage);

router.get("/prdoduct/detlas",isAuth,haveRole,shopControler.getproductDetals);

router.get("/orders",isAuth,haveRole,shopControler.getOrders);

router.get("/orders/detals",haveRole,isAuth,shopControler.getOrderDetals);

router.get("/prdoducts",isAuth,haveRole,shopControler.getProductList);

router.get("/profile",isAuth,haveRole,shopControler.getProfile);

router.get("/shop",isAuth,haveRole,shops,shopControler.getRoles);




exports.router = router;