const express = require("express");
const router = express.Router();
const mydb = require("../../config/dp.js");
const logger = require("../../logger/logger.js");
const bcrypt = require("bcrypt");

router.post("/update_state", (req, res) => {
  var {
    seller_id,
    orderid,
    qty,
    product_id
  } = req.body;

  const query = "UPDATE orders SET Order_state = ? WHERE seller_id = ? AND id = ?";
  const newState =3; // قم بتحديد الحالة الجديدة التي تريد تعيينها للطلب
  mydb.query(query, [newState, seller_id, orderid], (err, result) => {
      if (err) {
          console.error("حدث خطأ أثناء تحديث الطلب: ", err);
          res.status(500).send("حدث خطأ أثناء تحديث الطلب");
      } else {
          console.log("تم تحديث الطلب بنجاح.");
          res.status(200).send("تم تحديث الطلب بنجاح.");
      }
      

  
  }); 

});


module.exports = router;
/*SELECT orders.name, orders.date, orders.status, orders.value, stores.name AS store_name
FROM orders
JOIN stores ON orders.store_id = stores.id
WHERE orders.status = 5; -- 5 هو القيمة المحددة للحالة الملغية في فهرس الحالة
module.exports = {
    router1,
    router2
};
   console.log("تم إضافة الطلب بنجاح.");
        const query = "DELETE FROM orders WHERE userid1 = ? AND id = ?";
        mydb.query(query, [userid, orderid], (err, result) => {
          if (err) {
            console.error("حدث خطأ أثناء حذف الطلب: ", err);
            res.status(500).send("حدث خطأ أثناء حذف الطلب");
          } else {
            console.log("تم حذف الطلب بنجاح.");
            res.status(200).send("تم حذف الطلب بنجاح.");
          }
*/