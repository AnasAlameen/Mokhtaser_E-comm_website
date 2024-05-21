const express=require("express");
const router = express.Router();
const isAuth=require("../middlewear/isAuth")
//3
const isUser=require("../middlewear/isUser")

const shopControler=require("../controllers/shop/shop");
router.get("/home",isAuth,shopControler.getShopeHomePage);
router.get("/prdoduct/detlas",isAuth,shopControler.getproductDetals);
router.get("/cart",isAuth,shopControler.getCart);
router.get("/orders",isAuth,shopControler.getOrders);
router.get("/orders/detals",isAuth,shopControler.getOrderDetals);

router.get("/prdoducts",isAuth,shopControler.getProductList);
router.get("/profile",isAuth,shopControler.getProfile);



exports.router = router;