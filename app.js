var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// 导入主路由模块
const routes = require("./routes/pages");

var app = express();

// 设置视图引擎
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// 中间件
app.use(logger("dev")); // 日志
app.use(express.json()); // 解析JSON
app.use(express.urlencoded({ extended: false })); // 解析URL-encoded
app.use(cookieParser()); // 解析Cookie
app.use(express.static(path.join(__dirname, "public"))); // 静态文件

// 挂载路由
routes(app);

// 捕获404并转发到错误处理程序
app.use(function (req, res, next) {
	next(createError(404));
});

// 错误处理程序
app.use(function (err, req, res, next) {
	// 设置局部变量，仅在开发中提供错误
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// 渲染错误页面
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
