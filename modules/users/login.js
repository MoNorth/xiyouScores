//登陆 获取session

var request = require("request");
var mongo = require("../mongo/mongo");
var iconv = require('iconv-lite');
var cheerio = require("cheerio");
var getInfo = require("./info");
var getScores = require("../score/getScores");
var scoreQ = require("../queue/score");
var infoQ = require("../queue/info");

function login (username, password, callback) {
	if (username == '' || password == '') {
        callback('Account Error');
        return;
    }

    var url = "http://222.24.62.120/default4.aspx";
    var data = {
    	'__VIEWSTATE': "dDwxMTE4MjQwNDc1Ozs+YofaNxf5dpXqcC3ZAqYdKfPCdbw=",
		'TextBox1': username,
		'TextBox2': password,
		'RadioButtonList1': "%D1%A7%C9%FA",
		'Button1': "+%B5%C7+%C2%BC+"
    };

    request(
    {
    	url: url,
    	method: 'POST',
    	form: data
    },
    function(err, res, body) {
    	if(err)
    	{
    		callback("Server Error",err);
    		return;
    	}
    	var session = res.headers['set-cookie'];
    	var location = res.headers['location'];
    	if(!location || !session)
    	{
    		callback('Account Error');
    		return;
    	}
    	mongo.findName(username, function(err, result){
            if(err)
            {
                console.log(err,result);
            }
    		if(result.length === 0)
    			getName(username, password, session[0], callback);
            else if(result[0].name == "")
            {
                getName(username, password, session[0], callback, true);
            }
            else
            {
                callback(false, {session: session[0].substr(0,session[0].indexOf(";"))});
                if(password != result[0].password)
                    mongo.update(username,{password : password});
            }
            // else 
            // {
            //     if(!result[0].info)
            //         getInfo(username, session[0], function(err){
            //             if(err)
            //                 console.log(err);
            //         });
            //     if(!result[0].json)
            //         getScores(username, session[0], function(err){
            //             if(err)
            //                 console.log(err);
            //         })

            // }

    	});
    	
    }
    );
}

function getName(username, password, session, callback, isFixName){
	request(
	{
		url: "http://222.24.62.120/xs_main.aspx?xh=" + username,
		method: "GET",
		encoding: null,
		headers: {
			Referer: "http://222.24.62.120/default2.aspx",
			Cookie: session
		}
	},
	function(err, res, body){
		if(err)
		{
			console.log(err);
			return;
		}
		body = iconv.decode(body, "GB2312").toString();
		var $ = cheerio.load(body);
		var name = $("#xhxm").text().replace("同学","");

        function addOrFixCallback(){
            scoreQ.addUser(username, {});
            infoQ.addUser(username, {});
            callback(false, {session: session.substr(0,session.indexOf(";"))});
            getInfo(username, password, session, function(err){
                        infoQ.removeUser(username);
                        if(err)
                            console.log(err);
                    });
            getScores(username, session, function(err){
                scoreQ.removeUser(username);
                if(err)
                    console.log(err);
            })
            console.log("newLogin " + username);
        }
        if(isFixName)
            mongo.update(username,{name:name},addOrFixCallback);
        else
            mongo.add({username: username, password: password, name: name},addOrFixCallback);	
	}
	);

}

module.exports = login;