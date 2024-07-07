const db = require("../helpers/databas");

const haveRoles = async (req, res, next) => {
    res.locals.stores = [];
    res.locals.userInfo = {};
    res.locals.hasAccess = false;

    if (req.session.userId) {
        try {
            const userId = req.session.userId;
            const store_id = req.session.storeId|| 0;

            const [stores] = await db.execute(`
                SELECT sr.store_id, sr.role_id, s.CompanyName, s.id
                FROM store_user_roles sr
                INNER JOIN sellers s ON sr.store_id = s.id
                WHERE sr.user_id = ?
            `, [userId]);

            const [userInfo] = await db.execute(`
                SELECT FirstName, url FROM users WHERE id = ? 
            `, [userId]);
            const [storeInfo] = await db.execute(`
                SELECT CompanyName, id,url FROM sellers WHERE id = ? 
            `, [store_id]);

            console.log("storeInfo",storeInfo)
            console.log("userInfo",userInfo)
            console.log("stores",stores)

            res.locals.stores = stores|| [];
            res.locals.userInfo = userInfo[0] || {};
            res.locals.storeInfo = storeInfo[0] || {};


        } catch (error) {
            console.error("Error retrieving stores or user info:", error);
        }
    }

    next();
};

module.exports = haveRoles;