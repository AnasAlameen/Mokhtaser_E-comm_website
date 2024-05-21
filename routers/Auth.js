const express=require("express");
const router = express.Router();
const multer=require("multer");
const isAuth=require("../middlewear/isAuth")


const singInControllers = require("../controllers/Auth");
const upload = multer({
    storage: multer.diskStorage({
      destination: "../images",
      filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      },
    }),
  });
  
  const multable = upload.fields([
    { name: "image1", maxCount: 7 },
    { name: "image2", maxCount: 9 },
  ]);

router.get("/SingIn",singInControllers.getSinIn);
router.get("/Rejister", singInControllers.getRejister);
router.post("/SingIn/Check",multable, singInControllers.CheckSingIn);
router.post("/Rejister/Check",multable, singInControllers.postRejister);
router.get("/Rejister/user",multable, singInControllers.getRejisterUser);
router.post("/Rejister/User/Check",multable, singInControllers.postRegisterUser);


router.get("/LogOut",singInControllers.LogOut);

exports.router = router;
