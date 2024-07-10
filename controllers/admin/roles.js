const db = require("../../helpers/databas");

exports.getAddEmploy = (req, res, next) => {
  res.render("shop/admin/addEmployee", {
    pageTitle: "Add Employee",
    path: "shop/addEmployee",
  });
};

exports.getSearches = async (req, res, next) => {
  const UserEmail = req.query.q.trim(); 
  const storeId = req.session.storeId;
  let Employees = [];
  const usersMap = {};

  try {
    console.log("Searching for UserEmail:", UserEmail);
    console.log("StoreId:", storeId);

    // استعلام SQL لجلب المستخدمين مع الأدوار
    const [usersWithRoles] = await db.execute(`
      SELECT u.id, u.FirstName, u.Email, u.url, s.role_id, r.name AS role
      FROM users u
      JOIN store_user_roles s ON u.id = s.user_id AND s.store_id = ?
      JOIN roles r ON s.role_id = r.id
      WHERE u.Email = ?
    `, [storeId, UserEmail]);
console.log("stored",usersWithRoles)
    // تحقق من استرجاع البيانات من قاعدة البيانات
    console.log("usersWithRoles:", usersWithRoles);

    // إذا لم يكن هناك أدوار للمستخدم في المتجر، قم بجلب البيانات الرئيسية فقط
    if (usersWithRoles.length === 0) {
      console.log("No roles found, fetching main data for user.");

      const [userMainData] = await db.execute(`SELECT * FROM users WHERE Email = ?`, [UserEmail]);

      console.log("userMainData:", userMainData);

      userMainData.forEach(user => {
        if (!usersMap[user.id]) {
          usersMap[user.id] = {
            name: user.FirstName,
            id: user.id,
            imageUrl: user.url,
            roles: [],
            hasRole: false
          };
        }
      });
      Employees = Object.values(usersMap);

    } else {
      // معالجة النتائج إذا كانت هناك أدوار
      usersWithRoles.forEach(user => {
        if (!usersMap[user.id]) {
          usersMap[user.id] = {
            name: user.FirstName,
            id: user.id,
            imageUrl: user.url,
            roles: [],
            hasRole: false,
            roleid:[]
          };
        }
        if (user.role) {
          usersMap[user.id].roleid.push(user.role_id);
          usersMap[user.id].roles.push(user.role);
          usersMap[user.id].hasRole = true;
        }
      });
      Employees = Object.values(usersMap);
    }

    console.log("Employees:", Employees); // التحقق من البيانات

    res.status(200).json(Employees);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
};
exports.postAddRole = async (req, res, next) => {
  const storeId = req.session.storeId;
  const { userId, roleId } = req.body;
  console.log("data", {
    userId: userId,
    roleId: roleId
  });

  try {
    // التحقق مما إذا كان الدور الحالي للمستخدم موجودًا
    const [existingRoles] = await db.execute(`
      SELECT role_id FROM store_user_roles WHERE user_id = ? AND store_id = ?
    `, [userId, storeId]);

    if (existingRoles.length > 0) {
      // حذف الأدوار الحالية
      await db.execute(`
        DELETE FROM store_user_roles WHERE user_id = ? AND store_id = ?
      `, [userId, storeId]);
      console.log("Existing roles deleted");
    }

    // إضافة الدور الجديد
    await db.execute(`
      INSERT INTO store_user_roles (role_id, user_id, store_id) VALUES (?, ?, ?)
    `, [roleId, userId, storeId]);
    console.log("Role added");

    res.status(200).redirect("/addEmployee");
  } catch (error) {
    console.error("Error adding role:", error);
    res.status(500).json({ message: "Server error" });
  }
};
