var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
	res.render("index", { title: "便捷开发系统" });
});

module.exports = router;
