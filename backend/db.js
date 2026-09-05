import mysql from "mysql2/promise";

const db = mysql.createPool(process.env.MYSQL_URL);

console.log("✅ Railway MySQL connection pool created!");

export default db;