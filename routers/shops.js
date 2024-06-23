const express=require("express");
const router = express.Router();
const isAuth=require("../middlewear/isAuth")
//3
const isShop=require("../middlewear/isSeller")

const shopControler=require("../controllers/shop/shop");
router.get("/home",isAuth,shopControler.getShopeHomePage);
router.get("/prdoduct/detlas",isAuth,isShop,shopControler.getproductDetals);
router.get("/orders",isAuth,isShop,shopControler.getOrders);
router.get("/orders/detals",isAuth,isShop,shopControler.getOrderDetals);
router.get("/prdoducts",isAuth,isShop,shopControler.getProductList);
router.get("/profile",isAuth,isShop,shopControler.getProfile);



exports.router = router;