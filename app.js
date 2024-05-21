const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const db = require("./helpers/databas");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const csrf=require("csurf");

  

// إعداد تخزين الجلسات باستخدام MySQL
const sessionStore = new MySQLStore({}, db);

app.use(session({
  secret: 'mySecretKey',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true
}));
//const crsfProducation=csrf({});
//app.use(crsfProducation);


// استخدم middleware لمعالجة البيانات JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
//app.use((req,res,next)=>{
 // res.locals.csrfToken=req.csrfToken();
//next();
//})


// Set up view engine and views directory
app.set("view engine", "ejs"); // set up ejs for tem
app.set("views", "views"); // specify the view directory

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
console.log(express.static(path.join(__dirname, "public")));

const erorreConntlroller = require("./controllers/errore");
// Import and use routers for different parts of your application
const adminRoutes = require("./routers/admin");
app.use("/admin", adminRoutes.router);

const shopRoutes = require("./routers/shops");
app.use("/shop", shopRoutes.router);

const Auth = require("./routers/Auth");
app.use("/", Auth.router);

const UsersControlers = require("./routers/users");
app.use("/user", UsersControlers.router);

// Define a route for handling 404 errors
app.get("/", erorreConntlroller.get404);

//app.use("/",erorreConntlroller.get404);
app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});