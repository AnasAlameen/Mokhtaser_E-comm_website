const db = require("../../helpers/databas");

exports.getproductDetals = async (req, res, next) => {
  const productId = req.query.product_id;
  const view = req.query.view || 'store';

  if (!productId) {
    return res.status(400).send("معرف المنتج مطلوب");
  }

  try {
    // جلب صور المنتج
    const imageQuery = "SELECT url FROM product_images WHERE productId = ?";
    const [imageResults] = await db.execute(imageQuery, [productId]);
    const imageURLs = imageResults.map((row) => row.url);

    console.log("Image URLs:", imageURLs);

    // جلب تفاصيل المنتج
    const productQuery =
      "SELECT `SellerId`, `id`, `Prise`, `Discrption`, `ProductName`, `solid` FROM products WHERE id = ?";
    const [productResults] = await db.execute(productQuery, [productId]);
    const product = productResults[0];

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

    console.log("Variant Image Results:", variantImageResults);

    // جلب خيارات الأحجام المتاحة
    const variantOptionsQuery = `
      SELECT vo.id, vo.value as size, vo.qty, vo.prise, r.parent_option_id as color_id, r.child_option_id as option_id
      FROM variants v
      INNER JOIN variant_options vo ON v.id = vo.VariantsId
      LEFT JOIN variant_relations r ON vo.id = r.child_option_id
      WHERE v.product_id = ? AND v.VariantsType != 'color'
    `;
    const [variantOptionsResults] = await db.execute(variantOptionsQuery, [productId]);

    console.log("Variant Options Results:", variantOptionsResults);

    // تنظيم بيانات الألوان والأحجام
    const colorImages = {};
    const sizeOptions = {};

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

    if (view === 'user') {
      res.render("users/productDetals", {
        pageTitle: "تفاصيل المنتج ",
        path: "users/productDetals",
        product: product,
        imageURLs: imageURLs,
        combinations: combinations,
        csrfToken: req.csrfToken(),
        productId: productId,
      });
    } else {
      res.render("shop/productDetals", {
        pageTitle: "تفاصيل المنتج",
        path: "shop/productDetals",
        product: product,
        imageURLs: imageURLs,
        combinations: combinations,
        csrfToken: req.csrfToken(),
        productId: productId,
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

    console.log("categories",categories)
    let role = req.session.role || "";

    res.render("shop/home", {
      pageTitle: "Home page",
      path: "shop/home",
      products: rows, 
      role:role,
      categories:categories
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
    
console.log("stoew",stores)
      console.log(role+"fsdf")
      if (stores.length > 0) {
      res.render("shop/home", {
        pageTitle: "Home page",
        path: "shop/home",
        products: rows, // Passing the fetched products to the view
        role: role,
      });
     
    
    } else {
      res.status(404).send("Store not found");
    }

  } catch (error) {
    console.error("Error fetching store data:", error);
    res.status(500).send("Internal Server Error");
  }
  
}; 

