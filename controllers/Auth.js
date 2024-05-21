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
  console.log(req.body); // Log the entire request body to debug
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
    address, // Updated to match the form field name
    latitude,
    longitude,
  } = req.body;
  let Check1 = "select * from users where Email=?";
  let [CheckEmail] = await db.execute(Check1, [email]);
  if (CheckEmail) {
    let Check = "select * from sellers where Emile=?";
    let [CheckEmil] = await db.execute(Check, [email]);

    if (CheckEmil.length > 0) {
      console.log("The user already exists");
      res.status(409).send("The user already exists"); // Send a conflict status if the user exists
    } else {
      let hashPassword = await bcrypt.hash(password, 12);
      let [add, fields] = await db.execute(
        "INSERT INTO sellers (FirstName, LastName, Emile, PhoneNum, CompanyName, Catagori, Password, creationDate, license_number) VALUES (?, ?, ?, ?, ?, ?, ?, now(), ?)",
        [
          first_name,
          last_name,
          email,
          phone,
          company_name,
          activity_type,
          password,
          license_number,
        ]
      );
      const ShopId = add.insertId;
      await db.execute(
        "INSERT INTO location (seller_id, City, area, longtiud, lasttiud) VALUES (?, ?, ?, ?, ?)",
        [ShopId, city, address, longitude, latitude]
      );
      console.log("New user created");
      res.status(201).json({ message: "User created", redirectUrl: "/SingIn" }); // Send JSON response with redirect URL
    }
  } else {
    res.status(409).send("The user already exists"); // Send a conflict status if the user exists
  }
};
exports.CheckSingIn = async (req, res, next) => {
  const { email, password } = req.body;

  let Check = "SELECT * FROM sellers WHERE Emile = ?";
  let [CheckEmil] = await db.execute(Check, [email]);

  if (CheckEmil.length > 0) {
    // Check if user exists before accessing user object
    const user = CheckEmil[0];
    console.log("check", CheckEmil[0]);
    console.log("user", CheckEmil[0].Emile, "pas", CheckEmil[0].Password); // Log user details for verification

    const isMatch = await bcrypt.compare(password, CheckEmil[0].Password);
    // if (isMatch) {
    req.session.isLoggedIn = true;
    req.session.userId = user.id;
    req.session.username = user.FirstName;
    req.session.role="store"
    // ... store session data
    res.status(201).redirect("/shop/home");
    /*} else {
      console.log("Password incorrect");
      res
        .status(401)
        .json({ message: "Password incorrect", redirectUrl: "/LogIn" });
   // }*/
  } else {
    req.session.isLoggedIn = true;
    req.session.userId = user.id;
    req.session.username = user.FirstName;
    req.session.role="user"
    let Check = "SELECT * FROM users WHERE Email = ?";
    let [CheckEmil] = await db.execute(Check, [email]);
    if (CheckEmil.length > 0) {
      // Check if user exists before accessing user object
      const user = CheckEmil[0];
      console.log("check", CheckEmil[0]);
      console.log("user", CheckEmil[0].Email, "pas", CheckEmil[0].Password); // Log user details for verification
  
      const isMatch = await bcrypt.compare(password, CheckEmil[0].Password);
      // if (isMatch) {
      req.session.isLoggedIn = true;
      req.session.userId = user.id;
      req.session.username = user.FirstName;
      // ... store session data
      res.status(201).redirect("/user");
    }else{
      console.log("The user does not exist");
      res.status(409).send("The user does not exist");
    }

    
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

  try {
    // Check if the email already exists in the sellers table
    let checkSellerQuery = "SELECT * FROM sellers WHERE Emile = ?";
    let [checkSeller] = await db.execute(checkSellerQuery, [email]);

    if (checkSeller.length > 0) {
      res.status(409).send("The user already exists in sellers");
    } else {
      // Check if the email already exists in the users table
      let checkUserQuery = "SELECT * FROM users WHERE Email = ?";
      let [checkUser] = await db.execute(checkUserQuery, [email]);

      if (checkUser.length > 0) {
        res.status(409).send("The user already exists in users");
      } else {
        // Insert the new user into the users table
        let insertUserQuery =
          "INSERT INTO users (Password, birth_date, Phone, Email, LastName, FirstName, JoinDate) VALUES (?, ?, ?, ?, ?, ?, now())";
        let [userResult] = await db.execute(insertUserQuery, [
          password,
          birthdate,
          phone,
          email,
          last_name,
          first_name,
        ]);

        const userId = userResult.insertId;

        // Insert the user's location into the location table
        let insertLocationQuery =
          "INSERT INTO location (UserId, City, area, longtiud, lasttiud) VALUES (?, ?, ?, ?, ?)";
        await db.execute(insertLocationQuery, [
          userId,
          city,
          address,
          longitude,
          latitude,
        ]);

        res
          .status(201)
          .send("User added successfully. Redirecting to Sign In...");

        // Use setTimeout to allow the client to read the message before redirecting
          res.redirect("/SignIn");
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
};
