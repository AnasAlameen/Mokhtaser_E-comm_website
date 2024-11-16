const express = require("express");
const router = express.Router();
const mydb = require("../config/dp.js");

require("dotenv").config();


router.get("/type", (req, res) => {
    const seller = req.query.seller_id; // استرداد قيمة معرف المستخدم من الطلب
 
    const query = "SELECT * FROM sellers WHERE id = ? ";
    mydb.query(query, [seller], (err, results) => {
        if (err) {
          console.error("Error retrieving orders:", err);
          res.status(500).json({ error: "Error retrieving orders" });
        } else {
          console.log(results.activity_type);
          res.status(200).json(results); // إرسال البيانات كاستجابة JSON
        }
      });
    });

    module.exports = router;
