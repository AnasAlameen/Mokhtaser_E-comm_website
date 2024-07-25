const express=require("express");
const router = express.Router();
const isAuth=require("../middlewear/isAuth")
const isNotAuth=require("../middlewear/isNotAuth")
const multer=require("multer");
const path = require("path");

//3
const shops=require("../middlewear/shops")
const haveRole=require("../middlewear/haveRoles");
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
  
const shopControler=require("../controllers/shop/shop");
router.get("/home",isAuth,isNotAuth,haveRole,shopControler.getShopeHomePage);
 
router.get("/prdoduct/detlas",isAuth,haveRole,shopControler.getproductDetals);

router.get("/orders",isAuth,haveRole,shopControler.getOrders);

router.get("/orders/detals",haveRole,isAuth,shopControler.getOrderDetals);

router.get("/prdoducts",isAuth,haveRole,shopControler.getProductList);


router.get("/shop",isAuth,shops,shopControler.getRoles); 


router.get('/profile', isAuth, shops,haveRole,shopControler.getProfile);

router.post('/profile/update', isAuth, multable,shopControler.postProfileUpdate);



exports.router = router;