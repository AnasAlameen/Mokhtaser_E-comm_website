const db = require("../../helpers/databas");


exports.getproductDetals = async (req, res, next) => {
  const productId = req.query.product_id;

  if (!productId) {
    return res.status(400).send('معرف المنتج مطلوب');
  }

  try {
    // جلب صور المنتج
    const imageQuery = "SELECT url FROM product_images WHERE productId = ?";
    const [imageResults] = await db.execute(imageQuery, [productId]);
    const imageURLs = imageResults.map(row => row.url);

    // جلب تفاصيل المنتج
    const productQuery = "SELECT `SellerId`, `Prise`, `Discrption`, `ProductName`, `solid` FROM products WHERE id = ?";
    const [productResults] = await db.execute(productQuery, [productId]);
    const product = productResults[0];

    // جلب صور الألوان المتاحة
    const variantImageQuery = `
      SELECT vi.url
      FROM variants v
      INNER JOIN variant_options vo ON v.id = vo.VariantsId
      INNER JOIN variant_images vi ON vo.id = vi.variant_option_id
      WHERE v.product_id = ? AND v.VariantsType = 'color'
      LIMIT 1000
    `;
    const [variantImageResults] = await db.execute(variantImageQuery, [productId]);
    const vartins = variantImageResults.map(row => row.url);

    console.log("vartins",vartins);
    console.log("variantImageResults",variantImageResults);


    // جلب خيارات الأحجام المتاحة
    const variantOptionsQuery = `
      SELECT vo.value
      FROM variants v
      INNER JOIN variant_options vo ON v.id = vo.VariantsId
      WHERE v.product_id = ? AND v.VariantsType != 'color'
      LIMIT 1000
    `;
    const [variantOptionsResults] = await db.execute(variantOptionsQuery, [productId]);

    res.render('users/productDetals', {
      pageTitle: 'تفاصيل المنتج',
      path: 'users/productDetals',
      product: product,  // تمرير تفاصيل المنتج إلى القالب
      imageURLs: imageURLs,  // تمرير صور المنتج إلى القالب
      vartins: vartins,  // تمرير صور الألوان إلى القالب
      variantOptions: variantOptionsResults,  // تمرير خيارات الأحجام إلى القالب
      variantImageResults:variantImageResults
    });
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
      GROUP BY p.id, p.ProductName, p.Discrption, p.Prise, p.CrationDate
      ;
    `;
    const [rows, fields] = await db.execute(query);
   // console.log(rows);
    res.render("shop/home", {
      pageTitle: "Home page",
      path: "shope/home",
      products: rows // Passing the fetched products to the view
    });
  } catch (error) {
    console.error('Error retrieving featured products:', error);
    res.status(500).json({ error: 'Error retrieving featured products' });
  }
};

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
exports.getOrderDetals = (req, res, next) => {
    res.render("shop/orderDetals", {
      pageTitle: "Order Details",
      path: "shope/orders/details",
    });
  };

  exports.getHopePageProducts=async (req,res,next)=>{
    
}

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

