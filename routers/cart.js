const express = require("express");
const router = express.Router();
const multer = require("multer");
const cartControler = require("../controllers/users/Cart");
const isAuth = require("../middlewear/isAuth");
const isShop=require("../middlewear/isSeller")

const upload = multer({
  storage: multer.diskStorage({
    destination: "/images",
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  }),
});

const multable = upload.fields([
  { name: "image1", maxCount: 7 },
  { name: "image2", maxCount: 9 },
]);
router.post("/add/toCart", multable, cartControler.postAddToCart);
router.post("/addOrder", multable, cartControler.addOrder);
router.get("/", isAuth, cartControler.getCart);
router.post("/ordered",upload.none(),cartControler.addOrder); // تعديل المسار هنا
router.get("/Orders", isAuth,isShop,cartControler.getOrders);
router.post("/orderRedy",multable, cartControler.orderRedy);


exports.router = router;
