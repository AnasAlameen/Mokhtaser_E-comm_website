// استيراد المكتبات
const express = require("express");
const cors = require("cors");
const mydb = require("./config/dp.js");
const logger = require("./logger/logger.js");
require("dotenv").config();

// إعداد التطبيق
const app = express();
app.use(express.json());
app.use(cors());

// تهيئة المسارات
const userRoutes = require("./routes/add_user.js");
const sellerRoutes = require("./routes/add_seller.js");
const add_pr_new = require("./routes/new_product.js");
const sin = require("./routes/in.js");
const multer = require("./routes/multer.js");
const orders = require("./routes/orders/orders.js");

app.use("/user", userRoutes);
app.use("/seller", sellerRoutes);
app.use("/in", sin);
app.use("/product", add_pr_new);
app.use("/uplad", multer);
app.use("/order", orders);
app.use("/get_orders", require("./routes/orders/get_orders.js"));
app.use("/update_orders", require("./routes/orders/update.js"));
app.use("/update_st", require("./routes/orders/update_state.js"));
app.use("/update_state", require("./routes/orders/update_state_redy.js"));
app.use("/history", require("./routes/orders/seller_history.js"));
app.use("/user_history", require("./routes/orders/user_history.js"));
app.use("/orders", require("./routes/orders/orders_buy.js"));
app.use("/search", require("./routes/serech.js")); 
app.use("/delete", require("./routes/delete.js")); 


app.use("/Posecssing_Orders", require("./routes/proseccing_orders.js"));
app.use("/get_activity_type", require("./routes/multer_get.js"));


//app.use("/SingIn", add_pr_new);

// تسجيل بدء التطبي
logger.info("app is runing");

// إنشاء الاتصال بقاعدة البيانات
mydb.connect((error) => {
  if (error) {
    console.error("error on conation on database " + error.message);
    return;
  } else {
    console.log("conact to database");
    app.listen(3050, () => {
      console.log("server running on port 3050");
    });
  }
});

app.get("/get", (req, res) => {
  mydb.query("select * from sellers", (err, rows, fields) => {
    res.json(rows);
  });
});
