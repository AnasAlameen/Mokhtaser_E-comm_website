const db = require("../../helpers/databas");
exports.getCategories = async(req, res, next) => {
  let categories = [];
  try {
    const [categories] = await db.execute(`
      SELECT c.id, c.name, c.url, s.id as sub_id, s.name as sub_name, s.url as sub_url
      FROM categories c
      LEFT JOIN categories s ON s.parent_id = c.id
      WHERE c.parent_id =0
    `);
    console.log("categories",categories);

    const formattedCategories = categories.reduce((acc, category) => {
      let mainCategory = acc.find(cat => cat.id === category.id);
      if (!mainCategory) {
        mainCategory = {
          id: category.id,
          name: category.name,
          image: category.url,
          subcategories: []
        };
        acc.push(mainCategory);
      }
      if (category.sub_id) {
        mainCategory.subcategories.push({
          id: category.sub_id,
          name: category.sub_name,
          image: category.sub_url
        });
      }
      return acc;
    }, []);
    res.render("admin/categories", {
        pageTitle: "categories",
        path: "admin/categories",
        categories: categories,
        formattedCategories:formattedCategories
      }); 
      console.log("mainc",formattedCategories)

    
    } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.postCategories = async (req, res, next) => {
    try {
      const { name } = req.body;
      const imageFile = req.files && req.files.image ? req.files.image[0] : null;
  
      if (!name || !imageFile) {
        return res.status(400).json({ message: "Name and image are required" });
      }
  
      const imageUrl = imageFile.path.replace(/\\/g, '/');
  
      await db.execute(
        "INSERT INTO categories (url, name) VALUES (?, ?)",
        [imageUrl, name]
      );
  
      res.status(201).json({ message: "Category added successfully" });
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  exports.postSubCategoty=async (req,res,next)=>{
    try {
        const { name,MainId } = req.body;
        const imageFile = req.files && req.files.image ? req.files.image[0] : null;
    
        if (!name || !imageFile) {
          return res.status(400).json({ message: "Name and image are required" });
        }
    
        const imageUrl = imageFile.path.replace(/\\/g, '/');
        await db.execute(
            "INSERT INTO categories (parent_id,url, name) VALUES (?, ?,?)",
            [MainId,imageUrl, name]
          );
      
          res.status(201).json({ message: "Category added successfully" });
   

       
      } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ message: "Server error" });
      }
    };

exports.deleteCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;

  try {
    // حذف الفئة الرئيسية
    await db.execute("DELETE FROM categories WHERE id = ?", [categoryId]);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.deleteSubCategory = async (req, res, next) => {
  const subCategoryId = req.params.subCategoryId;

  try {
    // حذف الفئة الفرعية
    await db.execute("DELETE FROM categories WHERE id = ?", [subCategoryId]);

    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    res.status(500).json({ message: "Server error" });
  }
};
