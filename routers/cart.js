const express = require("express");
const router = express.Router();
const multer = require("multer");
const cartControler = require("../controllers/users/Cart");
const isAuth = require("../middlewear/isAuth");
const isShop=require("../middlewear/isSeller")
const isUser=require("../middlewear/isAuthUser")

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
router.post("/add/toCart", multable,isUser, cartControler.postAddToCart);

router.post("/addOrder", multable, isUser,cartControler.addOrder);

router.get("/", isAuth, isUser,cartControler.getCart);

router.post("/ordered",upload.none(),cartControler.postOrder); // تعديل المسار هنا

router.get("/Orders", isAuth,cartControler.getOrders);

router.post("/orderRedy",multable, isShop,cartControler.orderRedy);

router.delete('/delete', cartControler.deleteFromCart);


exports.router = router;
