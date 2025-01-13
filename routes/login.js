var express = require("express");
var router = express.Router();
var db = require("../mysql/index");
const { body } = require("express-validator");
const sendResponse = require("../utils/response.js"); // 响应函数
const validate = require("../utils/validate.js"); // 数据校验
const { generateToken } = require("../utils/token.js"); // 生成token
const createRoute = require("../utils/router.js"); // 路由注册函数
const { v4: uuidv4 } = require("uuid");

/**
 * 登录
 * @route POST /login
 * @param {string} username.body.required - 用户名
 * @param {string} password.body.required - 密码
 * @returns {object} 200 - 登录成功
 * @returns {object} 401 - 登录失败
 * @returns {object} 500 - 服务器错误
 * @example
 * {
 *   "username": "admin",
 *   "password": "123456"
 * }
 */
let loginValidators = [body("username").notEmpty().withMessage("用户名不能为空"), body("password").notEmpty().withMessage("密码不能为空")];
createRoute(router, "post", "/login", validate(loginValidators), async (req, res) => {
	let { username, password } = req.body;
	const result = await db.query("select * from users where username =? and password =?", [username, password]);
	if (result.length > 0) {
		// 生成token
		let userid = result[0].userid;
		let username = result[0].username;
		const token = generateToken({ userid, username });
		// 将token存入数据库
		await db.query("update users set token =? where username =?", [token, username]);
		// 返回数据
		result[0].token = token;
		sendResponse(res, 200, "success", "登录成功", result[0]);
	} else {
		sendResponse(res, 401, "error", "登录失败");
	}
});

/**
 * 注册
 * @route POST /register
 * @param {string} username.body.required - 用户名
 * @param {string} password.body.required - 密码
 * @returns {object} 200 - 注册成功
 * @returns {object} 401 - 注册失败
 * @returns {object} 500 - 服务器错误
 * @example
 * {
 *   "username": "admin",
 *   "password": "123456"
 * }
 */
let registerValidators = [body("username").notEmpty().withMessage("用户名不能为空"), body("password").notEmpty().withMessage("密码不能为空")];
createRoute(router, "post", "/register", validate(registerValidators), async (req, res) => {
	let { username, password } = req.body;
	const result = await db.query("select * from users where username =?", [username]);
	if (result.length > 0) {
		sendResponse(res, 401, "error", "用户名已存在");
	} else {
		// 生成userid随机数
		let userid = uuidv4();
		// 生成token
		const token = generateToken({ userid, username });
		// 生成创建时间
		let createTime = new Date().getTime();
		// 插入数据
		await db.query("insert into users (userid,username, password,token,createTime) values (?,?,?,?,?)", [userid, username, password, token, createTime]);
		// 返回数据
		const result1 = await db.query("select * from users where username =? and password =?", [username, password]);
		sendResponse(res, 200, "success", "注册成功", result1[0]);
	}
});

module.exports = router;
