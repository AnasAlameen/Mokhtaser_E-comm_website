const express=require("express");
const router = express.Router();
const gerneralController=require("../controllers/general");

router.get("/home", gerneralController.getUserHomePage);
router.get("/prdoduct/detlas",gerneralController.getproductDetals);

exports.router = router;