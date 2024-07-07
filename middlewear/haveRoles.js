const db = require("../helpers/databas");

const haveRoles = async (req, res, next) => {
    if (req.session.userId) {
        try {
            const userId = req.session.userId;
            const [stores] = await db.execute(`
                SELECT sr.store_id,sr.role_id , s.CompanyName, s.id
                FROM store_user_roles sr
                INNER JOIN sellers s ON sr.store_id = s.id
                WHERE sr.user_id = ?
            `, [userId]);
            console.log("stores",{
                stores:stores
            })

            const [userInfo] = await db.execute(`
                SELECT FirstName, url FROM users WHERE id = ?
            `, [userId]);
            res.locals.stores = stores;
            res.locals.userInfo = userInfo[0]; // assuming userInfo[0] contains the user data
        } catch (error) {
            console.error("Error retrieving stores or user info:", error);
            res.locals.stores = [];
            res.locals.userInfo = {};
        }
    } else {
        res.locals.stores = [];
        res.locals.userInfo = {};
    }
    next();
};

module.exports = haveRoles;
