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
		component: require("./login") // 登录、注册
	},
	{
		component: require("./user") // 用户管理
	}
];

// 在此将所有路由模块手动导入并挂载到主路由
module.exports = (app) => {
	pages.forEach((page) => {
		app.use(`/${page.prefix || ""}`, page.component);
	});
};
