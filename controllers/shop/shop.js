const db = require("../../helpers/databas");

exports.getproductDetals = async (req, res, next) => {
  const productId = req.query.product_id;
  const view = req.session.role || 'store';
  const storeId = req.session.storeId;

  let type;
  if (!productId) {
    return res.status(400).send("معرف المنتج مطلوب");
  }

  try {
    // Initialize sizeOptions before using it
    const sizeOptions = {};

    // جلب صور المنتج
    const imageQuery = "SELECT url FROM product_images WHERE productId = ?";
    const [imageResults] = await db.execute(imageQuery, [productId]);
    const imageURLs = imageResults.map((row) => row.url);

    console.log("Image URLs:", imageURLs);

    // جلب تفاصيل المنتج
    const productQuery =
      "SELECT `SellerId`, `id`, `Prise`, `Discrption`, `ProductName`, `SellerId`,numberOfPises FROM products WHERE id = ?";
    const [productResults] = await db.execute(productQuery, [productId]);
    const product = productResults[0];
    if (storeId === productResults[0].SellerId) {
      type = true;
    }
    console.log("fffff", {
      storeId: storeId,
      productQuery: productResults[0].SellerId,
      imageQuery: productResults
    });

    console.log("Product Details:", product);

    // جلب صورة الألوان المتاحة
    const variantImageQuery = `
      SELECT vi.url, vo.id as option_id, vo.value as color, vo.qty, vo.prise
      FROM variants v
      INNER JOIN variant_options vo ON v.id = vo.VariantsId
      INNER JOIN variant_images vi ON vo.id = vi.variant_option_id
      WHERE v.product_id = ? AND v.VariantsType = 'color'
    `;
    const [variantImageResults] = await db.execute(variantImageQuery, [productId]);

    // جلب خيارات الأحجام المتاحة
    const variantOptionsQuery = `
      SELECT vo.id, vo.value as size, vo.qty,v.VariantsType, vo.prise, r.parent_option_id as color_id, r.child_option_id as option_id
      FROM variants v
      INNER JOIN variant_options vo ON v.id = vo.VariantsId
      LEFT JOIN variant_relations r ON vo.id = r.child_option_id
      WHERE v.product_id = ? AND v.VariantsType != 'color'
    `;
    const [variantOptionsResults] = await db.execute(variantOptionsQuery, [productId]);

    const sellerQuery = `
    SELECT s.CompanyName, s.url, p.SellerId
    FROM sellers s
    INNER JOIN products p ON s.id = p.SellerId
    WHERE p.id = ?
  `;
  const [sellerResults] = await db.execute(sellerQuery, [productId]);

    console.log("Variant Options Results:", variantOptionsResults);

    // تنظيم بيانات الألوان والأحجام
    const colorImages = {};
    const allSizes = new Set();

    variantImageResults.forEach(row => {
      if (!colorImages[row.option_id]) {
        colorImages[row.option_id] = {
          color: row.color,
          image: row.url,
          price: row.prise,
          qty: row.qty
        };
      }
    });

    variantOptionsResults.forEach(row => {
      allSizes.add(row.size); // جمع جميع المقاسات في مجموعة
      if (!row.color_id) {
        // تعامل مع الحالة التي لا تحتوي على ألوان
        if (!sizeOptions[0]) {
          sizeOptions[0] = [];
        }
        sizeOptions[0].push({
          id: row.id,
          size: row.size,
          qty: row.qty,
          price: row.prise
        });
      } else {
        if (!sizeOptions[row.color_id]) {
          sizeOptions[row.color_id] = [];
        }
        sizeOptions[row.color_id].push({
          id: row.id,
          size: row.size,
          qty: row.qty,
          price: row.prise
        });
      }
    });

    const combinations = Object.keys(colorImages).length > 0
      ? Object.keys(colorImages).map(colorId => ({
        colorId: colorId,
        color: colorImages[colorId].color,
        image: colorImages[colorId].image,
        price: colorImages[colorId].price,
        qty: colorImages[colorId].qty,
        sizes: sizeOptions[colorId] || []
      }))
      : [{
        colorId: 0,
        color: "No Color",
        image: imageURLs.length > 0 ? imageURLs[0] : null,
        sizes: sizeOptions[0] || []
      }];

    console.log("Combinations:", combinations);
    console.log("allSizes:", allSizes);

    // بعد استدعاء variantOptionsQuery
    const sizeTypes = {};
    variantOptionsResults.forEach(row => {
      const sizeType = row.VariantsType || 'default'; // استخدم 'default' إذا لم يكن هناك نوع محدد
      if (!sizeTypes[sizeType]) {
        sizeTypes[sizeType] = new Set();
      }
      sizeTypes[sizeType].add(row.size);

      if (!sizeOptions[row.color_id]) {
        sizeOptions[row.color_id] = {};
      }
      if (!sizeOptions[row.color_id][sizeType]) {
        sizeOptions[row.color_id][sizeType] = [];
      }
      sizeOptions[row.color_id][sizeType].push({
        id: row.id,
        size: row.size,
        qty: row.qty,
        price: row.prise
      });
    });

    // تحويل sizeTypes إلى مصفوفة لسهولة استخدامها في العرض
    const sizeTypesArray = Object.keys(sizeTypes).map(type => ({
      type: type,
      sizes: Array.from(sizeTypes[type])
    }));

    if (view === 'user') {
      console.log(view + "uuuuuuuuuuuuuuuuuuuu")
      res.render("users/productDetals", {
        pageTitle: "تفاصيل المنتج ",
        path: "users/productDetals",
        product: product,
        imageURLs: imageURLs,
        combinations: combinations,
        allSizes: Array.from(allSizes), // تمرير جميع المقاسات إلى العرض
        csrfToken: req.csrfToken(),
        productId: productId,
        sizeTypes: sizeTypesArray,
        sellerResults:sellerResults[0]

      });
    } else {
      console.log(view + "ssssssssssssssssssssssss")

      res.render("shop/productDetals", {
        pageTitle: "تفاصيل المنتج",
        path: "shop/productDetals",
        product: product,
        imageURLs: imageURLs,
        combinations: combinations,
        allSizes: Array.from(allSizes), // تمرير جميع المقاسات إلى العرض
        csrfToken: req.csrfToken(),
        productId: productId,
        type: type,
        sizeTypes: sizeTypesArray,
                sellerResults:sellerResults[0]
 
      });
    }

  } catch (err) {
    console.error(err);
    next(err);
  }
};


exports.getShopeHomePage = async (req, res, next) => {
  try {
    const query = `
      SELECT p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate, MIN(pi.url) AS image_url
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.productId
      GROUP BY p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate;
    `;
    const [rows, fields] = await db.execute(query);
    const [categories]= await db.execute("select name, url,id from categories where parent_id =0")
    const mostSoildQuery = `
    SELECT p.id, p.ProductName, p.Discrption, p.solid, p.Prise, p.CrationDate, MIN(pi.url) AS image_url
    FROM products p
    INNER JOIN product_images pi ON p.id = pi.productId
    GROUP BY p.id, p.ProductName, p.Discrption, p.solid, p.Prise, p.CrationDate
    ORDER BY p.solid DESC
    LIMIT 5;
`;

const [mostSoildRows] = await db.execute(mostSoildQuery);
    let role = req.session.role || "";

    res.render("shop/home", {
      pageTitle: "Home page",
      path: "shop/home",
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




exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    pageTitle: "Orders",
    path: "shope/orders",
  });
};
exports.getOrderDetals = (req, res, next) => {
  res.render("shop/orderDetals", {
    pageTitle: "Order Details",
    path: "shope/orders/details",
  });
};

exports.getHopePageProducts = async (req, res, next) => {};

exports.getProductList = (req, res, next) => {
  res.render("shop/productList", {
    pageTitle: "Product List",
    path: "shop/productList",
  });
};
exports.getProfile = (req, res, next) => {
  res.render("shop/profile", {
    pageTitle: "Prfile",
    path: "shop/profile",
  });
};
exports.getRoles = async (req, res, next) => {
  
  const storeId = req.query.storeId;
  const role = req.query.role;
  req.session.role =role;
  req.session.isLoggedIn = true;
  req.session.storeId = storeId;
  try {
    const query = `
      SELECT p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate, MIN(pi.url) AS image_url
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.productId
      GROUP BY p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate;
    `;
    const [rows, fields] = await db.execute(query);
    const [stores] = await db.execute(`
    SELECT sr.store_id, sr.role_id, s.CompanyName, s.id
    FROM store_user_roles sr
    INNER JOIN sellers s ON sr.store_id = s.id
    WHERE sr.store_id = ?
`, [storeId]);
const [categories]= await db.execute("select name, url,id from categories where parent_id =0")
const mostSoildQuery = `
SELECT p.id, p.ProductName, p.Discrption, p.solid, p.Prise, p.CrationDate, MIN(pi.url) AS image_url
FROM products p
INNER JOIN product_images pi ON p.id = pi.productId
GROUP BY p.id, p.ProductName, p.Discrption, p.solid, p.Prise, p.CrationDate
ORDER BY p.solid DESC
LIMIT 5;
`;

const [mostSoildRows] = await db.execute(mostSoildQuery);
let role = req.session.role || "";

      console.log(role+"fsdf")
      if (stores.length > 0) {
      res.render("shop/home", {
        pageTitle: "Home page",
        path: "shop/home",
        products: rows, // Passing the fetched products to the view
        role: role,
        categories:categories,
        mostSoildQuery :mostSoildRows
      });
     
    
    } else {
      res.status(404).send("Store not found");
    }

  } catch (error) {
    console.error("Error fetching store data:", error);
    res.status(500).send("Internal Server Error");
  }
  
}; 
exports.getProfile = async (req, res) => {
  const sellerId = req.session.storeId;
  try {
      // الحصول على معلومات البائع
      const [sellerInfo] = await db.execute(`
          SELECT s.LastName, s.FirstName, s.Emile, s.PhoneNum, s.CompanyName, s.url, l.City, l.area, l.longtiud, l.lasttiud, s.id AS seller_id
          FROM sellers s
          LEFT JOIN location l ON s.id = l.seller_id
          WHERE s.id = ?
      `, [sellerId]);

      if (sellerInfo.length === 0) {
          return res.status(404).json({ success: false, error: "لم يتم العثور على معلومات البائع" });
      }

      // الحصول على المنتجات مع صورة واحدة لكل منتج
      const [products] = await db.execute(`
          SELECT p.id AS product_id, p.ProductName, p.Discrption, p.Prise, 
                 (SELECT i.url FROM product_images i WHERE i.productId = p.id LIMIT 1) AS product_url
          FROM products p
          WHERE p.SellerId = ?
      `, [sellerId]);

      console.log("معلومات البائع:", sellerInfo[0]);
      console.log("المنتجات:", products);

      res.render("shop/profile", {
          pageTitle: "الملف الشخصي",
          path: "shop/profile",
          getStoreInformations: sellerInfo[0],
          products: products
      });
  } catch (error) {
      console.log("حدث خطأ أثناء جلب البيانات: ", error);
      res.status(500).json({ success: false, error: "حدث خطأ أثناء جلب معلومات المستخدم" });
  }
};
  exports.postProfileUpdate = async (req, res) => {
    try {
        const sellerId = req.session.storeId;
        const { lastName, birthDate, city, area, latitude, longitude } = req.body;
        let profileImageUrl;
        if (req.files && req.files.profileImage && req.files.profileImage[0]) {
            profileImageUrl = req.files.profileImage[0].path;
        } else {
            // إذا لم يتم تحميل صورة جديدة، استخدم الصورة الحالية
            profileImageUrl = req.body.currentProfileImage;
        }

        // تحديث بيانات المستخدم في قاعدة البيانات
        const updateUserQuery = `
            UPDATE sellers 
            SET CompanyName = ?, url = ?
            WHERE id = ?
        `;
        await db.execute(updateUserQuery, [lastName, profileImageUrl, sellerId]);

        // تحديث بيانات الموقع
        const updateLocationQuery = `
            UPDATE location
            SET City = ?, lasttiud = ?, longtiud = ?, area = ?
            WHERE seller_id = ?
        `;
        await db.execute(updateLocationQuery, [city, latitude, longitude, area, sellerId]);

        res.json({ success: true, message: "تم تحديث البيانات الشخصية بنجاح" });
    } catch (error) {
        console.error("خطأ في تحديث الملف الشخصي:", error);
        res.status(500).json({ success: false, error: "حدث خطأ أثناء تحديث البيانات الشخصية" });
    }
};
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