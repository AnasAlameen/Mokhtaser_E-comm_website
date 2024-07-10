const express=require("express");
const router = express.Router();
const multer=require("multer");
const path = require("path"); 

const adminControllers = require("../controllers/topAdmin/admin");

const upload = multer({
    storage: multer.diskStorage({
        destination: "./public/images",
        filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
      },
    }),
  });
  
   
  const multable = upload.fields([
    { name: 'image', maxCount: 1 }, // الصور العامة للمنتج
  ]);
  
router.get("/categories",adminControllers.getCategories);

router.post("/categories",multable,adminControllers.postCategories);

router.post("/subCategories",multable,adminControllers.postSubCategoty);

router.delete('/categories/:categoryId', adminControllers.deleteCategory);

router.delete('/subCategories/:subCategoryId', adminControllers.deleteSubCategory);




exports.router=router;