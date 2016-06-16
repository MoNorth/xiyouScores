var express = require('express');
var router = express.Router();

// var notThrough = require("../modules/score/notThrough");
var getScores = require("../modules/score/getScores");
var getYears = require("../modules/score/yearScore");
// var all = require("../modules/score/all");
var json = require("../modules/json");

// router.use('/not', function(req, res){
// 	var username = req.param("username");
// 	var session = req.param("session");
// 	notThrough(username, session, function(err, result){
// 		json(res, err, result);
// 	});
// });





router.use('/all', function(req, res){
	var username = req.param("username");
	var session = req.param("session");
	var password = req.param("password");
	getScores(username, session, function(err, result){
		json(res, err, result);
	});
});

router.use('/year', function(req, res){
	var username = req.param("username");
	var session = req.param("session");
	var year = req.param("year");
	var semester = req.param("semester");
	var update = req.param("update");
	var password = req.param("password");
	getYears(username, password, session, year, semester, update, function(err, result){
		json(res, err, result);
	});
});




module.exports = router;