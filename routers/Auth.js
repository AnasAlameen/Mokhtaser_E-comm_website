const express=require("express");
const router = express.Router();
const multer=require("multer");
const isNotAuth=require("../middlewear/isNotAuth")
const path = require("path"); 
// const haveRole=require("../middlewear/haveRoles");


const singInControllers = require("../controllers/Auth");
const upload = multer({
    storage: multer.diskStorage({
      destination: "./public/personalImages",
      filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      },
    }),
  });
  
  const multable = upload.fields([
    { name: "personalImage", maxCount: 1 } 

  ]);

router.get("/SingIn",isNotAuth,singInControllers.getSinIn);
router.get("/Rejister", isNotAuth,singInControllers.getRejister);
router.post("/SingIn/Check",multable, singInControllers.CheckSingIn);
router.post("/Rejister/Check",multable, singInControllers.postRejister);
router.get("/Rejister/user",isNotAuth,singInControllers.getRejisterUser);
router.post("/Rejister/User/Check",multable, singInControllers.postRegisterUser);


router.get("/LogOut",singInControllers.LogOut);

exports.router = router;
