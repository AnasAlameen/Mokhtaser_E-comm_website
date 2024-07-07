const express=require("express");
const router = express.Router();
const multer=require("multer");
const isAuth=require("../middlewear/isAuth")
const path = require("path"); 


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

router.get("/SingIn",singInControllers.getSinIn);
router.get("/Rejister", singInControllers.getRejister);
router.post("/SingIn/Check",multable, singInControllers.CheckSingIn);
router.post("/Rejister/Check",multable, singInControllers.postRejister);
router.get("/Rejister/user",singInControllers.getRejisterUser);
router.post("/Rejister/User/Check",multable, singInControllers.postRegisterUser);
router.post("home",singInControllers.getRoles);


router.get("/LogOut",singInControllers.LogOut);

exports.router = router;
