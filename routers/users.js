const express=require('express');
const router=express.Router();


const UsersControlers = require("../controllers/users/home");

router.get("/", UsersControlers.getHome);
router.get("/productDetals", UsersControlers.getproductDetals);



exports.router = router;

