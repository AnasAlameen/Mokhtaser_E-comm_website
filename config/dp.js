const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dreams",
});

// محاولة الاتصال بالقاعدة

module.exports = connection;
  