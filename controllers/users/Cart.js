const db = require("../../helpers/databas");
exports.postAddToCart = async (req, res, next) => {
  let {
    productId,
    selectedOptionId,
    selectedColor,
    selectedImageId,
    quantity,
    selectedColorVartionID,
    productPrice,
    lastQuan,
  } = req.body;
  let UserId = req.session.userId;
  const finalSelectedColorVartionID = selectedColorVartionID || null;
  const finalSelectedOptionId = selectedOptionId || null;
  console.log(req.body);
  console.log("cart");
  try {
    let productQuery = `
      INSERT INTO shopping_carts (
        UserId,
        ProductId,
        qty,
        Prise,
        VOCId,
        VOId,
        CreatDate
      ) VALUES (?, ?, ?, ?, ?, ?, now())
    `;

    const [productResults] = await db.execute(productQuery, [
      UserId,
      productId,
      quantity,
      productPrice,
      finalSelectedColorVartionID,
      finalSelectedOptionId,
    ]);
    if (finalSelectedColorVartionID || finalSelectedOptionId) {
      let updateQuery1 = `
      UPDATE variant_options
      SET qty = ?
      WHERE id = ?
    `;

      await db.execute(updateQuery1, [lastQuan, selectedColorVartionID]);

      let updateQuery2 = `
      UPDATE variant_options
      SET qty = ?
      WHERE id = ?
    `;

      await db.execute(updateQuery2, [lastQuan, selectedOptionId]);
    }
    res.status(200).json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ message: "Error adding product to cart" });
  }
};

exports.addOrder = async (req, res, next) => {
  let { selectedProducts } = req.body;
  let UserId = req.session.userId;
  console.log(UserId + " User id");
  console.log(req.body);
  console.log("body");

  if (!selectedProducts || selectedProducts.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No products selected" });
  }

  try {
    selectedProducts = JSON.parse(selectedProducts);

    console.log("selectedProducts", selectedProducts);
    for (const product of selectedProducts) {
      const {
        productId,
        quantity,
        productPrice,
        selectedColorVartionID,
        selectedOptionId,
      } = product;

      if (
        productId === undefined ||
        quantity === undefined ||
        productPrice === undefined
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product data" });
      }

      let productQuery = `
        INSERT INTO orders (
          UserId,
          ProductId,
          Qwnatity,
          Prise,
          VOCId,
          VOId,
          CreatDate,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, now(), "Pending Preparation")
      `;

      const [productResults] = await db.execute(productQuery, [
        UserId,
        productId,
        quantity,
        productPrice,
        selectedColorVartionID || null,
        selectedOptionId || null,
      ]);

      // تحديث الكميات بناءً على خصائص المنتج
      if (selectedOptionId && selectedColorVartionID) {
        // المنتج يحتوي على ألوان ومقاسات
        const updateQuery = `
          UPDATE variant_options
          SET qty = qty - ?
          WHERE id = ?
        `;
        await db.execute(updateQuery, [quantity, selectedOptionId]);
      } else if (selectedColorVartionID) {
        // المنتج يحتوي على ألوان فقط
        const updateColorQuery = `
          UPDATE variant_options
          SET qty = qty - ?
          WHERE id = ?
        `;
        await db.execute(updateColorQuery, [quantity, selectedColorVartionID]);
      } else if (selectedOptionId) {
        // المنتج يحتوي على مقاسات فقط
        const updateOptionQuery = `
          UPDATE variant_options
          SET qty = qty - ?
          WHERE id = ?
        `;
        await db.execute(updateOptionQuery, [quantity, selectedOptionId]);
      } else {
        // المنتج لا يحتوي على ألوان ولا مقاسات
        const updateProductQuery = `
          UPDATE products
          SET quantity = quantity - ?
          WHERE id = ?
        `;
        await db.execute(updateProductQuery, [quantity, productId]);
      }

      console.log(productId, " productId" + UserId + " UserId");
      // حذف العنصر من سلة التسوق
      const deleteCartQuery = `
        DELETE FROM shopping_carts
        WHERE UserId = ? AND ProductId = ?
      `;
      await db.execute(deleteCartQuery, [UserId, productId]);
    }

    res
      .status(200)
      .json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ success: false, message: "Error placing order" });
  }
};
exports.deleteFromCart = async (req, res, next) => {
  const productId = req.query.productId;
  console.log("Deleting product with ID:", productId);
  try {
    const deleteFromCart = await db.execute("DELETE FROM shopping_carts WHERE id = ?", [productId]);
    res.status(200).json({ success: true, message: "Item successfully deleted" });
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    res.status(500).json({ success: false, error: "Error deleting item from cart" });
  }
};

exports.getCart = async (req, res, next) => {
  const userId = req.session.userId; // الحصول على UserId من الجلسة

  const query = `
    SELECT o.ProductId, o.id, o.qty, o.Prise, o.VOCId, o.VOId, o.CreatDate,
           MIN(pi.url) AS image_url, p.ProductName, p.Discrption, s.id AS sellerId, s.CompanyName AS sellerName
    FROM shopping_carts o
    INNER JOIN product_images pi ON o.ProductId = pi.productId
    INNER JOIN products p ON o.ProductId = p.id
    INNER JOIN sellers s ON p.sellerId = s.id
    WHERE o.UserId = ? 
    GROUP BY o.CreatDate, s.id;
  `;

  try {
    const [rows] = await db.execute(query, [userId]);

    if (rows.length === 0) {
      return res.render("users/cart", {
        pageTitle: "Cart",
        path: "users/cart",
        groupedProducts: {},
      });
    }

    const colorsPromises = rows.map(async (row) => {
      if (row.VOCId !== undefined) {
        const sqlQuery = `SELECT value ,id FROM variant_options WHERE id = ?`;
        const [colorRows] = await db.execute(sqlQuery, [row.VOCId]);
        return colorRows[0] ? colorRows[0].value : null;
      }
      return null;
    });

    const optionsPromises = rows.map(async (row) => {
      if (row.VOId !== undefined) {
        const sqlQuery = `SELECT value ,id FROM variant_options WHERE id = ?`;
        const [optionRows] = await db.execute(sqlQuery, [row.VOId]);
        return optionRows[0] ? optionRows[0].value : null;
      }
      return null;
    });

    const colors = await Promise.all(colorsPromises);
    const options = await Promise.all(optionsPromises);

    const groupedProducts = rows.reduce((acc, row, index) => {
      const { sellerId, sellerName } = row;
      if (!acc[sellerId]) {
        acc[sellerId] = {
          sellerName,
          products: [],
          colors: [],
          options: [],
        };
      }
      acc[sellerId].products.push(row);
      acc[sellerId].colors.push(colors[index]);
      acc[sellerId].options.push(options[index]);

      return acc;
    }, {});

    res.render("users/cart", {
      pageTitle: "Cart",
      path: "users/cart",
      groupedProducts,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  let sellerId = req.session.storeId;
  console.log(sellerId + " sellerid");
  const query = `
    SELECT o.ProductId, o.Qwnatity, o.Prise, o.VOCId, o.VOId, o.CreatDate, o.status, o.UserId, o.id,
           MIN(pi.url) AS image_url, p.ProductName, p.Discrption ,s.PhoneNum,s.CompanyName,u.FirstName,u.LastName,u.Phone
    FROM orders o
    INNER JOIN product_images pi ON o.ProductId = pi.productId
    INNER JOIN products p ON o.ProductId = p.id
    INNER JOIN sellers s on p.SellerId = s.id
    INNER JOIN users u on o.UserId=u.id
    WHERE o.status = "Pending Preparation" and p.SellerId=?
    GROUP BY o.ProductId, o.Qwnatity, o.Prise, o.VOCId, o.VOId, o.CreatDate, o.status, o.UserId, o.id, p.ProductName, p.Discrption;
  `;

  try {
    const [rows] = await db.execute(query, [sellerId]);
    console.log(rows);
    if (rows.length === 0) {
      // لا توجد بيانات، عرض صفحة فارغة
      return res.render("shop/orders", {
        pageTitle: "Orders",
        path: "shop/orders",
        groupedProducts: {},
      });
    }

    const colorsPromises = rows.map(async (row) => {
      if (row.VOCId !== undefined) {
        const sqlQuery = `SELECT value FROM variant_options WHERE id = ?`;
        const [colorRows] = await db.execute(sqlQuery, [row.VOCId]);
        return colorRows[0] ? colorRows[0].value : null;
      }
      return null;
    });

    const optionsPromises = rows.map(async (row) => {
      if (row.VOId !== undefined) {
        const sqlQuery = `SELECT value FROM variant_options where id = ?`;
        const [optionRows] = await db.execute(sqlQuery, [row.VOId]);
        return optionRows[0] ? optionRows[0].value : null;
      }
      return null;
    });

    const userIds = rows.map((row) => row.UserId);
    const uniqueUserIds = [...new Set(userIds)];

    const locationQuery = `SELECT UserId, City, area FROM location WHERE UserId IN (${uniqueUserIds.join(
      ","
    )})`;
    const [locationRows] = await db.execute(locationQuery);
    console.log(locationRows);

    const colors = await Promise.all(colorsPromises);
    const options = await Promise.all(optionsPromises);

    const groupedProducts = rows.reduce((acc, row, index) => {
      const { UserId } = row;
      if (!acc[UserId]) {
        acc[UserId] = {
          products: [],
          colors: [],
          options: [],
          locationQuery: [],
        };
      }
      acc[UserId].products.push(row);
      acc[UserId].colors.push(colors[index]);
      acc[UserId].options.push(options[index]);

      return acc;
    }, {});

    const userLocations = locationRows.reduce((acc, loc) => {
      acc[loc.UserId] = loc;
      return acc;
    }, {});

    // إضافة بيانات الشحن لكل مستخدم في groupedProducts
    Object.keys(groupedProducts).forEach((userId) => {
      groupedProducts[userId].locationQuery.push(userLocations[userId]);
    });

    res.render("shop/orders", {
      pageTitle: "Orders",
      path: "shop/orders",
      groupedProducts: groupedProducts,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.postOrder = async (req, res, next) => {
  console.log(JSON.parse(req.body.selectedProducts));

  const query = `
    SELECT o.ProductId, o.UserId, o.id, o.qty, o.Prise, o.VOCId, o.VOId, o.CreatDate,
           MIN(pi.url) AS image_url, p.ProductName, p.Discrption, s.id AS sellerId, s.CompanyName AS sellerName
    FROM shopping_carts o
    INNER JOIN product_images pi ON o.ProductId = pi.productId
    INNER JOIN products p ON o.ProductId = p.id
    INNER JOIN sellers s ON p.sellerId = s.id
    WHERE o.id = ?
  `;

  try {
    const selectedProducts = JSON.parse(req.body.selectedProducts);

    if (!selectedProducts || selectedProducts.length === 0) {
      return res
        .status(400)
        .json({ message: "No selected products in the request" });
    }
    console.log(selectedProducts + " selected products");

    for (const element of selectedProducts) {
      const [rows] = await db.execute(query, [element.productId]);
      if (rows.length === 0) {
        console.error(`No data found for productId: ${element.productId}`);
        continue;
      }

      const row = rows[0];
      console.log(row, ": first row");

      const addToOrdersTable = `
        INSERT INTO orders (
          UserId,
          ProductId,
          Qwnatity,
          Prise,
          VOCId,
          VOId,
          CreatDate,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, now(), "Pending Preparation")
      `;
      await db.execute(addToOrdersTable, [
        row.UserId,
        row.ProductId,
        element.quantity,
        element.ElementPrise,
        row.VOCId,
        row.VOId,
      ]);
    }

    res.status(200).json({ message: "Order processed successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ message: "Error processing order" });
  }
};
exports.orderRedy = async (req, res, next) => {
  try {
    const productIds = JSON.parse(req.body.productIds);

    if (!productIds || productIds.length === 0) {
      return res.status(400).json({ error: "Invalid product IDs" });
    }

    console.log(productIds + " checked");

    const updateQueries = productIds.map((id) => {
      return db.execute(
        `UPDATE orders SET status = 'Pending Shipping' WHERE id = ${id}`
      );
    });

    Promise.all(updateQueries);

    res.status(200).json({ message: "Order processed successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the order" });
  }
};
