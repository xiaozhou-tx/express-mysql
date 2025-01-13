const { encrypt } = require("./sm4");

/**
 * 响应函数
 * @param {*} res 响应对象
 * @param {*} statusCode 状态码
 * @param {*} status 状态
 * @param {*} message 消息
 * @param {*} data 数据
 */
const sendResponse = (res, statusCode, status, message, data = null) => {
	console.log("响应：", { status, code: statusCode, message, data });
	// 是否加密
	let isEncryption = res.req.headers.isencryption;
	// 加密
	if (isEncryption == "true") data = encrypt(JSON.stringify(data));
	const response = {
		status,
		code: statusCode,
		message,
		data
	};
	res.status(statusCode).json(response);
};

module.exports = sendResponse;
