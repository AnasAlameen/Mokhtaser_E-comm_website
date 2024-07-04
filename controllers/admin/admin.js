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
  console.log(req.files);

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
    let SubCategorieId;
    console.log(seller_id + " seller_id");
    console.log(MainCatagori + " MainCatagori");

    // إدخال المنتج في جدول products
    let [add, fields] = await db.execute(
      "INSERT INTO products (SellerId, ProductName, Discrption, Prise, CrationDate,categorie) VALUES (?, ?, ?, ?, now(),?)",
      [seller_id, ProductName, ProductDiscrption, PrdustPrise, SubCategorie]
    );
    const productId = add.insertId;
    // إدخال الفئة الفرعية في جدول categories
    if (SubCategorie) {
      let [categorie] = await db.execute(
        "INSERT INTO categories (product_id, MainCategorie,SubCategorie) VALUES (?,?, ?)",
        [productId, MainCatagori, SubCategorie]
      );
      SubCategorieId = categorie.insertId;
    }

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
      SELECT r.parent_option_id, o.id,r.child_option_id, o.value as child_option_value, o.qty as child_option_qty, o.prise as child_option_price,pv.VariantsType as variant_type
      FROM variant_relations r
      JOIN variant_options o ON r.child_option_id = o.id
      JOIN variant_options po ON r.parent_option_id = po.id
      JOIN variants pv ON po.VariantsId = pv.id
      WHERE pv.product_id = ? AND pv.VariantsType = 'color'
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
      } else if (row.variant_type === "size") {
        sizes.push({
          value: row.option_value,
          qty: row.option_qty,
          price: row.option_price,
          id: row.option_id,
        });
        sizes.forEach((element) => {});
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
              id: row.id,
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
      productId: productId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving product data");
  }
};
exports.postEdite_Products = async (req, res, next) => {
  const {
    ProductName,
    PrdustPrise,
    ProductDiscrption,
    colors,
    sizes,
    add_new_size,
    removedColors,
    addedColorsVartion,
    removedImages,
    Product_id,
    removedVartion,
  } = req.body;

  console.log(req.body);
  console.log("///////////////////////////");
  console.log(req.files);
  console.log("///////////////////////////");

  try {
    let parsedColors = [],
      parsedSizes = [],
      parsedAddedNewSize = [],
      parsedRemovedColors = [],
      parsedRemovedImages = [],
      parsedaddedColorsVartion = [],
      parsedremovedVartion = [];

    // تحويل JSON إلى كائنات
    if (colors) parsedColors = JSON.parse(colors);
    if (sizes) parsedSizes = JSON.parse(sizes);
    if (addedColorsVartion)
      parsedaddedColorsVartion = JSON.parse(addedColorsVartion);
    if (add_new_size) parsedAddedNewSize = JSON.parse(add_new_size);
    if (removedColors) parsedRemovedColors = JSON.parse(removedColors);
    if (removedImages) parsedRemovedImages = JSON.parse(removedImages);
    if (removedVartion) parsedremovedVartion = JSON.parse(removedVartion);

    const productId = Product_id;

    // تحديث تفاصيل المنتج في جدول products
    await db.execute(
      "UPDATE products SET ProductName = ?, Discrption = ?, Prise = ? WHERE id = ?",
      [ProductName, ProductDiscrption, PrdustPrise, productId]
    );

    // حذف الصور المحددة
    for (const id of parsedRemovedImages) {
      await db.execute("DELETE FROM product_images WHERE id = ?", [id]);
    }

    // إدخال صور جديدة في جدول product_images
    if (req.files["image1"]) {
      for (const file of req.files["image1"]) {
        await db.execute(
          "INSERT INTO product_images (url, productId) VALUES (?, ?)",
          [file.path, productId]
        );
      }
    }

    if (parsedSizes.length > 0) {
      let variantId;
      for (const size of parsedSizes) {
        try {
          console.log("megerment "+size.megerment);
          console.log("size "+size.size);
          console.log("size_quantity "+size.size_quantity);
          console.log("size_price "+size.size_price);

          const [existingColor] = await db.execute(
            "SELECT id FROM variants WHERE product_id = ? AND VariantsType = ?",
            [productId, size.megerment]
          );

          if (
            size.megerment &&
            size.size &&
            size.size_quantity &&
            size.size_price
          ) {
            console.log("Adding variant:", {
              productId,
              megerment: size.megerment,
            });

            if (existingColor.length > 0) {
              // Use existing variant ID
              variantId = existingColor[0].id;
            } else {
              // Insert new variant
              const [addVariant] = await db.execute(
                "INSERT INTO variants (product_id, VariantsType) VALUES (?, ?)",
                [productId, size.megerment]
              );
              variantId = addVariant.insertId;
            }

            console.log("Variant added with ID:", variantId);

            await db.execute(
              "INSERT INTO variant_options (VariantsId, value, qty, prise) VALUES (?, ?, ?, ?)",
              [variantId, size.size, size.size_quantity, size.size_price]
            );
            console.log("Variant options added:", {
              variantId,
              size: size.size,
              quantity: size.size_quantity,
              price: size.size_price,
            });
          } else {
            console.error("Undefined values found:", size);
          }
        } catch (err) {
          console.error("Error handling size:", size, err);
        }
      }
    }

    if (parsedremovedVartion.length > 0) {
      for (const colorId of parsedremovedVartion) {
        await db.execute("DELETE FROM variant_options WHERE id = ?", [
          colorId,
        ]);
      }
    }
    // حذف الألوان المحددة
    if (parsedRemovedColors.length > 0) {
      for (const colorId of parsedRemovedColors) {
        // حذف الصفوف المرتبطة في جدول variant_relations باستخدام parent_option_id
        await db.execute(
          "DELETE FROM variant_relations WHERE parent_option_id = ?",
          [colorId]
        );

        console.log(colorId + " diddididi");

        // التحقق مرة أخرى من عدم وجود صفوف مرتبطة قبل محاولة حذف الصف في جدول variant_options
        const [relatedRows] = await db.execute(
          "SELECT * FROM variant_relations WHERE child_option_id = ?",
          [colorId]
        );

        if (relatedRows.length === 0) {
          // حذف الصفوف في جدول variant_options باستخدام VariantsId
          await db.execute("DELETE FROM variant_options WHERE id = ?", [
            colorId,
          ]);
        } else {
          console.log(
            `لا يمكن حذف اللون ${colorId} لأنه لا يزال مرتبطًا بصفوف أخرى في جدول variant_relations.`
          );
        }
      }
    }

    if (parsedaddedColorsVartion.length > 0) {
      for (const colorId of parsedaddedColorsVartion) {
        await db.execute(
          "DELETE FROM variant_relations WHERE child_option_id = ?",
          [colorId]
        );
        await db.execute("DELETE FROM variant_options WHERE id = ?", [colorId]);
      }
    }

    // معالجة الألوان والمقاسات المضافة والمحذوفة
    if (parsedColors.length > 0) {
      await Promise.all(
        parsedColors.map(async (color, index) => {
          let colorVariantId;

          let [existingColor] = await db.execute(
            "SELECT id FROM variants WHERE product_id = ? AND VariantsType = 'color'",
            [productId]
          );

          if (existingColor.length === 0) {
            let [colorVariant] = await db.execute(
              "INSERT INTO variants (product_id, VariantsType) VALUES (?, 'color')",
              [productId]
            );
            colorVariantId = colorVariant.insertId;
          } else {
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

              let [existingSize] = await db.execute(
                "SELECT id FROM variants WHERE product_id = ? AND VariantsType = ?",
                [productId, variation.DimensionsType]
              );

              if (existingSize.length === 0) {
                let [sizeVariant] = await db.execute(
                  "INSERT INTO variants (product_id, VariantsType) VALUES (?, ?)",
                  [productId, variation.DimensionsType]
                );
                sizeVariantId = sizeVariant.insertId;
              } else {
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

    // إضافة المقاسات الجديدة
    for (const size of parsedAddedNewSize) {
      let [sizeVariant] = await db.execute(
        "INSERT INTO variants (product_id, VariantsType) VALUES (?, ?)",
        [productId, size.megermentUnit]
      );

      let sizeVariantId = sizeVariant.insertId;

      let [sizeOption] = await db.execute(
        "INSERT INTO variant_options (VariantsId, value, qty, prise) VALUES (?, ?, ?, ?)",
        [
          sizeVariantId,
          size.megerment,
          size.New_Size_color_quantity,
          size.New_variation_color_prise,
        ]
      );

      const sizeOptionId = sizeOption.insertId;

      // التحقق من وجود parent_option_id قبل إدراج العلاقة
      const [parentOption] = await db.execute(
        "SELECT id FROM variant_options WHERE id = ?",
        [size.id]
      );

      if (parentOption.length > 0) {
        await db.execute(
          "INSERT INTO variant_relations (parent_option_id, child_option_id) VALUES (?, ?)",
          [size.id, sizeOptionId]
        );
      } else {
        console.error(`Parent option ID ${size.id} not found.`);
      }
    }

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product" });
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const productId = req.query.product_id;

  try {
    // حذف العلاقات بين المتغيرات المختلفة
    await db.execute(
      "DELETE FROM variant_relations WHERE parent_option_id IN (SELECT id FROM variant_options WHERE VariantsId IN (SELECT id FROM variants WHERE product_id = ?))",
      [productId]
    );
    await db.execute(
      "DELETE FROM variant_relations WHERE child_option_id IN (SELECT id FROM variant_options WHERE VariantsId IN (SELECT id FROM variants WHERE product_id = ?))",
      [productId]
    );

    // حذف الصور المرتبطة بالمنتج
    await db.execute("DELETE FROM product_images WHERE productId = ?", [
      productId,
    ]);
    await db.execute(
      "DELETE FROM variant_images WHERE variant_option_id IN (SELECT id FROM variant_options WHERE VariantsId IN (SELECT id FROM variants WHERE product_id = ?))",
      [productId]
    );

    // حذف الخيارات (اللون والمقاسات) المرتبطة بالمنتج
    await db.execute(
      "DELETE FROM variant_options WHERE VariantsId IN (SELECT id FROM variants WHERE product_id = ?)",
      [productId]
    );

    // حذف المتغيرات (اللون والمقاسات) المرتبطة بالمنتج
    await db.execute("DELETE FROM variants WHERE product_id = ?", [productId]);

    // حذف المنتج نفسه
    await db.execute("DELETE FROM products WHERE id = ?", [productId]);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product" });
  }
};
