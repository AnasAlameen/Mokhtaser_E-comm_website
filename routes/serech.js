const express = require("express");
const router = express.Router();
const mydb = require("../config/dp.js"); // تأكد من المسار الصحيح
const logger = require("../logger/logger.js");
const bcrypt = require("bcrypt");

router.post("/search_products", (req, res) => {
  const keyword = req.body.keyword;

  console.log(keyword + " this is a keyword");
  const query = `
  SELECT products.*, product_images.url AS img_url 
  FROM products 
  INNER JOIN product_images ON products.id = product_images.product_id2
  WHERE products.name LIKE '%${keyword}%' OR products.description LIKE '%${keyword}%'
`;

  mydb.query(query, (err, results) => {
    if (err) {
      console.error("خطأ في استعلام قاعدة البيانات:", err);
      res.status(500).json({ error: "حدث خطأ أثناء البحث في قاعدة البيانات" });
      return;
    }

    // إرسال النتائج إلى العميل
    res.json(results);
  });
});
router.post("/get_products", (req, res) => {
  const seller_id = req.body.seller_id;
  if (seller_id) {
    console.log(seller_id + " this is a seller");
    const query = `SELECT * FROM products WHERE seller_id  =?`;

    mydb.query(query, [seller_id], (err, results) => {
      if (err) {
        console.error("Error retrieving orders:", err);
        res.status(500).json({ error: "Error retrieving orders" });
      } else {
        console.log(results.id);
        res.status(200).json(results);
      }
    });
  } else {
    console.log("seller is empty");
  }
});

module.exports = router;
