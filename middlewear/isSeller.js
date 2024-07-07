const db = require("../helpers/databas");

const haveRoles = async (req, res, next) => {
    if (req.session.userId) {
        try {
            const userId = req.session.userId;
            const storeId = req.params.storeId; // Assuming you want to use storeId from params

            // Fetch stores the user has access to
            const [stores] = await db.execute(`
                SELECT sr.store_id, sr.role_id, s.CompanyName, s.id
                FROM store_user_roles sr
                INNER JOIN sellers s ON sr.store_id = s.id
                WHERE sr.user_id = ? or sr.user_id=?
            `, [userId,userId]);

            // Fetch user info
            const [userInfo] = await db.execute(`
                SELECT FirstName, url FROM users WHERE id = ?
            `, [userId]);

            if (stores.length === 0) {
                // If no stores are found, send a 403 (Forbidden) response
                res.status(403).send('Access Denied');
            } else {
                // Set stores and userInfo in res.locals
                res.locals.stores = stores;
                res.locals.userInfo = userInfo[0] || {}; // Ensure userInfo[0] exists or set an empty object
                next(); // Continue to the next middleware/route handler
            }
        } catch (error) {
            console.error("Error retrieving stores or user info:", error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        // If the user is not authenticated, send a 401 (Unauthorized) response
        res.status(401).send('Unauthorized');
    }
};

module.exports = haveRoles;
