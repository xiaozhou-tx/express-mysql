// 常用code
// 400: "请求参数错误,其他报错信息",
// 401: "登录过期，请重新登录",
// 403: "没有权限，请联系管理员",
// 404: "请求地址不存在",
// 500: "服务器内部错误"

// sm4加密密钥
const encryptionKey = "zl19991013231300";

// token 密钥
const SECRET_KEY = "zhou-secret-key-123456";
// token 过期时间
const EXPIRES_IN = "24h";

module.exports = {
	encryptionKey,
	SECRET_KEY,
	EXPIRES_IN
};
