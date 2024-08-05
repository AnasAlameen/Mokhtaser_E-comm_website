const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const csrf = require("csurf");
const cron = require('node-cron');
const flash = require("connect-flash");
const dotenv = require('dotenv');
var compression = require('compression')
dotenv.config({ path: 'config.env' });

const app = express();
const db = require("./helpers/databas");

// إعدادات تخزين الجلسة في قاعدة البيانات باستخدام القيم من config.env
const options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

// إعداد تخزين الجلسات باستخدام MySQL
const sessionStore = new MySQLStore(options);

app.use(session({
  secret: process.env.SESSION_SECRET || 'mySecretKey',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true إذا كنت تستخدم HTTPS
}));

// استخدم flash بعد إعداد الجلسات
app.use(flash());

// إعداد مهمة cron لمسح الجلسات المنتهية الصلاحية كل 5 دقائق
cron.schedule('*/5 * * * *', async () => {
  try {
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
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
//لضغط الردود
app.use(compression());

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
const topAdminRoutes = require("./routers/topAdmin");
app.use("/admin", topAdminRoutes.router);

const adminRoutes = require("./routers/admin");
app.use("/admin", adminRoutes.router);
app.get('/', (req, res) => {
  res.send('Hello from Vercel!');
});
const roleRoutes = require("./routers/roles");
app.use("/", roleRoutes.router);

const shopRoutes = require("./routers/shops");
app.use("/shop", shopRoutes.router);

const general = require("./routers/general");
app.use("/general", general.router);

const haveRoles = require("./middlewear/haveRoles");
app.use(haveRoles);

const UsersControlers = require("./routers/users");
app.use("/user", UsersControlers.router);

const CartRoute = require("./routers/cart");
app.use("/cart", CartRoute.router);

app.use(erorreConntlroller.get404);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
