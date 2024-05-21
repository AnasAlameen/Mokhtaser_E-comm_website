const db = require("../helpers/database");

class product {
    constructor(ProductName, PrdustPrise, ProductDiscrption, total_products, imagePaths = []) {
        this.ProductName = ProductName;
        this.ProductDiscrption = ProductDiscrption;
        this.PrdustPrise = PrdustPrise;
        this.total_products = total_products;
        this.imagePaths = imagePaths;
    }

    async addProduct() {
        try {
            const seller_id = 11; // يمكنك استخدام المعرف هنا أو تمريره كمعلمة إلى الدالة

            let add = await db.execute("INSERT INTO products (SellerId, ProductName, Discrption, Prise, CrationDate) VALUES (?, ?, ?, ?, now())", 
                [seller_id, this.ProductName, this.ProductDiscrption, this.PrdustPrise]
            );
            
            console.log("Product added successfully");
            return add;
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    }
}

module.exports = product;
