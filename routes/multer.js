const express = require("express");
const router = express.Router();
const mydb = require("../config/dp.js");
const logger = require("../logger/logger.js");
const multer = require("multer");
const path = require("path");
const { auth } = require("./in.js");
let imagePaths2 = [];
const jwt = require("jsonwebtoken");
require("dotenv").config();
const util = require("util");
const { promisify } = util;
const query = promisify(mydb.query).bind(mydb);

// تعديلات Multer هنا

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //cb(null, "./images");
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
const multable = upload.fields([
  { name: `image1`, maxCount: 7 },
  { name: `image2`, maxCount: 5 },
]);
let product_id;
router.post("/image", auth, multable, (req, res) => {
  const {
    name,
    description,
    price,
    quantity,
    colors,
    selectedDimensions,
    product_category,
    typeValue,
    seller_id,
    add_dimensions,
    selected_Type,
    type1,
  } = req.body;

  if (!name || !description || !price || !quantity || !typeValue|| !seller_id ) {
    return res.status(400).send("الuserIdبيانات ناقصة");
  }

  if (!req.files) {
    return res.status(400).send("لم يتم رفع الصور");
  }

  if (req.user) {
    let userId = req.user.id;
    let userEmail = req.user.email;

    const sqlInsertProduct =
      "INSERT INTO products (seller_id,name, description, price, quantity,creation_date) VALUES ( ?,?, ?, ?,?,now())";
     mydb.query(
      sqlInsertProduct,
      [seller_id, name, description, price, quantity],
      (err, result) => {
        if (err) {
          return res.send("خطأ في إضافة المنتج: " + err.message);
        } else {
          console.log("product add sec");

          product_id = result.insertId; // حفظ قيمة الـ insertId في المتغير product_id
          if (req.files["image1"]) {
            req.files["image1"].forEach((file) => {
              const sqlInsertImage =
                "INSERT INTO product_images (product_id2, url) VALUES (?, ?)";

              mydb.query(
                sqlInsertImage,
                [result.insertId, file.path],
                (err, result) => {
                  if (err) {
                    logger.error("خطأ في إضافة الصورة: " + err.message);
                  } else {
                    console.log("image public");
                    ///////////////////////////////////////////////////////////////////////////////////////////////
                    console.log(product_category);
                  }
                }
              );
            });
          } else {
            console.log("erorr in file 2");
          }
        }
      }
    );

    // معالجة الألوان والأبعاد وإدراجها في جدول variants و variant_options

    const color = "Color";
    mydb.query(
      "INSERT INTO variants (category_id1, name) VALUES (?, ?)",
      [product_category, color],
      (err, result) => {
        if (err) {
          logger.error("خطأ في إضافة متغير اللون: " + err.message);
          return;
        } else {
          console.log("variants for color add secss");
          variantId = result.insertId;
          const sqlInsertProductVariant =
            "INSERT INTO product_variants (product_id, variant_id1) VALUES (?, ?)";

          mydb.query(
            sqlInsertProductVariant,
            [product_id, variantId],
            (err, result) => {
              if (err) {
                console.log(variantId + " is not a dpme");

                logger.error(
                  "خطأ في إضافة بيانات المتغير الخاص بالمنتج:1 " + err.message
                );
              } else {
                console.log(variantId + " is not a dpme");

                console.log("تمت إضافة بيانات المتغير الخاص بالمنتج بنجاح1");
              }
            }
          );
        }
        ////////////////////////////////////////////////////////////////////variant_options
        colorsArray = JSON.parse(colors);

        colorsArray.forEach((color, index) => {
          // هنا نضمن أن لكل لون تتم إضافة صورته المناسبة باستخدام الفهرس
          value = color.name;
          mydb.query(
            "INSERT INTO variant_options (variant_id, value, Number) VALUES (?, ?, ?)",
            [variantId, value, color.quantity],
            (err, result) => {
              if (err) {
                logger.error("خطأ في إضافة خيار متغير اللون: " + err.message);
              } else {
                console.log("dimension add success");
                //////////////////////////////////////////////////////////////////////

                const variant_options_id = result.insertId;
                // تحقق من وجود صورة مطابقة للفهرس

                if (product_id) {
                  ///////////////////////////////////////////////////////////
                  if (req.files["image2"] && req.files["image2"][index]) {
                    const file = req.files["image2"][index];
                    // تحقق من وجود صورة مطابقة للفهرس

                    mydb.query(
                      "INSERT INTO variant_images (variant_option_id , image_url) VALUES (?, ?)",
                      [variant_options_id, file.path],
                      (err) => {
                        if (err) {
                          logger.error(
                            "error in add images for vartion " + err.message
                          );
                        } else {
                          console.log("image dimension add success");
                        }
                      }
                    );
                  }
                } else {
                  console.log("produvct not found");
                }
              }
            }
          );
        });
      }
    );
    // console.log(product_category + "  " + "product_category");

    dimationArray = JSON.parse(selectedDimensions);
    dimationArray.forEach((dimension) => {
      let value = dimension.value;

      mydb.query(
        "INSERT INTO variants (category_id1, name) VALUES (?, ?)",
        [product_category, dimension.type],
        (err, result) => {
          if (err) {
            logger.error("خطأ في إضافة متغير الأبعاد: " + err.message);
            return;
          } else {
            variantId = result.insertId;
            console.log("variants for dimantion add secss");
            if (product_id) {
              const sqlInsertProductVariant =
                "INSERT INTO product_variants (product_id, variant_id1) VALUES (?, ?)";

              console.log("variant_id" + variantId);
              mydb.query(
                sqlInsertProductVariant,
                [product_id, variantId],
                (err, result) => {
                  if (err) {
                    logger.error(
                      "خطأ في إضافة بيانات المتغير الخاص بالمنتج: " +
                        err.message
                    );
                  } else {
                    console.log("تمت إضافة بيانات المتغير الخاص بالمنتج بنجاح");
                  }
                }
              );
            }
          }

          //console.log(dimationArray);

          mydb.query(
            "INSERT INTO variant_options (variant_id, value,Number) VALUES (?, ?,?)",
            [variantId, value, dimension.quantity],
            (err, result) => {
              if (err) {
                logger.error("خطأ في إضافة خيار متغير الأبعاد: " + err.message);
              } else {
                console.log("variants_option for dimantion add secss");
              }
            }
          );
        }
      );
    });
  }
});
module.exports = router;
