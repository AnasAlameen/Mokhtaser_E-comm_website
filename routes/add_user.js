
const express = require('express');
const router = express.Router();
const mydb = require('../config/dp.js'); // تأكد من المسار الصحيح
const logger = require('../logger/logger.js');
const bcrypt=require('bcrypt')

router.post("/add-user", (req, res) => {
    const { first_name, last_name, email, phone, city, birthdate, password,  location,latitude,longitude,address } = req.body;
  
    if (!req.body) {
      return res.sendStatus(400);
    }
  
    // إضافة بيانات المستخدم
    const userQuery = "INSERT INTO users (first_name,last_name,email,password,join_date ,phone) VALUES (?, ?, ?, ?, now(),?)";
    mydb.query(userQuery, [first_name, last_name, email, password, birthdate, phone], (error, results) => {
      if (error) {
        return res.status(500).send("خطأ في إضافة المستخدم: " + error.message);
      }
  
      let userId = results.insertId;
  
      // إضافة بيانات الموقع
      const addressQuery = "INSERT INTO locations (user_id, city, longitude, latitude,areay) VALUES (?, ?, ?, ?,?)";
      mydb.query(addressQuery, [userId, city, latitude, longitude,address], (error, results) => {
        if (error) {
          return res.status(500).send("خطأ في إضافة الموقع: " + error.message);
        }
  
        res.status(200).send("تم إضافة المستخدم والموقع بنجاح");
      });
    });
  });

router.get('/some-route', (req, res) => {
  logger.info('تم الوصول إلى مسار معين');
  // منطق المسار
});

  module.exports = router;
