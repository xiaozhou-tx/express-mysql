var express = require("express");
var router = express.Router();
var db = require("../mysql/index");
const { body } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const sendResponse = require("../utils/response.js"); // 响应函数
const validate = require("../utils/validate.js"); // 数据校验
const { generateToken } = require("../utils/token.js"); // 生成token
const createRoute = require("../utils/router.js"); // 路由注册函数
const { encrypt } = require("../utils/sm4");
const { EXPIRES_IN } = require("../utils/config");
const moment = require("moment");
const now = moment();

/**
 * 登录
 * @route POST /login
 * @param {string} username.body.required - 用户名
 * @param {string} password.body.required - 密码
 * @returns {object} 200 - 登录成功
 * @returns {object} 400 - 登录失败
 * @returns {object} 500 - 服务器错误
 */

let loginValidators = [body("username").notEmpty().withMessage("用户名不能为空"), body("password").notEmpty().withMessage("密码不能为空")];
createRoute(router, "post", "/login", validate(loginValidators), async (req, res) => {
	let { username, password, expireTime } = req.body;
	password = encrypt(password);
	const result = await db.query("select * from users where username =? and password =?", [username, password]);
	if (result.length > 0) {
		// 更新token和过期时间
		let userid = result[0].userid;
		let username = result[0].username;
		expireTime = expireTime || EXPIRES_IN;
		const token = generateToken({ userid, username }, expireTime);
		await db.query("update users set token =?,expireTime=? where username =?", [token, expireTime, username]);

		// 返回数据
		const result1 = await db.query("select * from users where username =? and password =?", [username, password]);
		result1[0].createTime = now.format("YYYY-MM-DD HH:mm:ss");
		sendResponse(res, 200, "success", "登录成功", result1[0]);
	} else {
		sendResponse(res, 400, "error", "登录失败");
	}
});

/**
 * 注册
 * @route POST /register
 * @param {string} username.body.required - 用户名
 * @param {string} password.body.required - 密码
 * @returns {object} 200 - 注册成功
 * @returns {object} 400 - 注册失败
 * @returns {object} 500 - 服务器错误
 */
let registerValidators = [
	body("username").notEmpty().withMessage("用户名不能为空").isLength({ min: 4, max: 16 }).withMessage("用户名长度必须要满足最小4位,最大16位"),
	body("password")
		.notEmpty()
		.withMessage("密码不能为空")
		.isLength({ min: 6, max: 16 })
		.withMessage("密码长度必须要满足最小4位,最大16位")
		.matches(/^\S*(?=\S*\d)(?=\S*[a-zA-Z])\S*$/)
		.withMessage("密码必须包含数字和字母")
];
createRoute(router, "post", "/register", validate(registerValidators), async (req, res) => {
	let { username, password, expireTime } = req.body;
	const result = await db.query("select * from users where username =?", [username]);
	if (result.length > 0) {
		sendResponse(res, 400, "error", "用户名已存在");
	} else {
		let userid = uuidv4(); // 生成userid随机数
		// 生成token
		expireTime = expireTime || EXPIRES_IN;
		const token = generateToken({ userid, username }, expireTime);
		let createTime = now.format("YYYY-MM-DD HH:mm:ss"); // 生成创建时间
		password = encrypt(password); // 加密密码
		// 插入数据
		await db.query("insert into users (userid,username,password,token,expireTime,createTime) values (?,?,?,?,?,?)", [
			userid,
			username,
			password,
			token,
			expireTime,
			createTime
		]);

		// 返回数据
		const result1 = await db.query("select * from users where username =? and password =?", [username, password]);
		result1[0].createTime = now.format("YYYY-MM-DD HH:mm:ss");
		sendResponse(res, 200, "success", "注册成功", result1[0]);
	}
});

module.exports = router;
