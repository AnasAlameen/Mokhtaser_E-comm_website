const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cors = require("cors");
const db = require("./helpers/databas");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const csrf = require("csurf");
const cron = require('node-cron');
const app = express();

// إعدادات تخزين الجلسة في قاعدة البيانات
const options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'Mokhtasar'
};

// إعداد تخزين الجلسات باستخدام MySQL
const sessionStore = new MySQLStore(options);

app.use(session({
  secret: 'mySecretKey',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true إذا كنت تستخدم HTTPS
}));


// إعداد مهمة cron لمسح الجلسات المنتهية الصلاحية كل 5 دقائق
cron.schedule('*/5 * * * *', async () => {
  try {
    // الحصول على الوقت الحالي بالثواني
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    // حذف الجلسات التي انتهت صلاحيتها
    const [rows] = await db.execute('DELETE FROM sessions WHERE expires < ?', [currentTimeInSeconds]);
    console.log(`Deleted ${rows.affectedRows} expired sessions.`);
  } catch (err) {
    console.error('Error deleting expired sessions:', err);
  }
});

// استخدم middleware لمعالجة البيانات JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const Auth = require("./routers/Auth");
app.use("/", Auth.router);

// إعداد CSRF middleware
const csrfProtection = csrf();
app.use(csrfProtection);

// تعيين CSRF token في المتغيرات المحلية للاستفادة منه في القوالب
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Set up view engine and views directory
app.set("view engine", "ejs");
app.set("views", "views");

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

const erorreConntlroller = require("./controllers/errore");

// Import and use routers for different parts of your application
const adminRoutes = require("./routers/admin");
app.use("/admin", adminRoutes.router);

const roleRoutes = require("./routers/roles");
app.use("/", roleRoutes.router);

const shopRoutes = require("./routers/shops");
app.use("/shop", shopRoutes.router);

const UsersControlers = require("./routers/users");
app.use("/user", UsersControlers.router);

const general = require("./routers/general");
app.use("/general", general.router);

const CartRoute = require("./routers/cart");
app.use("/cart", CartRoute.router);

// Define a route for handling 404 errors
app.use(erorreConntlroller.get404);

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
