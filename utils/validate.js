const sendResponse = require("./response.js");
const { validationResult } = require("express-validator");
const { decrypt } = require("./sm4.js");

/**
 * 通用验证中间件生成器
 * @param {Array} validations - express-validator 的规则数组
 * @returns {Function} 中间件函数
 * @returns {object} 400 - 验证不通过
 * @example
 * validations = [
 * 	body("username").notEmpty().withMessage("用户名不能为空"),
 * 	body("password").notEmpty().withMessage("密码不能为空")
 * ];
 */
const validate = (validations) => {
	return async (req, res, next) => {
		// 是否加密
		let isEncryption = req.headers.isencryption;

		// 解密post
		if (req.method == "POST" && isEncryption == "true" && req.body) {
			req.body = decrypt(req.body.toString());
			console.log("请求：", req.body);
		}
		// 解密get
		if (req.method == "GET" && isEncryption == "true" && req.url.split("?")[1]) {
			req.query = decrypt(req.url.split("?")[1]);
			console.log("请求：", req.query);
		}

		// 执行验证规则
		for (const validation of validations) {
			const result = await validation.run(req);
			if (result.errors.length) break;
		}
		// 检查验证结果
		const errors = validationResult(req);
		if (!errors.isEmpty()) return sendResponse(res, 400, "error", errors.array()[0].msg);
		next();
	};
};

module.exports = validate;
