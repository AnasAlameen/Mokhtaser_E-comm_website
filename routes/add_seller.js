const express = require("express");
const router = express.Router();
const mydb = require("../config/dp.js"); // تأكد من المسار الصحيح
const logger = require("../logger/logger.js");
router.post("/add-seller", (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    company_name,
    activity_type,
    license_number,
    password,
    city,
    longitude,
    latitude,
    address,
  } = req.body;

  if (!req.body) {
    return res.sendStatus(400);
  }

  const sellerQuery = "SELECT * FROM sellers WHERE email = ?";
  mydb.query(sellerQuery, [email], (err, sellerResult) => {
    if (err) {
      return res.send("هناك خطا في التحقق من الايميل " + err.message);
    } else {
      if (sellerResult.length <= 0) {
        // إضافة البائع(
        const sellerQuery =
          "INSERT INTO sellers (seller_num,first_name, last_name, email, phone_number, company_name, activity_type, identity_number, password,creation_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,now( ))";
        function generateStoreNumber(cityCode, activityType) {
          const randomDigits = Math.floor(Math.random() * 10000000000)
            .toString()
            .padStart(6, "0");
          return `${cityCode}${activityType}${randomDigits}`;
        }

        let id = generateStoreNumber(activity_type, city);
        mydb.query(
          sellerQuery,
          [
            id,
            first_name,
            last_name,
            email,
            phone,
            company_name,
            activity_type,
            license_number,
            password,
          ],
          (error, results) => {
            if (error) {
              return res
                .status(500)
                .send("خطأ في إضافة البائع: " + error.message);
            }

            // الحصول على id البائع
            let sellerId = results.insertId;

            // إضافة الموقع
            const addressQuery =
              "INSERT INTO locations (seller_id, city, longitude, latitude,areay) VALUES (?, ?, ?, ?,?)";
            mydb.query(
              addressQuery,
              [sellerId, city, longitude, latitude, address],
              (error, results) => {
                if (error) {
                  logger.error("خطأ في إضافة الموقع: %o", error);
                  return res
                    .status(500)
                    .send("خطأ في إضافة الموقع: " + error.message);
                }

                logger.info("نتائج إضافة الموقع: %o", results);
                res.status(200).send("تم إضافة البائع والموقع بنجاح");
         
              }
            );
          } 
        );
      }else{
        console.log("الايميل موجود بالفعل")
        res.status(400).send("الايميل موجود بالفعل");

    
        
      }
    }
  });
});

module.exports = router;
