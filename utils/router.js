/**
 * 通用路由函数
 * @param {*} router 路由对象
 * @param {*} method 请求方法
 * @param {*} path 请求路径
 * @param {*} validators 中间件
 * @param {*} handler 处理函数
 */
const createRoute = (router, method, path, validators, handler) => {
	router[method](path, validators, async (req, res) => {
		try {
			await handler(req, res);
		} catch (error) {
			sendResponse(res, 500, "error", error.message);
		}
	});
};

module.exports = createRoute;
