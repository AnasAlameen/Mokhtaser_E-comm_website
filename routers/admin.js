const express = require("express");
const router = express.Router();
const multer=require("multer");
const cors =require("cors");
const path = require("path");
const adminControls = require("../controllers/admin/admin");
const isAuth=require("../middlewear/isAuth")
const upload = multer({
    storage: multer.diskStorage({
      destination: "../public/images",
      filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      },
    }),
  });
  
  const multable = upload.fields([
    { name: "image1", maxCount: 7 },
    { name: "image2", maxCount: 9 },
  ]);
  router.get("/add_product", isAuth, adminControls.getAddProductPage);
  router.post("/Post_add_product", multable,adminControls.Post_Product);

exports.router = router;

