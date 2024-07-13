const db = require("../helpers/databas");

const getshops = async (req, res, next) => {
    try {
        if (req.session.userId) {
            const userId = req.session.userId;
            const [userInfo] = await db.execute(`
                SELECT FirstName, url FROM users WHERE id = ? 
            `, [userId]);
    
            res.locals.userInfo = userInfo[0] || {};
            console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
            const [stores] = await db.execute(`
                SELECT sr.store_id, sr.role_id, s.CompanyName, s.id
                FROM store_user_roles sr
                INNER JOIN sellers s ON sr.store_id = s.id
                WHERE sr.user_id = ?
            `, [userId]);
    
            res.locals.stores = stores || [];
    
            // إذا لم يكن هناك storeId في الجلسة وتريد تعيينه الآن
            if (!req.session.storeId && stores.length > 0) {
                req.session.regenerate((err) => {
                    if (err) {
                        console.error("Error regenerating session:", err);
                        return next(err);
                    }
    
                    // إعادة تعيين القيم المشتركة بعد إعادة تهيئة الجلسة
                    req.session.userId = userId;
                    req.session.storeId = stores[0].store_id; // تعيين أول متجر
                    req.session.Catagori = stores[0].Catagori;
                    req.session.isLoggedIn = true;
                    req.session.name = userInfo[0].FirstName;
                    req.session.type = "seller";
    
    
    
                    next();
                });
                return; // إنهاء التنفيذ هنا لأن الجلسة تم تجديدها
            }
        }
    } catch (error) {
        res.status(500).send({error:"the get role not work"})
    }
  
}
module.exports = getshops;
