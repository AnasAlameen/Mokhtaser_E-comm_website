const express = require("express");
const router = express.Router();
const mydb = require("../config/dp.js"); 
const logger = require("../logger/logger.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/", (req, res) => {
    var { product_id,orderid } = req.body;
    console.log("Product ID: " + product_id);

    // Check for required data
    const query = "DELETE FROM orders WHERE product_id=? and id=?";
    mydb.query(
        query,
        [product_id,orderid],
        (err, result) => {
            if (err) {
                console.error("Error occurred while deleting the order: ", err);
                res.status(500).send("Error occurred while deleting the order");
            } else {
                console.log("Order deleted successfully.");
                res.status(200).send("Order deleted successfully.");
            }
        }
    );
});

module.exports = router;
