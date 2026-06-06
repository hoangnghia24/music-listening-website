const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo Connection Pool để tối ưu hiệu năng truy xuất đồng thời
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;