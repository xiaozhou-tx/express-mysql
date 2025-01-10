var express = require("express");
var router = express.Router();
var db = require("../mysql/index");
const sendResponse = require("../utils/response.js"); // 响应函数
const { verifyToken } = require("../utils/token.js"); // 验证token

// 获取用户列表
router.get("/getUserList", verifyToken, async (req, res) => {
	try {
		const result = await db.query("select * from users");
		sendResponse(res, 200, "success", "请求成功", result);
	} catch (error) {
		sendResponse(res, 500, "error", error.message);
	}
});

module.exports = router;
