const session = require("express-session");
const db = require("../helpers/databas");
const bcrypt = require("bcryptjs");

exports.getRejister = (req, res, next) => {
  res.render("shop/Rejister", {
    pageTitle: "Rejister",
    path: "shop/Rejister",
  });
};

exports.getSinIn = (req, res, next) => {
  res.render("users/SingIn", {
    pageTitle: "Sing In",
    path: "users/SingIn",
  });
};

exports.postRejister = async (req, res, next) => {
  console.log(req.body); // طباعة محتويات body للتأكد من استقبالها
  console.log(req.files); // طباعة محتويات files للتأكد من استقبالها
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    company_name,
    activity_type,
    city,
    license_number,
    address,
    latitude,
    longitude,
  } = req.body;

  const personalImage = req.files["personalImage"]
    ? req.files["personalImage"][0].path
    : null;

  let Check1 = "select * from users where Email=?";
  let [CheckEmail] = await db.execute(Check1, [email]);
  let Check2 = "select * from sellers where Emile=?";
  let [CheckEmail2] = await db.execute(Check2, [email]);
  if (CheckEmail.length > 0) {
    res.status(409).send("The user already exists"); // إذا كان المستخدم موجود بالفعل
  } else {
    if (CheckEmail2.length > 0) {
      res.status(409).send("The user already exists"); // إذا كان المستخدم موجود بالفعل
    } else {
      let hashPassword = await bcrypt.hash(password, 12);
      let [add, fields] = await db.execute(
        "INSERT INTO sellers (FirstName, LastName, Emile, PhoneNum, CompanyName, Catagori, Password, creationDate, license_number, url) VALUES (?, ?, ?, ?, ?, ?, ?, now(), ?, ?)",
        [
          first_name,
          last_name,
          email,
          phone,
          company_name,
          activity_type,
          password,
          license_number,
          personalImage,
        ]
      );
      const ShopId = add.insertId;
      await db.execute(
        "INSERT INTO location (seller_id, City, area, longtiud, lasttiud) VALUES (?, ?, ?, ?, ?)",
        [ShopId, city, address, longitude, latitude]
      );
      await db.execute(
        "INSERT INTO store_user_roles (store_id , role_id ) VALUES (?, 1)",
        [ShopId]
      );
      console.log("New user created");
      res.status(201).redirect("/SingIn");
    }
  }
};

exports.CheckSingIn = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    // Check if the email exists in sellers
    let Check = "SELECT * FROM sellers WHERE Emile = ? and Password=?";
    let [CheckEmil] = await db.execute(Check, [email, password]);

    if (CheckEmil.length > 0) {
      const user = CheckEmil[0];
      const isMatch = await bcrypt.compare(password, user.Password);

      //  if (isMatch) {
      req.session.isLoggedIn = true;
      req.session.userId = user.id;
      req.session.username = user.FirstName;
      req.session.role = "store";
      req.session.Categori = user.Catagori;
      let roleCheck = `
      SELECT r.name as roleName 
      FROM sellers s
      INNER JOIN store_user_roles sur ON s.id = sur.store_id
      INNER JOIN roles r ON sur.role_id = r.id
      WHERE s.Emile = ? AND s.Password = ?
    `;
      let [roleResult] = await db.execute(roleCheck, [email, password]);

      if (roleResult.length > 0) {
        req.session.roles = roleResult[0].roleName;
      } else {
        req.session.role = null;
      }
      console.log(req.session.roles + " rolse");
      return res.status(201).redirect("/shop/home");
      // } else {
      return res
        .status(401)
        .json({ message: "Password incorrect", redirectUrl: "/LogIn" });
      console.log("ksdiohfo");
      // }
    } else {
      // Check if the email exists in users
      Check = "SELECT * FROM users WHERE Email = ? and Password=?";
      [CheckEmil] = await db.execute(Check, [email, password]);

      if (CheckEmil.length > 0) {
        const user = CheckEmil[0];
        const isMatch = await bcrypt.compare(password, user.Password);

        // if (isMatch) {
        req.session.isLoggedIn = true;
        req.session.userId = user.id;
        req.session.username = user.FirstName;
        req.session.role = "user";
        console.log("hhhhhh");

        return res.status(201).redirect("/user/Home");
        //   } else {
        //return res.status(401).json({ message: "Password incorrect", redirectUrl: "/LogIn" });
        // }
      }
    }

    console.log("The user does not exist");
    res.status(409).send("The user does not exist OR PASSORD RONG");
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ error: "Error during sign-in" });
  }
};
exports.LogOut = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("http://localhost:3000/SingIn");
  });
};
exports.getRejisterUser = (req, res, next) => {
  res.render("users/Rejister", {
    pageTitle: "Rejister User",
    path: "users/Rejister",
  });
};
exports.postRegisterUser = async (req, res, next) => {
  console.log(req.body);
  console.log(req.files);
  const {
    latitude,
    longitude,
    address,
    password,
    birthdate,
    city,
    phone,
    email,
    last_name,
    first_name,
  } = req.body;

  const personalImage = req.files["personalImage"]
    ? req.files["personalImage"][0].path
    : null;

  try {
    let checkUserQuery = "SELECT * FROM users WHERE Email = ?";
    let [checkUser] = await db.execute(checkUserQuery, [email]);

    let Check2 = "select * from sellers where Emile=?";
    let [CheckEmail2] = await db.execute(Check2, [email]);
    if (checkUser.length > 0) {
      res.status(409).send("The user already exists in users");
    } else {
      if (CheckEmail2.length > 0) {
        res.status(409).send("The user already exists in users");
      } else {
        let hashPassword = await bcrypt.hash(password, 12);
        let insertUserQuery =
          "INSERT INTO users (Password, birth_date, Phone, Email, LastName, FirstName, JoinDate, url) VALUES (?, ?, ?, ?, ?, ?, now(), ?)";
        let [userResult] = await db.execute(insertUserQuery, [
          password,
          birthdate,
          phone,
          email,
          last_name,
          first_name,
          personalImage,
        ]);

        const userId = userResult.insertId;

        let insertLocationQuery =
          "INSERT INTO location (UserId, City, area, longtiud, lasttiud) VALUES (?, ?, ?, ?, ?)";
        await db.execute(insertLocationQuery, [
          userId,
          city,
          address,
          longitude,
          latitude,
        ]);
        res.status(201).redirect("http://localhost:3000/SingIn");
        console.log(":d");
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
};

exports.getRoles = async (req, res, next) => {
  const storeId = req.query.storeId;
  const role = req.query.role;

  try {
    const query = `
      SELECT p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate, MIN(pi.url) AS image_url
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.productId
      GROUP BY p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate;
    `;
    const [rows, fields] = await db.execute(query);
    const [store] = await db.execute(
      "SELECT * FROM stores WHERE store_id = ?",
      [storeId]
    );
    if (store.length > 0) {
      res.render("shop/home", {
        pageTitle: "Home page",
        path: "shop/home",
        products: rows, // Passing the fetched products to the view
        role: role,
        store: store[0],
      });
    } else {
      res.status(404).send("Store not found");
    }
  } catch (error) {
    console.error("Error fetching store data:", error);
    res.status(500).send("Internal Server Error");
  }
};
