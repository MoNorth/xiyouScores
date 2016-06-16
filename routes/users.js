var express = require('express');
var router = express.Router();

var login = require("../modules/users/login");
var info = require("../modules/users/info");
var json = require("../modules/json");



//登陆
router.use('/login', function(req, res){
	var username = req.param("username");
	var password = req.param("password");
	login(username, password, function(err, result){
		json(res, err, result);
	});
});

router.use('/info', function(req, res){
	var username = req.param("username");
	var session = req.param("session");
	var password = req.param("password");
	info(username, password, session, function(err, result){
		json(res, err, result);
	});
});





module.exports = router;
