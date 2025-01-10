const sendResponse = require("./response.js");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "zhou-secret-key-123456"; // 秘钥
const EXPIRES_IN = "1m"; // 过期时间 1天

/**
 * 生成 token
 * @param {Object} payload - 要包含在 token 中的数据
 * @returns {String} 生成的 token
 */
const generateToken = (payload) => {
	return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
};

/**
 * 接口需要token验证
 * @param {*} req 请求对象
 * @param {*} res 响应对象
 * @param {*} next 下一步
 * @returns
 * Authorization: token
 */
function verifyToken(req, res, next) {
	const token = req.headers["authorization"];
	if (!token) return sendResponse(res, 401, "error", "token过期");
	// 验证 Token
	jwt.verify(token, SECRET_KEY, (err, user) => {
		if (err) return sendResponse(res, 401, "error", "token过期");
		next();
	});
}

module.exports = {
	generateToken,
	verifyToken
};
