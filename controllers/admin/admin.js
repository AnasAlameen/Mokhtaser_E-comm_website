const { join } = require("path");
const db = require("../../helpers/databas");

exports.getAddProductPage = (req, res, next) => {
  res.render("shop/admin/addProduct", {
    pageTitle: "Add Product",
    path: "shop/addProduct",
  });
};

exports.Post_Product = async (req, res, next) => {
  let seller_id = req.session.userId;
  let MainCatagori = req.session.Catagori || "h";
  const {
    ProductName,
    PrdustPrise,
    ProductDiscrption,
    colors,
    sizes,
    SubCategorie,
  } = req.body;

  console.log(req.body);
  console.log("add");

  try {
    let parsedColors = [];
    let parsedSizes = [];
    try {
      if (colors) {
        parsedColors = JSON.parse(colors);
      }
      if (sizes) {
        parsedSizes = JSON.parse(sizes);
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return res.status(400).json({ message: "Invalid JSON format" });
    }

    // إدخال المنتج في جدول products
    let [add, fields] = await db.execute(
      "INSERT INTO products (SellerId, ProductName, Discrption, Prise, CrationDate) VALUES (?, ?, ?, ?, now())",
      [seller_id, ProductName, ProductDiscrption, PrdustPrise]
    );
    const productId = add.insertId;

    // إدخال صور المنتج في جدول product_images
    if (req.files["image1"]) {
      for (const file of req.files["image1"]) {
        console.log(req.files["image1"]);
        console.log("sdflskdnm");
        await db.execute(
          "INSERT INTO product_images (url, productId) VALUES (?, ?)",
          [file.path, productId]
        );
      }
    }

    // إدخال الفئة الفرعية في جدول categories
    if (SubCategorie) {
      await db.execute(
        "INSERT INTO categories (product_id, MainCategorie,SubCategorie) VALUES (?,?, ?)",
        [productId, MainCatagori, SubCategorie]
      );
    }

    // استخدام مجموعات للتأكد من أن المتغيرات ليست مكررة
    let setVartins = new Set();
    let setSizeVartins = new Set();

    // إدخال المتغيرات في جدول variants وجداول الربط
    if (parsedColors.length > 0) {
      await Promise.all(
        parsedColors.map(async (color, index) => {
          let colorVariantId;

          // التحقق من وجود اللون في مجموعة المتغيرات
          if (!setVartins.has("color")) {
            // التحقق من قاعدة البيانات بدلاً من الاعتماد على المجموعة فقط
            let [existingColor] = await db.execute(
              "SELECT id FROM variants WHERE product_id = ? AND VariantsType = 'color'",
              [productId]
            );

            if (existingColor.length === 0) {
              let [colorVariant] = await db.execute(
                "INSERT INTO variants (product_id, VariantsType) VALUES (?, 'color')",
                [productId]
              );
              setVartins.add("color");
              colorVariantId = colorVariant.insertId;
            } else {
              colorVariantId = existingColor[0].id;
              setVartins.add("color");
            }
          } else {
            // الحصول على معرف المتغير إذا كان موجودًا بالفعل
            let [existingColor] = await db.execute(
              "SELECT id FROM variants WHERE product_id = ? AND VariantsType = 'color'",
              [productId]
            );
            colorVariantId = existingColor[0].id;
          }

          let [colorOption] = await db.execute(
            "INSERT INTO variant_options (VariantsId, value, qty, prise) VALUES (?, ?, ?, ?)",
            [colorVariantId, color.name, color.quantity, color.price]
          );
          let colorOptionId = colorOption.insertId;

          // إدخال صورة اللون
          if (req.files["image2"] && req.files["image2"][index]) {
            let file = req.files["image2"][index];
            await db.execute(
              "INSERT INTO variant_images (variant_option_id, url) VALUES (?, ?)",
              [colorOptionId, file.path]
            );
          }

          // إدخال القياسات في جدول variants وجداول الربط
          await Promise.all(
            color.variations.map(async (variation) => {
              let sizeVariantId;

              // التحقق من وجود النوع في مجموعة المتغيرات
              if (!setSizeVartins.has(variation.DimensionsType)) {
                // التحقق من قاعدة البيانات بدلاً من الاعتماد على المجموعة فقط
                let [existingSize] = await db.execute(
                  "SELECT id FROM variants WHERE product_id = ? AND VariantsType = ?",
                  [productId, variation.DimensionsType]
                );

                if (existingSize.length === 0) {
                  let [sizeVariant] = await db.execute(
                    "INSERT INTO variants (product_id, VariantsType) VALUES (?, ?)",
                    [productId, variation.DimensionsType]
                  );
                  setSizeVartins.add(variation.DimensionsType);
                  sizeVariantId = sizeVariant.insertId;
                } else {
                  sizeVariantId = existingSize[0].id;
                  setSizeVartins.add(variation.DimensionsType);
                }
              } else {
                // الحصول على معرف المتغير إذا كان موجودًا بالفعل
                let [existingSize] = await db.execute(
                  "SELECT id FROM variants WHERE product_id = ? AND VariantsType = ?",
                  [productId, variation.DimensionsType]
                );
                sizeVariantId = existingSize[0].id;
              }

              let [sizeOption] = await db.execute(
                "INSERT INTO variant_options (VariantsId, value, qty, prise) VALUES (?, ?, ?, ?)",
                [
                  sizeVariantId,
                  variation.DimensionsMeger,
                  variation.quantity,
                  variation.price,
                ]
              );
              let sizeOptionId = sizeOption.insertId;

              // ربط المقاسات باللون في جدول variant_relations
              await db.execute(
                "INSERT INTO variant_relations (parent_option_id, child_option_id) VALUES (?, ?)",
                [colorOptionId, sizeOptionId]
              );
            })
          );
        })
      );
    }

    res.status(200).json({ message: "Product added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getEditProductPage = async (req, res, next) => {
  const productId = req.query.product_id;
  try {
    const [productResults] = await db.execute(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );
    const product = productResults[0];

    const [imageResults] = await db.execute(
      "SELECT url,id FROM product_images WHERE productId = ?",
      [productId]
    );

    const [variantResults] = await db.execute(
      `
      SELECT v.id as variant_id, v.VariantsType as variant_type, o.id as option_id, o.value as option_value, o.qty as option_qty, o.prise as option_price, i.url as image_url
      FROM variants v
      JOIN variant_options o ON v.id = o.VariantsId
      LEFT JOIN variant_images i ON o.id = i.variant_option_id
      WHERE v.product_id = ?
    `,
      [productId]
    );

    const [relationResults] = await db.execute(
      `
      SELECT r.parent_option_id, r.child_option_id, o.value as child_option_value, o.qty as child_option_qty, o.prise as child_option_price
      FROM variant_relations r
      JOIN variant_options o ON r.child_option_id = o.id
      WHERE r.parent_option_id IN (SELECT id FROM variant_options WHERE VariantsId = (SELECT id FROM variants WHERE product_id = ? AND VariantsType = 'color'))
    `,
      [productId]
    );

    const combinations = {};
    const sizes = [];

    variantResults.forEach((row) => {
      if (row.variant_type === "color") {
        if (!combinations[row.option_id]) {
          combinations[row.option_id] = {
            color: row.option_value,
            image: row.image_url,
            relatedVariants: [],
          };
        }

        Object.keys(combinations).forEach((key) => {
          console.log(combinations[key] + " sizes");
        });
      } else if (row.variant_type === "size") {
        sizes.push({
          value: row.option_value,
          qty: row.option_qty,
          price: row.option_price,
        });
        sizes.forEach((element) => {
          console.log(sizes[element] + "sizes");
        });
      }
    });

    relationResults.forEach((row) => {
      if (row.child_option_value) {
        Object.keys(combinations).forEach((colorOptionId) => {
          if (parseInt(colorOptionId) === row.parent_option_id) {
            combinations[colorOptionId].relatedVariants.push({
              value: row.child_option_value,
              qty: row.child_option_qty,
              price: row.child_option_price,
            });
          }
        });
      }
    });

    res.render("shop/admin/editeProduct", {
      pageTitle: "تعديل المنتج",
      product: product,
      imageURLs: imageResults,
      combinations: combinations,
      sizes: sizes,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving product data");
  }
};
