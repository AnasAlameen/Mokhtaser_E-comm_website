const session = require("express-session");
const db = require("../helpers/databas");
const bcrypt = require("bcryptjs");
const nodemailer=require("nodemailer");
const jwt = require('jsonwebtoken');

const transporter=nodemailer.createTransport({
  service:"gmail",
  host:"smtp.gmail.com",
  port:587,
  secure:false,
  auth:{
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
})
function generateResetToken(email) {
  const secret = process.env.JWT_SECRET; 
  const token = jwt.sign({ email }, secret, { expiresIn: '1h' });
  return token;
}

  // إرسال بريد إلكتروني لإعادة تعيين كلمة المرور
  async function sendResetEmail(email, token) {
    const resetUrl = `http://localhost:3000/resetPassword?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `لقد طلبت اعادة تعيين كلمة المرور . الرجاء اضغط ع الرابط لإستكمال العملية: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);
  }

  function verifyResetToken(token) {
    const secret =process.env.JWT_SECRET;
    try {
      const decoded = jwt.verify(token, secret);
      return decoded.email;
    } catch (error) {
      return null;
    }
  }

exports.getResetPasswordPage=async (req,res,next)=>{
  let errorMessage = req.flash("error");
  let successMessage = req.flash("success");

  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  if (successMessage.length > 0) {
    successMessage = successMessage[0];
  } else {
    successMessage = null;
  }
  res.render("resetPassword",{
    pageTitle:"rest Password",
    path:"resetPassword",
    errorMessage:errorMessage,
    successMessage:successMessage
  })
}

exports.postSendResetEmail = async (req, res, next) => {
  const email = req.body.email;
  console.log("email", email);
  try {
    const [search] = await db.execute("SELECT Email FROM users WHERE Email = ?", [email]);
    const [searchInSellers] = await db.execute("SELECT Emile FROM sellers WHERE Emile = ?", [email]);

    if (search.length > 0) {
     
      const token = generateResetToken(email);
      console.log("data",{
        email:email,
        token:token
      })
      await sendResetEmail(email, token);
      req.flash("success", "تم ارسال رابط  تعيين كلمة المرور ع البريد الاكتروني الرجاء التحقق")

      res.status(200).redirect("/reset");
    } else if(searchInSellers.length>0) {
      const token = generateResetToken(email);
      console.log("data",{
        email:email,
        token:token
      })
      await sendResetEmail(email, token);
      req.flash("success", "تم ارسال رابط  تعيين كلمة المرور ع البريد الاكتروني الرجاء التحقق")
      console.log("successMessage")

      res.status(200).redirect("/reset");
      
    }else{
      req.flash("error", "هذ البريد الالكتروني لا ينتمي لاي حساب");
      res.redirect("/reset");
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ error: "Error during sign-in" });  }
};

exports.postNewPasswordPage = async (req, res, next) => {
  console.log(req.body)
  const token = req.body.token;
  const newPassword = req.body.password;
  const email = verifyResetToken(token);

  console.log("dataa",{
    email:email,
    token:token,
    newPassword:newPassword
  })
  if (email) {
    await db.execute("UPDATE users SET Password = ? WHERE Email = ?", [newPassword, email]);
    req.flash('success', 'تم إعادة تعيين كلمة المرور بنجاح');
    res.status(200).redirect("/SingIn"); 
  } else {
    req.flash('error', 'لقد انتهت صلاحية الرابط');

    res.status(400).redirect("/SingIn"); 
    
  }
};

exports.getNewPasswordPage = (req, res, next) => {
  const token = req.query.token;
  let errorMessage = req.flash("error");
  let successMessage = req.flash("success");

  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  if (successMessage.length > 0) {
    successMessage = successMessage[0];
  } else {
    successMessage = null;
  }
  res.render("newPassword", {
    pageTitle: "New Password",
    path: "newPassword",
    token: token ,
    errorMessage:errorMessage,
    successMessage:successMessage
  });
};

exports.getRejister = async (req, res, next) => {
  try {
    const [categories] = await db.execute("SELECT * FROM categories where parent_id =0 ");
    console.log("categories", categories);
    res.render("shop/Rejister", {
      pageTitle: "Rejister",
      path: "shop/Rejister",
      categories: categories,
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في جلب الفئات الرئيسية" });
  }
};


exports.getSinIn = (req, res, next) => {
  let errorMessage = req.flash("error");
  let successMessage = req.flash("success");

  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  if (successMessage.length > 0) {
    successMessage = successMessage[0];
  } else {
    successMessage = null;
  }
  res.render("users/SingIn", {
    pageTitle: "Log In",
    path: "users/SingIn",
    errorMessage:errorMessage,
    successMessage:successMessage
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
      transporter.sendMail({
        to:req.body.email,
        from:"anas2002218@gmail.com",
        text:"done",
        html:"<li> done</li>",
      },(error,sesses)=>{
        if(error)
        {
          console.log(error);
        }else{
          console.log("email:sent"+sesses.response);
        }
      })
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
      req.session.storeId = user.id;
      req.session.username = user.FirstName;
      req.session.rol = "store";
      req.session.Categori = user.Catagori;
      req.session.type = "seller";

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
      transporter.sendMail({
        to:req.body.email,
        from:"anas2002218@gmail.com",
        text:"stignup succeeded",
        html:"<li> you sussesfuly signup</li>",
      },(error,sesses)=>{
        if(error)
        {
          console.log(error);
        }else{
          console.log("email:sent"+sesses.response);
        }
      })
      return res.status(201).redirect("/shop/home");
      // } else {

      // return res
      //   .status(401).redirect("/SingIn");
        
      // console.log("ksdiohfo");
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
        req.session.type = "user";

        return res.status(201).redirect("/user/Home");
      
        //   } else {
        //return res.status(401).json({ message: "Password incorrect", redirectUrl: "/LogIn" });
        // }
      }
    }

    console.log("The user does not exist");
    req.flash("error"," بريد الكتروني او كلمة مرور خاطئة")
    res.redirect("/SingIn")
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
      
            }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
};
