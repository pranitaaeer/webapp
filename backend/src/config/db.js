import mysql from "mysql2/promise";

console.log("DB_HOST loaded:", Boolean(process.env.DB_HOST));
console.log("DB_USER loaded:", Boolean(process.env.DB_USER));
console.log("DB_PASS loaded:", Boolean(process.env.DB_PASS));
console.log("DB_NAME loaded:", Boolean(process.env.DB_NAME));
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export default pool;