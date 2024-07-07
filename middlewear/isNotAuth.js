module.exports = (req, res, next) => {
    if (req.session.isLoggedIn) {
           
        if(req.session.role==="user"){
            return res.redirect("/user/Home");

        }
         if(req.session.role_id===1  || 2 || 4)
        {
            const storeId=req.session.storeId;
            const role= req.session.role;

            return res.redirect(`/shop/shop?storeId=${storeId}&role=${role}`);

        }else{
            return res.redirect("/shop/home");


        }
          
    }
    next();
};
