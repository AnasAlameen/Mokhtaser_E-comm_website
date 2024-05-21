//let product = require("../../models/product");
const { join } = require("path");
const db = require("../../helpers/databas");

exports.getAddProductPage = (req, res, next) => {
  res.render("shop/admin/addProduct", {
    pageTitle: "Add Product",
    path: "shop/addProduct",
  });
};
exports.Post_Product = async (req, res, next) => {
 
  variants_array=[];
  let seller_id = 10;
  const { total_products, ProductName, PrdustPrise, ProductDiscrption ,colors,SubCategorie} =
    req.body;
  console.log(req.body);

  try {
    let [add, fields] = await db.execute("INSERT INTO products (SellerId,ProductName, Discrption, Prise	,CrationDate) VALUES ( ?,?, ?,?,now())",[seller_id, ProductName, ProductDiscrption, PrdustPrise] );
    const productId = add.insertId;

    if (req.files["image1"]) {
      for (const file of req.files["image1"]) {
        db.execute(
          "INSERT INTO product_images (url, productId ) VALUES (?, ?)",
          [file.path, productId]
        );
      }
    }
    let c="color";
    variants_array = JSON.parse(colors);

await Promise.all(variants_array.map(async (color, index) => {
  try {
    if (color.name ) {
            let [getvariantsColorID, f] = await db.execute("INSERT INTO variants (product_id, VariantsType) VALUES (?, ?)", [productId, c]);
      let optionColorId=getvariantsColorID.insertId;
      let[getvariantsColorOptionId,hg]=await db.execute("INSERT INTO variant_options (VariantsId, value,qty) VALUES (?,?,?)", [optionColorId, color.name, color.DimensionsMeger]);
      let variant_optionsId=getvariantsColorOptionId.insertId;
      for (const file of req.files["image2"]) {
         db.execute("INSERT INTO variant_images (variant_option_id,url) VALUES (?,?)", [variant_optionsId, file.path]);
      }
    } else {
      console.log("colors not found")
    }
    if (color.DimensionsType && color.DimensionsMeger) {
      let [getvariantsID, f] = await db.execute("INSERT INTO variants (product_id, VariantsType) VALUES (?, ?)", [productId, color.DimensionsType]);
      let variantId=getvariantsID.insertId;
      let image=await db.execute("INSERT INTO variant_options (VariantsId, value,qty) VALUES (?,?,?)", [variantId, color.DimensionsType, color.DimensionsMeger]);
    } else {
      console.log("DimensionsType not found")
    }
  } catch (error) {
    console.error("Error inserting variant:", error);
  }
}));

   let MainCategorie="Clothes";
   let categories=db.execute("INSERT INTO categories (product_id,MainCategorie,SubCategorie)VALUES (?,?,?)",[productId,MainCategorie,SubCategorie])
    



    if (req.files["image2"]) {
      req.files["image2"].forEach((file) => {
        console.log(file.path + "this is the path");
      });
    } else {
      console.log("we dont get imga2");
    }

    /*product = new Product(total_products,ProductName,PrdustPrise, ProductDiscrption,imagePaths );
  return res.status(200).json({ message: "Data received successfully" });*/
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating product" });
  }
  //product.addProduct();
};
