// 常用code
// 200 - 请求成功
// 400 - 验证不通过
// 401 - 未授权、请求失败
// 500 - 服务器错误
// 403 - 权限不足

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
