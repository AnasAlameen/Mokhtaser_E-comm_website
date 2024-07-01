const express = require("express");
const router = express.Router();
const multer=require("multer");
const cors =require("cors");
const path = require("path");
const adminControls = require("../controllers/admin/admin");
const isAuth=require("../middlewear/isAuth");
const isShop=require("../middlewear/isSeller")
const upload = multer({
    storage: multer.diskStorage({
      destination: "./public/images",
      filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      },
    }),
  });
  
  const multable = upload.fields([
    { name: 'image1', maxCount: 10 }, // الصور العامة للمنتج
    { name: 'image2', maxCount: 10 }  // الصور المرتبطة بالألوان
  ]);
  
  router.get("/add_product", isAuth,isShop ,adminControls.getAddProductPage);
  router.post("/Post_add_product", isAuth,isShop,multable,adminControls.Post_Product);
  router.get("/Edite_Product", isAuth,adminControls.getEditProductPage);
  router.post("/Post_Edite_Product", isAuth,multable,isShop,adminControls.postEdite_Products);
  router.post("/DeleteProduct",isAuth,isShop,adminControls.postDeleteProduct)


exports.router = router;

