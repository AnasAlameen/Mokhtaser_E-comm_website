// routes/get_orders.js
const express = require("express");
const router = express.Router();
const mydb = require("../../config/dp.js"); // تأكد من المسار الصحيح
const logger = require("../../logger/logger.js");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  const userid = req.query.userid; // استرداد قيمة معرف المستخدم من الطلب
 
  const query = "SELECT * FROM orders WHERE userid1 = ? and  Order_state = 1";

  mydb.query(query, [userid], (err, results) => {
    if (err) {
      console.error("Error retrieving orders:", err);
      res.status(500).json({ error: "Error retrieving orders" });
    } else {
      console.log(results.id);
      res.status(200).json(results); // إرسال البيانات كاستجابة JSON
    }
  });
});

module.exports = router;
