const mysql = require("mysql2");
// var router = express.Router();

// 创建数据库连接池
const pool = mysql.createPool({
	host: "localhost", // 地址
	port: "3306", // 端口
	user: "root", // 用户名
	password: "123456", // 密码
	database: "zhou" // 数据库名称
});

// 3、数据校验封装
// 封装查询函数
const query = (sql, params) => {
	return new Promise((resolve, reject) => {
		pool.execute(sql, params, (error, results) => {
			if (error) reject(error);
			else resolve(results);
		});
	});
};

module.exports = { query };
