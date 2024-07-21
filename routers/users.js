const express = require("express");
const router = express.Router();
const multer=require("multer");
const cors =require("cors");
const path = require("path");
const adminControls = require("../controllers/admin/admin");

const upload = multer({
    storage: multer.diskStorage({
      destination: "./public/images",
      filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      },
    }),
  });
  
  
  const multable = upload.fields([
    { name: 'profileImage', maxCount: 1 }, // الصور العامة للمنتج
    { name: 'currentProfileImage', maxCount: 1 }, // الصور العامة للمنتج

  ]);
  

const isAuth = require("../middlewear/isAuth");
const isUser = require("../middlewear/isAuthUser");
const UsersControlers = require("../controllers/users/home");
const shopControler=require("../controllers/shop/shop");

router.get("/prdoduct/detlas",isAuth,isUser,shopControler.getproductDetals);

router.get("/home", isAuth, isUser, UsersControlers.getUserHomePage);

router.get("/stores", isAuth, isUser, UsersControlers.getStores);

router.get('/subCategoriesPage', isAuth, isUser,UsersControlers.getsubCategoriesPage);

router.get('/subCategoriesProducts', isAuth, isUser,UsersControlers.getsubCategoriesProducts);

router.get('/SerchResult', isAuth, isUser,UsersControlers.getSearchResults);

router.get('/ordersTracking', isAuth, isUser,UsersControlers.getOrdersTracking);

router.get('/profile', isAuth, isUser,UsersControlers.getProfile);

router.post('/profile/update', isAuth, multable,isUser,UsersControlers.postProfileUpdate);




exports.router = router;
