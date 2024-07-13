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
    const [rows, fields] = await db.execute(query);
    const [categories]= await db.execute("select name, url,id from categories where parent_id =0")

    console.log("categories",categories)
    let role = req.session.role || "";

    res.render("users/home", {
      pageTitle: "Home page",
      path: "users/home",
      products: rows, 
      role:role,
      categories:categories

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
      // جلب صور المنتج
      const imageQuery = "SELECT url FROM product_images WHERE productId = ?";
      const [imageResults] = await db.execute(imageQuery, [productId]);
      const imageURLs = imageResults.map((row) => row.url);
      console.log("imageResults", imageResults);

      // جلب تفاصيل المنتج
      const productQuery =
        "SELECT `SellerId`, `Prise`, `Discrption`, `ProductName`, `solid` FROM products WHERE id = ?";
      const [productResults] = await db.execute(productQuery, [productId]);
      const product = productResults[0];
  
      // جلب صور الألوان المتاحة
      const variantImageQuery = `
        SELECT vi.url ,vi.id,vo.value, vo.id as vartionId,vo.qty
        FROM variants v
        INNER JOIN variant_options vo ON v.id = vo.VariantsId
        INNER JOIN variant_images vi ON vo.id = vi.variant_option_id
        WHERE v.product_id = ? AND v.VariantsType = 'color'
        LIMIT 1000
      `;
      const [variantImageResults] = await db.execute(variantImageQuery, [
        productId,
      ]);
      const vartins = variantImageResults.map((row) => row.url);
  
      console.log("vartins", vartins);
      console.log("variantImageResults", variantImageResults);
      // جلب خيارات الأحجام المتاحة
      const variantOptionsQuery = `
        SELECT vo.value,vo.id,vo.qty
        FROM variants v
        INNER JOIN variant_options vo ON v.id = vo.VariantsId
        WHERE v.product_id = ? AND v.VariantsType != 'color'
        LIMIT 1000
      `;
      const [variantOptionsResults] = await db.execute(variantOptionsQuery, [
        productId,
      ]);
  
      res.render("users/productDetals", {
        pageTitle: "تفاصيل المنتج",
        path: "users/productDetals",
        product: product, // تمرير تفاصيل المنتج إلى القالب
        imageURLs: imageURLs, // تمرير صور المنتج إلى القالب
        vartins: vartins, // تمرير صور الألوان إلى القالب
        variantOptions: variantOptionsResults, // تمرير خيارات الأحجام إلى القالب
        variantImageResults: variantImageResults,
      });
    } catch (err) {
      console.error(err);
      next(err);
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
        products: productss
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
  