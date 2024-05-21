const mysql=require("mysql2");


const pool= mysql.createPool({
    host:"localhost",
    user:"root",
    database:"Mokhtasar",
    password:"",
})
if(pool)
{
    console.log("database worked sis");
}
module.exports=pool.promise();


