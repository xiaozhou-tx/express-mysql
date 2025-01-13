var express = require("express");
var router = express.Router();
var db = require("../mysql/index");
const sendResponse = require("../utils/response.js"); // 响应函数
const createRoute = require("../utils/router.js"); // 路由注册函数

// 获取用户列表
createRoute(router, "get", "/getUserList", async (req, res) => {
	const result = await db.query("select * from users");
	sendResponse(res, 200, "success", "请求成功", result);
});

module.exports = router;
