const { sm4 } = require("gm-crypt");
const convertFormat = require("./formatConversio.js");
const { encryptionKey } = require("./config.js");

// 配置
let sm4Config = {
	mode: "ecb", // 加密模式，可选值："ecb"、"cbc"
	key: encryptionKey // 16字符密钥
	// iv: "" // 16字符初始向量, 仅cbc模式需要
};
let SM4 = new sm4(sm4Config);

let format = "utf8"; // 默认加密格式

/**
 * 加密
 * @param {*} content 待加密内容
 * @returns
 */
function encrypt(content) {
	// 判断content是否为字符串
	let plaintext = "";
	if (typeof content === "string") plaintext = content;
	else plaintext = JSON.stringify(content);
	let ciphertext = SM4.encrypt(plaintext);
	ciphertext = convertFormat(ciphertext, "utf8", format);
	return ciphertext;
}

/**
 * 解密
 * @param {*} content 待解密内容
 * @returns
 */
function decrypt(content) {
	content = convertFormat(content, format, "utf8");
	let plaintext = SM4.decrypt(content);
	// 判断plaintext是否为json字符串
	let ciphertext;
	try {
		ciphertext = JSON.parse(plaintext);
	} catch (e) {
		return (ciphertext = plaintext);
	}
	return ciphertext;
}

module.exports = {
	encrypt,
	decrypt
};
