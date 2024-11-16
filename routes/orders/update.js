const express = require("express");
const router = express.Router();
const mydb = require("../../config/dp.js");
const logger = require("../../logger/logger.js");
const bcrypt = require("bcrypt");
router.post("/update", (req, res) => {
  var { product_id, qty, userid } = req.body;
  console.log(product_id + "product_id" + qty + "  " + userid);
  const query =
    "UPDATE orders SET orders_qyt = ? WHERE product_id = ? And userid1=? ";

  mydb.query(query, [qty, product_id, userid], (err, results) => {
    if (err) {
      console.error("Error updating orders:", err);
      res.status(500).json({ error: "Error updating orders" });
    } else {
      console.log("Orders updated successfully for  " + product_id);
      res.status(200).json(results);
    }
  });
});

module.exports = router;
