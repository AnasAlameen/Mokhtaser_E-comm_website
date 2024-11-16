// routes/get_orders.js
const express = require("express");
const router = express.Router();
const mydb = require("../config/dp.js"); // تأكد من المسار الصحيح
const logger = require("../logger/logger.js");
const bcrypt = require("bcrypt");

router.get("/seller_order", (req, res) => {
  const seller_id = req.query.seller_id; // استرداد قيمة معرف المستخدم من الطلب
  if((seller_id))
  {

 
  const query = "SELECT * FROM orders  WHERE seller_id = ?  and  Order_state = ?;";

  mydb.query(query, [seller_id,2], (err, results) => {
    if (err) {
      console.error("Error retrieving orders:", err);
      res.status(500).json({ error: "Error retrieving orders" });
    } else {
      res.status(200).json(results); // إرسال البيانات كاستجابة JSON
    }
  });
}
else
{
  console.log("seller_id is empty");
}

});

module.exports = router;


