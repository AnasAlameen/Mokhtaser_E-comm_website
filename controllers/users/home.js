const session = require("express-session");
const db = require("../../helpers/databas");
exports.getUserHomePage = async (req, res, next) => {
  const userId = req.session.userId; // تأكد من أن userId معرف بشكل صحيح

  if (!userId) {
      throw new Error("User ID is undefined");
  }
  try {
    const query = `
      SELECT p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate, MIN(pi.url) AS image_url
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.productId
      GROUP BY p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate;
    `;
        const mostSoildQuery = `
        SELECT p.id, p.ProductName, p.Discrption, p.solid, p.Prise, p.CrationDate, MIN(pi.url) AS image_url
        FROM products p
        INNER JOIN product_images pi ON p.id = pi.productId
        GROUP BY p.id, p.ProductName, p.Discrption, p.solid, p.Prise, p.CrationDate
        ORDER BY p.solid DESC
        LIMIT 5;
    `;

    const [mostSoildRows] = await db.execute(mostSoildQuery);
    const [rows, fields] = await db.execute(query);
    const [categories]= await db.execute("select name, url,id from categories where parent_id =0")

    console.log("categories",categories)
    let role = req.session.role || "";

    res.render("users/home", {
      pageTitle: "Home page",
      path: "users/home",
      products: rows, 
      role:role,
      categories:categories,
      mostSoildQuery:mostSoildRows

    });
  } catch (error) {
    console.error("Error retrieving featured products:", error);
    res.status(500).json({ error: "Error retrieving featured products" });
  }
};

exports.getproductDetals = async (req, res, next) => {
  const productId = req.query.product_id;

  if (!productId) {
    return res.status(400).send("معرف المنتج مطلوب");
  }

  try {
    const product = await getProductDetails(productId);
    if (!product) {
      return res.status(404).send("المنتج غير موجود");
    }

    const imageURLs = await getProductImages(productId);
    const { colors, sizes, seller } = await getProductVariants(productId);

    console.log('Colors:', colors); // للتحقق من البيانات

    res.render("users/productDetals", {
      pageTitle: "تفاصيل المنتج",
      path: "users/productDetals",
      product: product,
      imageURLs: imageURLs,
      seller: seller, // عرض معلومات البائع
      colors: colors || [], // استخدم مصفوفة فارغة إذا كانت colors غير معرفة
      sizes: sizes || {}, // استخدم كائن فارغ إذا كانت sizes غير معرفة
      csrfToken: req.csrfToken()
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};


async function getProductDetails(productId) {
  const query = "SELECT `id`, `SellerId`, `Prise`, `Discrption`, `ProductName`, `solid`, `qty` FROM products WHERE id = ?";
  const [results] = await db.execute(query, [productId]);
  return results[0];
}

async function getProductImages(productId) {
  const query = "SELECT url FROM product_images WHERE productId = ?";
  const [results] = await db.execute(query, [productId]);
  return results.map(row => row.url);
}

async function getProductVariants(productId) {
  const colorQuery = `
    SELECT vi.url, vi.id, vo.value as color, vo.id as variantId, vo.qty
    FROM variants v
    INNER JOIN variant_options vo ON v.id = vo.VariantsId
    LEFT JOIN variant_images vi ON vo.id = vi.variant_option_id
    WHERE v.product_id = ? AND v.VariantsType = 'color'
  `;

  const sizeQuery = `
    SELECT vo.value as size, vo.id, vo.qty, v.VariantsType as unit
    FROM variants v
    INNER JOIN variant_options vo ON v.id = vo.VariantsId
    WHERE v.product_id = ? AND v.VariantsType != 'color'
  `;

  const sellerQuery = `
    SELECT s.CompanyName, s.url, p.SellerId
    FROM sellers s
    INNER JOIN products p ON s.id = p.SellerId
    WHERE p.id = ?
  `;

  try {
    const [colorResults] = await db.execute(colorQuery, [productId]);
    const [sizeResults] = await db.execute(sizeQuery, [productId]);
    const [sellerResults] = await db.execute(sellerQuery, [productId]);

    console.log(sellerResults,"seller")
    return {
      colors: colorResults,
      sizes: sizeResults,
      seller: sellerResults[0] // يجب أن تكون نتيجة واحدة فقط للبائع
    };
  } catch (error) {
    console.error('Error fetching product variants:', error);
    throw error;
  }
}



function organizeSizesByUnit(sizes) {
  return sizes.reduce((acc, size) => {
    if (!acc[size.unit]) {
      acc[size.unit] = [];
    }
    acc[size.unit].push(size);
    return acc;
  }, {});
}

async function checkAvailability(product, colors, sizes) {
  let availability = {
    hasColors: colors.length > 0,
    hasSizes: sizes.length > 0,
    availableColors: [],
    availableSizes: [],
    isAvailable: true,
    message: ""
  };

  if (!colors.length && !sizes.length) {
    availability.isAvailable = product.qty > 0;
    availability.message = availability.isAvailable ? "" : "نفدت الكمية";
  } else if (colors.length && !sizes.length) {
    availability.availableColors = colors.filter(color => color.qty > 0);
    availability.isAvailable = availability.availableColors.length > 0;
    availability.message = availability.isAvailable ? "" : "نفدت جميع الألوان";
  } else if (sizes.length) {
    availability.availableSizes = sizes.filter(size => size.qty > 0);
    availability.isAvailable = availability.availableSizes.length > 0;
    availability.message = availability.isAvailable ? "" : "نفدت جميع المقاسات";
  }

  return availability;
}
  
  
  exports.getCart = (req, res, next) => {
    res.render("shop/cart", {
      pageTitle: "cart",
      path: "shope/home",
    });
  };
  exports.getOrders = (req, res, next) => {
    res.render("shop/orders", {
      pageTitle: "Orders",
      path: "shope/orders",
    });
  };
  // exports.getOrderDetals = (req, res, next) => {
  //   res.render("shop/orderDetals", {
  //     pageTitle: "Order Details",
  //     path: "shope/orders/details",
  //   });
  // };
  
  // exports.getHopePageProducts = async (req, res, next) => {};
  
  // exports.getProductList = (req, res, next) => {
  //   res.render("shop/productList", {
  //     pageTitle: "Product List",
  //     path: "shop/productList",
  //   });
  // };
  exports.getProfile = (req, res, next) => {
    res.render("shop/profile", {
      pageTitle: "Prfile",
      path: "shop/profile",
    });
  };
  exports.getStores = async (req, res, next) => {
    const userId = req.session.userId; 
    if (!userId) {
      throw new Error("User ID is undefined");
    }
  
    try {
      const [stores] = await db.execute(`
        SELECT sr.store_id, s.CompanyName, s.id
        FROM store_user_roles sr
        INNER JOIN sellers s ON sr.store_id = s.id
        WHERE sr.user_id = ?
      `, [userId]);
  
      res.render("includes/users/Navgation", {
        path: "includes/users/Navgation",
        stores: stores,
      });
    } catch (error) {
      console.error("Error retrieving stores:", error);
      res.status(500).json({ error: "Error retrieving stores" });
    }
  };
  exports.getsubCategoriesPage = async (req, res, next) => {
    const subCategorieId = req.query.subCategorieId;
    const name = req.query.name;

   
    try {
        const query = `
        SELECT p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate, MIN(pi.url) AS image_url
        FROM products p
        INNER JOIN product_images pi ON p.id = pi.productId
        GROUP BY p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate;
      `;
      const [rows, fields] = await db.execute(query);
      // التأكد من أن الاتصال بقاعدة البيانات مفتوح
      if (!db) {
        throw new Error("Database connection is closed");
      }
  
      // استعلام لجلب الفئات
      const [productByCategory] = await db.execute(
        'SELECT * FROM categories WHERE parent_id = ?', [subCategorieId]
      );
      
  
      // استعلام لجلب المنتجات
      const [products] = await db.execute(
        'SELECT * FROM products WHERE categorie = ?', [subCategorieId]
      );
  
      let productss = products || [];
      res.render("users/subCategoriesPage", {
        pageTitle: "الفئات الفرعية",
        path: "users/subCategoriesPage",
        productByCategory: productByCategory,
        name: name,
        products: rows
      });
    } catch (error) {
      console.log("subCategoriesPage" + error);
      res.status(500).json({ message: "error getting subCategoriesPage" });
    }
  }
  exports.getsubCategoriesProducts = async (req, res, next) => {

    const subCategorieId=req.query.subCategorieId;
    console.log("ffffffff1 ",subCategorieId)
    try {
      const query = `
      SELECT p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate, MIN(pi.url) AS image_url,c.id
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.productId
      inner join categories c on p.categorie=c.id
      where p.categorie=?
      GROUP BY p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate;
    `;
    const categorieName= db.execute(`select name from categories where id =? `,[subCategorieId]);
    const [rows, fields] = await db.execute(query,[subCategorieId]);
      res.render("users/subcategoriesProduct", {
        pageTitle: "المنتحات",
        path: "users/subcategoriesProduct",
        products: rows
      });
      
    } catch (error) {
      console.log("con`t get subCategoriesProducts"+error);
      res.status(500).json({message : "con`t get subCategoriesProducts"})
    }


  }
  exports.getSearchResults = async (req, res, next) => {
    let searchInput = req.query.keyword;
    console.log("searchInput", searchInput);
  
    if (!searchInput) {
      return res.status(400).send({ error: "يرجى إدخال قيمة للبحث" });
    }
  
    try {
      const query = `
        SELECT p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate, MIN(pi.url) AS image_url
        FROM products p
        INNER JOIN product_images pi ON p.id = pi.productId
        WHERE p.ProductName LIKE ?
        GROUP BY p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate;
      `;
  
      const [rows, fields] = await db.execute(query, [`%${searchInput}%`]);
      console.log("rows",rows)
      res.render("users/SerchResult", {
        pageTitle: "صفحة البحث",
        path: "users/subcategoriesProduct",
        products: rows
      });
    } catch (error) {
      console.error("Error retrieving search results:", error);
      res.status(500).send({ error: "هناك خطأ في تحميل صفحة البحث" });
    }
  };
  exports.getOrdersTracking = async (req, res) => {
    const user_id = req.session.userId;
    
    const query = `
    SELECT o.id AS orderNumber, o.ProductId, o.Qwnatity, o.Prise, o.VOCId, o.VOId, o.CreatDate, o.status, o.UserId,
    pi.url AS image_url, p.ProductName, p.Discrption, s.PhoneNum, s.CompanyName, loc.City, loc.area, s.id AS SellerId
    FROM orders o
    INNER JOIN product_images pi ON o.ProductId = pi.productId
    INNER JOIN products p ON o.ProductId = p.id
    INNER JOIN sellers s ON p.SellerId = s.id
    LEFT JOIN location loc ON loc.UserId = o.UserId
    WHERE o.UserId = ? and o.status != "Pending Preparation"
    ORDER BY o.CreatDate, s.id
    `;

    try {
        const [rows] = await db.execute(query, [user_id]);
        if (rows.length === 0) {
            return res.render("users/OrdersTrack", {
                pageTitle: "Orders",
                path: "users/OrdersTrack",
                groupedOrders: {}
            });
        }

        const groupedOrders = {};
        
        rows.forEach((row) => {
            const orderKey = `${row.SellerId}_${new Date(row.CreatDate).getTime()}`;
            
            if (!groupedOrders[orderKey]) {
                groupedOrders[orderKey] = {
                    orderId: row.orderNumber,
                    sellerId: row.SellerId,
                    companyName: row.CompanyName,
                    status: row.status,
                    phoneNum: row.PhoneNum,
                    city: row.City,
                    area: row.area,
                    createdAt: row.CreatDate,
                    products: {}
                };
            }

            if (!groupedOrders[orderKey].products[row.ProductId]) {
                groupedOrders[orderKey].products[row.ProductId] = {
                    ...row,
                    quantity: 0,
                    variants: []
                };
            }

            groupedOrders[orderKey].products[row.ProductId].quantity += row.Qwnatity;
            groupedOrders[orderKey].products[row.ProductId].variants.push({
                VOCId: row.VOCId,
                VOId: row.VOId,
                quantity: row.Qwnatity
            });
        });

        for (const key in groupedOrders) {
            const order = groupedOrders[key];
            for (const productId in order.products) {
                const product = order.products[productId];
                const colorPromises = product.variants.map(async (variant) => {
                    if (variant.VOCId) {
                        const [colorRows] = await db.execute('SELECT value FROM variant_options WHERE id = ?', [variant.VOCId]);
                        return colorRows[0] ? colorRows[0].value : null;
                    }
                    return null;
                });
                const optionPromises = product.variants.map(async (variant) => {
                    if (variant.VOId) {
                        const [optionRows] = await db.execute('SELECT value FROM variant_options WHERE id = ?', [variant.VOId]);
                        return optionRows[0] ? optionRows[0].value : null;
                    }
                    return null;
                });

                product.colors = await Promise.all(colorPromises);
                product.options = await Promise.all(optionPromises);
            }
        }

        res.render("users/OrdersTrack", {
            pageTitle: "OrdersTrack",
            path: "users/OrdersTrack",
            groupedOrders: groupedOrders
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({error: "error in OrdersTracking "});
    }
}
exports.getProfile = async (req, res) => {
  const user_id = req.session.userId;
  console.log("userId", user_id);
  try {
    // الحصول على معلومات المستخدم
    const [getUserInformationsResult] = await db.execute("SELECT * FROM users WHERE id = ?", [user_id]);
    console.log("getUserInformations", getUserInformationsResult);

    if (getUserInformationsResult.length === 0) {
      return res.status(404).json({ success: false, error: "لم يتم العثور على معلومات المستخدم" });
    }

    const getUserInformations = getUserInformationsResult[0];

    // الحصول على المنتجات في سلة التسوق
    const [getFromCart] = await db.execute(`
      SELECT
        p.id, p.ProductName, p.Prise, p.Discrption,
        l.City, l.area, l.longtiud, l.lasttiud,
        (SELECT i.url FROM product_images i WHERE i.ProductId = p.id LIMIT 1) AS url
      FROM shopping_carts c
      INNER JOIN products p ON p.id = c.ProductId
      LEFT JOIN location l ON l.UserId = c.UserId
      WHERE c.UserId = ?
      GROUP BY p.id, p.ProductName, p.Discrption, p.Prise
    `, [user_id]);

    console.log("getFromCart", getFromCart);

    // الحصول على معلومات الموقع
    const [locationInfo] = await db.execute("SELECT * FROM location WHERE UserId = ?", [user_id]);
    const location = locationInfo[0] || {};

    // تحضير البيانات للعرض
    const products = getFromCart;

    res.render("users/profile", {
      pageTitle: `الملف الشخصي - ${getUserInformations.FirstName}`,
      path: "users/profile",
      getUserInformations: getUserInformations,
      userInfo: getUserInformations, // إضافة هذا السطر
      products: products,
      location: location,
      cartItemsCount: products.length
    });
  } catch (error) {
    console.log("حدث خطأ أثناء جلب البيانات: ", error);
    res.status(500).json({ success: false, error: "حدث خطأ أثناء جلب معلومات المستخدم" });
  }
};


exports.postProfileUpdate = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { firstName, lastName, birthDate, city, area, latitude, longitude } = req.body;
    
    // تحقق من وجود ملف صورة جديد
    let profileImageUrl;
    if (req.files && req.files.profileImage && req.files.profileImage[0]) {
      profileImageUrl = req.files.profileImage[0].path;
    } else {
      // إذا لم يتم تحميل صورة جديدة، استخدم الصورة الحالية
      profileImageUrl = req.body.currentProfileImage;
    }

    // تحديث بيانات المستخدم في قاعدة البيانات
    const updateUserQuery = `
      UPDATE users 
      SET FirstName = ?, LastName = ?, birth_date = ?, url = ?
      WHERE id = ?
    `;
    await db.execute(updateUserQuery, [firstName, lastName, birthDate, profileImageUrl, userId]);

    // تحديث بيانات الموقع
    const updateLocationQuery = `update location
    set City=? , lasttiud=?,longtiud=?, area=?
    where UserId =?`
    await db.execute(updateLocationQuery, [city, latitude, longitude, area, userId]);

    res.json({ success: true, message: "تم تحديث البيانات الشخصية بنجاح" });
  } catch (error) {
    console.error("خطأ في تحديث الملف الشخصي:", error);
    res.status(500).json({ success: false, error: "حدث خطأ أثناء تحديث البيانات الشخصية" });
  }
};