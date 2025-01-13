/**
 * 将 UTF-8 编码的字符串转换为十六进制字符串
 * @param {string} str - 要转换的 UTF-8 字符串
 * @returns {string} - 转换后的十六进制字符串
 */
function utf8ToHex(str) {
	const utf8Bytes = new TextEncoder().encode(str); // 将字符串转为 UTF-8 字节数组
	return Array.from(utf8Bytes)
		.map((byte) => byte.toString(16).padStart(2, "0")) // 转为 16 进制并填充两位
		.join(""); // 拼接成 HEX 字符串
}

/**
 * 将十六进制字符串转换为 UTF-8 编码的字符串
 * @param {string} str - 要转换的十六进制字符串
 * @returns {string} - 转换后的 UTF-8 字符串
 * @throws {Error} - 如果输入的十六进制字符串长度不是偶数，则抛出错误
 */
function hexToUtf8(str) {
	// 检查 HEX 字符串长度是否是偶数
	if (str.length % 2 !== 0) {
		throw new Error("Invalid HEX string");
	}
	// 将 HEX 转换为字节数组
	const bytes = [];
	for (let i = 0; i < str.length; i += 2) {
		bytes.push(parseInt(str.slice(i, i + 2), 16));
	}
	// 使用 TextDecoder 将字节数组解码为 UTF-8 字符串
	return new TextDecoder().decode(new Uint8Array(bytes));
}

/**
 * utf8转换成base64、hex，或者base64、hex转换成base64
 * @param {string} str - 要转换的字符串
 * @param {string} from - 要转换的格式
 * @param {string} to - 要转换到的格式
 * @returns {string} - 转换后的字符串
 */
function convertFormat(str, from, to) {
	if (from === to) return str;
	if (from === "utf8" && to === "hex") return utf8ToHex(str);
	if (from === "utf8" && to === "base64") return btoa(str);
	if (from === "hex" && to === "utf8") return hexToUtf8(str);
	if (from === "base64" && to === "utf8") return atob(str);
	return str;
}
module.exports = convertFormat;
