const express = require("express");
const router = express.Router();
const mydb = require("../config/dp.js"); // تأكد من أن هذا هو الاتصال الصحيح
const logger = require("../logger/logger.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();


console.log("start");
router.post("/sing_in", (req, res) => {
  const { email, password } = req.body;
  console.log("email:" + " " + email + "   " + " password" + "  " + password);
  // تحقق من البريد الإلكتروني في جدول البائعين
  const sellerQuery = "SELECT * FROM sellers WHERE email = ?";
  mydb.query(sellerQuery, [email], (err, sellerResult) => {
    if (err) throw err;

    if (sellerResult.length > 0) {
      // تحقق من كلمة المرور
      if (sellerResult[0].password === password) {
        const secretKey = process.env.JWT_SECRET_KEY;

        // إنشاء ال payload الذي سيتم تضمينه في التوكن
        const payload = {
          email: sellerResult[0].email,
          seller_id: sellerResult[0].id,
        };
        let seller_id=sellerResult[0].id;
    

        // تحديد خيارات التوكن مثل فترة الصلاحية
        const options = { expiresIn: "100h" };

        // إنشاء التوكن
        const token = jwt.sign(payload, secretKey, options);

        // إرسال التوكن إلى المستخدم
        console.log(token + " " + secretKey);

        res.json({
          userType: "seller",
          redirectUrl: "./home/home.php",
          token: token,
          seller_id:seller_id,
        });
        console.log(token);
      } else {
        res.send("Username or password is incorrect");
      }
    } else {
      // إذا لم يتم العثور على البريد الإلكتروني كبائع، البحث في جدول المستخدمين
      const userQuery = "SELECT * FROM users WHERE email = ?";
      mydb.query(userQuery, [email], (err, userResult) => {
        if (err) throw err;

        if (userResult.length > 0) {
          // تحقق من كلمة المرور
          if (userResult[0].password == password) {
            console.log("userResult[0].password" + userResult[0].password);
            const secretKey = process.env.JWT_SECRET_KEY;

            // إنشاء ال payload الذي سيتم تضمينه في التوكن
            const payload = {
              email: userResult[0].email,
              userid: userResult[0].id,
            };
            let userid=userResult[0].id;


            // تحديد خيارات التوكن مثل فترة الصلاحية
            const options = { expiresIn: "100h" };

            // إنشاء التوكن
            const token = jwt.sign(payload, secretKey, options);

            // إرسال التوكن إلى المستخدم
            console.log(token + " " + secretKey);

            res.json({
              userType: "user",
              redirectUrl: "./home/homeUser.php",
              token: token,
              userid:userid,
            });
            console.log(token);
          } else {
            res.send("Username or password is incorrect for user");
            console.log("Username or password is incorrect for user");
          }
        } else {
          // المستخدم غير موجود في كلا الجدولين
          res.send("Username or password is incorrect for all");
          console.log("Username or password is incorrect for all");
        }
      });
    }
  });
});
function auth(req, res, next) {
  // الحصول على التوكن من رأس الطلب
  const authHeader = req.headers["authorization"].replace("Bearer", "") || "";
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401); // إذا لم يتم إرسال التوكن
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403); // إرسال خطأ إذا كان التوكن غير صالح أو منتهي الصلاحية
    }

    req["user"] = user; // حفظ بيانات المستخدم في الطلب للاستخدام لاحقًا
    next(); // الانتقال إلى الدالة التالية في السلسلة
  });
}

module.exports = router;
module.exports.auth = auth;
