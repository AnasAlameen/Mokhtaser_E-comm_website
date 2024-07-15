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
              console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
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
                SELECT CompanyName, id, url, Catagori FROM sellers WHERE id = ? 
            `, [storeId]);

            res.locals.storeInfo = storeInfo[0] || {};
            req.session.Catagori = storeInfo[0].Catagori;

            console.log("storeInfo", {
                storeInfoCatagoxi: req.session.Catagori,
                storeInfo: storeInfo
            });
            const [roles] = await db.execute(`
            SELECT sr.store_id, sr.role_id, s.CompanyName, s.id
            FROM store_user_roles sr
            INNER JOIN sellers s ON sr.store_id = s.id
            WHERE sr.store_id = ? and sr.user_id IS NULL
        `, [storeId]);
        console.log("roles", roles);

            res.locals.stores = roles || [];
        }
        if (req.session.storeId && req.session.userId) {
            const storeId = req.session.storeId;

            const [storeInfo] = await db.execute(`
                SELECT CompanyName, id, url, Catagori FROM sellers WHERE id = ? 
            `, [storeId]);

            res.locals.storeInfo = storeInfo[0] || {};
            req.session.Catagori = storeInfo[0].Catagori;

            console.log("storeInfo", {
                storeInfoCatagoxi: req.session.Catagori,
                storeInfo: storeInfo
            });
            const [roles] = await db.execute(`
                SELECT sr.store_id, sr.role_id, s.CompanyName, s.id
                FROM store_user_roles sr
                INNER JOIN sellers s ON sr.store_id = s.id
                WHERE sr.store_id = ? and sr.user_id=?
            `, [storeId,req.session.userId]);
            console.log("roles",roles)


            res.locals.stores = roles[0] || [];
        }


    } catch (error) {
        console.error("Error retrieving stores or user info:", error);
    }

    next();
};

module.exports = haveRoles;
