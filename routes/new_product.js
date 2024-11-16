const express = require("express");
const router = express.Router();
const mydb = require("../config/dp.js");
const logger = require("../logger/logger.js");

router.post("/add-product", (req, res) => {
  // استقبال البيانات من الطلب
  const {
    name,
    description,
    price,
    quantity,
    imageUrl,
    colors,
    selectedDimensions,
    product_num,
  } = req.body;


  // التحقق من وجود البيانات الأساسية
  if (!name || !description || !price || !quantity || !imageUrl) {
    return res.status(400).send("البيانات ناقصة");
  }

  // إدراج المنتج في جدول products
  const sqlInsertProduct =
    "INSERT INTO products (name,product_num, description, price, quantity,creation_date) VALUES (?, ?, ?, ?,?,now())";
  mydb.query(sqlInsertProduct,[name,product_num, description, price, quantity], (err, result) => {
      if (err) {
        return res.status(500).send("خطأ في إضافة المنتج: " + err.message);
      }
    });
      


      // إدراج الصورة في جدول images
      const sqlInsertImage =
        "INSERT INTO images (product_id, url) VALUES (?, ?)";
      mydb.query(sqlInsertImage, [productId, imageUrl], (err, result) => {
        if (err) {
          logger.error("خطأ في إضافة الصورة: " + err.message);
        }
      });

      // معالجة الألوان والأبعاد وإدراجها في جدول variants و variant_options
      colors.forEach((color) => {
        mydb.query(
          "INSERT INTO variants (product_id, variant_name) VALUES (?, ?)",
          [productId, "Color"],
          (err, result) => {
            if (err) {
              logger.error("خطأ في إضافة متغير اللون: " + err.message);
              return;
            }
            const variantId = result.insertId;
            mydb.query("INSERT INTO variant_options (variant_id, option_name) VALUES (?, ?)", [variantId, color],
              (err, result) => {
                if (err) {
                  logger.error("خطأ في إضافة خيار متغير اللون: " + err.message);
                }
              }
            );
          }
        );
      });

      selectedDimensions.forEach((dimension) => {
        mydb.query(
          "INSERT INTO variants (product_id, variant_name) VALUES (?, ?)",
          [productId, "Dimension"],
          (err, result) => {
            if (err) {
              logger.error("خطأ في إضافة متغير الأبعاد: " + err.message);
              return;
            }
            const variantId = result.insertId;
            mydb.query(
              "INSERT INTO variant_options (variant_id, option_name) VALUES (?, ?)",
              [variantId, dimension],
              (err, result) => {
                if (err) {
                  logger.error(
                    "خطأ في إضافة خيار متغير الأبعاد: " + err.message
                  );
                }
              }
            );
          }
        );
      });

      // إرسال رد النجاح مع ID المنتج
      res
        .status(200)
        .send({ message: "تم إضافة المنتج بنجاح", productId: productId });
    }
  );

module.exports = router;
