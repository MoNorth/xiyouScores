var express = require('express');
var router = express.Router();

var makeup = require("../modules/makeup/makeup");
var json = require("../modules/json");



//登陆
router.use('/', function(req, res){
	var username = req.param("username");
	var session = req.param("session");
	makeup(username, session, function(err, result){
		json(res, err, result);
	});
});






module.exports = router;
