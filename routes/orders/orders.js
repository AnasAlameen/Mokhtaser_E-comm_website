const express = require("express");
const router = express.Router();
const mydb = require("../../config/dp.js");
const logger = require("../../logger/logger.js");
const path = require("path");

router.post("/orders", (req, res) => {
  var {
    userid,
    total,
    productId,
    theImage,
    thenumber,
    productPrice,
    thetype,
    productName,
    seller_id1,
  } = req.body;
  console.log("Product ID: " + productId);
  console.log("seller_id1: " + seller_id1);
  console.log("productName: " + productName);
  console.log("productPrice: " + productPrice);
  console.log("productimage: " + theImage);
  console.log("thytype: " + thetype);
  console.log("thenumber: " + thenumber);
  console.log("total: " + total);
  console.log("userid: " + userid);

  // التحقق من وجود البيانات المطلوبة
  const query =
    "INSERT INTO orders (userid1,  total, product_id, img_url, orders_qyt,variantType ,name,seller_id,Order_state,date) VALUES (?,?, ?, ?, ?, ?, ?,?,1,NOW())";
  mydb.query(
    query,
    [
      userid,
      productPrice,
      productId,
      theImage,
      thenumber,
      thetype,
      productName,
      seller_id1,
    ],
    (err, result) => {
      if (err) {
        console.error("حدث خطأ أثناء إضافة الطلب: ", err);
        res.status(500).send("حدث خطأ أثناء إضافة الطلب");
      } else {
        console.log("تم إضافة الطلب بنجاح.");
        res.status(200).send("تم إضافة الطلب بنجاح.");
      }
    }
  );

});

module.exports = router;
