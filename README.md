@[TOC](node后端开发)

# 1. 项目简介

本项目是一个 Express 框架搭配 mysql 的后台管理系统后端开发

# 2.创建项目

- 使用 express 应用程序生成器生成项目：npx express-generator
- 初始化安装依赖：npm install

# 3.热更新

- 安装：npm install nodemon
- 修改："start": "nodemon ./bin/www" --- 修改 package.json 文件
- 启动：npm start

# 4.mysql2 数据库

- 安装：npm install mysql2
- 封装：

  ```js
  const mysql = require("mysql2");

  // 创建数据库连接池
  const pool = mysql.createPool({
  	host: "", // 地址
  	port: "", // 端口
  	user: "", // 用户名
  	password: "", // 密码
  	database: "" // 数据库名称
  });

  // 简单封装查询函数
  const query = (sql, params) => {
  	return new Promise((resolve, reject) => {
  		// 会主动释放连接
  		pool.execute(sql, params, (error, results) => {
  			if (error) reject(error);
  			else resolve(results);
  		});
  	});
  };

  module.exports = { query };
  ```

- 使用：

  ```js
  var db = require("../server/index");
  router.get("/getUserList", async (req, res) => {
  	try {
  		const result = await db.query("select * from users");
  		res.status(result.code).json(result); // 根据 code 返回不同状态码
  	} catch (error) {
  		res.status(error.code || 500).json(error); // 捕获错误并返回相应的 code 和错误信息
  	}
  });
  ```

- 产生问题：
  - ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client：点击查看[解决方案](https://blog.csdn.net/leilei__66/article/details/110674462?fromshare=blogdetail&sharetype=blogdetail&sharerId=110674462&sharerefer=PC&sharesource=qq_63744898&sharefrom=from_link)

# 5.封装路由模块

- 在 routes 文件夹下创建 pages.js

  ```js
  /**
   * 路由模块
   * prefix: 路由前缀
   * component: 路由组件
   */
  const pages = [
  	{
  		component: require("./index") // 主路由
  	},
  	{
  		component: require("./users") // 用户路由
  	}
  ];

  // 在此将所有路由模块手动导入并挂载到主路由
  module.exports = (app) => {
  	pages.forEach((page) => {
  		app.use(`/${page.prefix || ""}`, page.component);
  	});
  };
  ```

- 在 app.js 中使用

  ```js
  // 导入主路由模块
  const routes = require("./routes/pages");

  // 挂载路由：需要在挂载中间件之后
  routes(app);
  ```

# 6.封装响应函数

- 在 utils 文件夹下创建 response.js

  ```js
  /**
   * 响应函数
   * @param {*} res 响应对象
   * @param {*} statusCode 状态码
   * @param {*} status 状态
   * @param {*} message 消息
   * @param {*} data 数据
   */
  const sendResponse = (res, statusCode, status, message, data = null) => {
  	const response = {
  		status,
  		code: statusCode,
  		message,
  		data
  	};
  	res.status(statusCode).json(response);
  };

  module.exports = sendResponse;
  ```

- 使用：

  ```js
  // 导入响应函数
  const sendResponse = require("../utils/response");

  // 查询用户列表
  router.get("/getUserList", async (req, res) => {
  	try {
  		const result = await db.query("select * from users");
  		sendResponse(res, 200, "success", "请求成功", result);
  	} catch (error) {
  		sendResponse(res, 500, "error", error.message);
  	}
  });
  ```

# 7.验证数据

- 安装：npm install express-validator
- 封装：

  ```js
  const sendResponse = require("./response.js");
  const { validationResult } = require("express-validator");

  /**
   * 通用验证中间件生成器
   * @param {Array} validations - express-validator 的规则数组
   * @returns {Function} 中间件函数
   */
  const validate = (validations) => {
  	return async (req, res, next) => {
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
  ```

- 使用：

  ```js
  const { body } = require("express-validator");
  const sendResponse = require("../utils/response.js"); // 响应函数
  const validate = require("../utils/validate.js"); // 数据校验

  let loginValidators = [body("username").notEmpty().withMessage("用户名不能为空"), body("password").notEmpty().withMessage("密码不能为空")];
  router.post("/login", validate(loginValidators), async (req, res) => {
  	let { username, password } = req.body;
  	try {
  		const result = await db.query("select * from users where username =? and password =?", [username, password]);
  		if (result.length > 0) {
  			sendResponse(res, 200, "success", "登录成功", result);
  		} else {
  			sendResponse(res, 401, "error", "登录失败");
  		}
  	} catch (error) {
  		sendResponse(res, 500, "error", error.message);
  	}
  });
  ```

# 8、token

- 安装：npm install jsonwebtoken

- 生成 token：

  ```js
  const sendResponse = require("./response.js");
  const jwt = require("jsonwebtoken");
  const SECRET_KEY = "zhou-secret-key-123456"; // 秘钥
  const EXPIRES_IN = "24h"; // 过期时间 1天

  /**
   * 生成 token
   * @param {Object} payload - 要包含在 token 中的数据
   * @returns {String} 生成的 token
   */
  const generateToken = (payload) => {
  	return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
  };
  module.exports = { generateToken };
  ```

- 使用：

  ```js
  const { generateToken } = require("../utils/token.js"); // 生成token

  router.post("/login", async (req, res) => {
  	let { username, password } = req.body;
  	try {
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
  	} catch (error) {
  		sendResponse(res, 500, "error", error.message);
  	}
  });
  ```

- 封装验证接口 token 是否过期或者没有：

  ```js
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

  module.exports = { verifyToken };
  ```

- 使用：

  ```js
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
  ```

# 9、uuid

- 安装：npm install uuid
- 使用：

  ```js
  const { v4: uuidv4 } = require("uuid");
  // 生成uuid
  const uuid = uuidv4();
  ```

# 10、sm4 加解密

- 安装：npm install gm-crypt
- 参数解密(在封装的验证数据进行解密)：

  ```js
  const validate = (validations) => {
  	return async (req, res, next) => {
  		// 是否加密
  		let isEncryption = req.headers.isencryption;
  		// 解密post
  		if (isEncryption == "true") req.body = decrypt(req.body.toString());
  		console.log("请求：", req.body);

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
  ```

- 返回加密(在封装的返回数据进行加密)：
  ```js
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
  ```
- 注意：
  - 前端需要设置请求头 isEncryption(可以自己任意定义判断是否加密)
  - 前端需要设置请求头 Content-Type 为 'text/plain'
  - 后端在 app.json 需要配置解析文本中间件：app.use(express.raw({ type: "text/plain" }));
  - 加密解密需要自己封装
