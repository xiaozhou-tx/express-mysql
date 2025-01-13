var express = require("express");
var router = express.Router();
var db = require("../mysql/index");
const sendResponse = require("../utils/response.js"); // 响应函数
const createRoute = require("../utils/router.js"); // 路由注册函数
const validate = require("../utils/validate.js"); // 数据校验

// 获取用户列表
let userListValidators = [];
createRoute(router, "get", "/user/list", validate(userListValidators), async (req, res) => {
	let { username, sex, date, pageCurrent, pageSize } = req.query;
	// 模糊查询
	let sql = "SELECT * FROM users WHERE 1=1";
	if (username) sql += ` AND username LIKE '%${username}%'`;
	if (sex) sql += ` AND sex = ${sex}`;
	if (date) sql += ` AND date = '${date}'`;
	// 分页
	let total = await db.query(sql);
	let start = (pageCurrent - 1) * pageSize;
	let end = pageSize;
	sql += ` LIMIT ${start}, ${end}`;
	let list = await db.query(sql);

	sendResponse(res, 200, "success", "请求成功", {
		list,
		pageCurrent,
		pageSize,
		total: total.length
	});
});

module.exports = router;
