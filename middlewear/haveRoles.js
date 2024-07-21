const db = require("../helpers/databas");

const haveRoles = async (req, res, next) => {
    res.locals.stores = [];
    res.locals.userInfo = {};
    res.locals.storeInfo = {};
    res.locals.hasAccess = false;

    try {
        const { userId, storeId } = req.session;

        if (userId) {
            const [userInfo] = await db.execute(`
                SELECT FirstName, url FROM users WHERE id = ? 
            `, [userId]);

            res.locals.userInfo = userInfo[0] || {};
            console.log("User Info Retrieved");

            const [stores] = await db.execute(`
                SELECT sr.store_id, sr.role_id, s.CompanyName, s.id
                FROM store_user_roles sr
                INNER JOIN sellers s ON sr.store_id = s.id
                WHERE sr.user_id = ?
            `, [userId]);

            res.locals.stores = stores || [];
        }

        if (req.session.storeId) {
            console.log("userId in storeID",userId)
            const [storeInfo] = await db.execute(`
                SELECT CompanyName, id, url, Catagori FROM sellers WHERE id = ? 
            `, [storeId]);

            res.locals.storeInfo = storeInfo[0] || {};
            req.session.Catagori = storeInfo[0]?.Catagori || null;

            console.log("Store Info", {
                storeInfoCatagoxi: req.session.Catagori,
                storeInfo: storeInfo
            });

            let rolesQuery = `
                SELECT sr.store_id, sr.role_id, s.CompanyName, s.id
                FROM store_user_roles sr
                INNER JOIN sellers s ON sr.store_id = s.id
                WHERE sr.store_id = ?
            `;
            let rolesParams = [storeId];

            if (userId) {
                rolesQuery += " AND sr.user_id = ?";
                rolesParams.push(userId);
            } else {
                rolesQuery += " AND sr.user_id IS NULL";
            }

            const [roles] = await db.execute(rolesQuery, rolesParams);

            res.locals.stores = roles || [];
            console.log("Roles", roles);
        }

    } catch (error) {
        console.error("Error retrieving stores or user info:", error);
    }

    next();
};

module.exports = haveRoles;
