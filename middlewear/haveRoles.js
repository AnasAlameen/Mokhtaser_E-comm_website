const db = require("../helpers/databas");

const haveRoles = async (req, res, next) => {
    res.locals.stores = [];
    res.locals.userInfo = {};
    res.locals.storeInfo = {};
    res.locals.hasAccess = false;

    try {
        if (req.session.userId) {
            const userId = req.session.userId;
            const [userInfo] = await db.execute(`
                SELECT FirstName, url FROM users WHERE id = ? 
            `, [userId]);

            res.locals.userInfo = userInfo[0] || {};

            const [stores] = await db.execute(`
                SELECT sr.store_id, sr.role_id, s.CompanyName, s.id
                FROM store_user_roles sr
                INNER JOIN sellers s ON sr.store_id = s.id
                WHERE sr.user_id = ?
            `, [userId]);

            res.locals.stores = stores || [];
        }

        if (req.session.storeId) {
            const storeId = req.session.storeId;

            const [storeInfo] = await db.execute(`
                SELECT CompanyName, id, url FROM sellers WHERE id = ? 
            `, [storeId]);

            res.locals.storeInfo = storeInfo[0] || {};

            const [roles] = await db.execute(`
                SELECT sr.store_id, sr.role_id, s.CompanyName, s.id
                FROM store_user_roles sr
                INNER JOIN sellers s ON sr.store_id = s.id
                WHERE sr.store_id = ?
            `, [storeId]);

            res.locals.stores = roles || [];
        }

    } catch (error) {
        console.error("Error retrieving stores or user info:", error);
    }

    next();
};

module.exports = haveRoles;
