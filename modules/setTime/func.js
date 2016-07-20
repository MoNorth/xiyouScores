//定时任务内容
var request = require("request");
var mongo = require("../mongo/mongo");
var login = require("../users/login");
var scores = require("../score/getScores");

function func(){
	mongo.getAllUser(function(err,result){
		if(err)
		{
			console.log("GETUSER ERROR");
			return;
		}
		var index = 0, len = result.length;
		(function getScores(){
			if(index >= len)
			{
				console.log("UPDATE OVER");
				return;
			}
			login(result[index].username,result[index].password,function(err,results){
				if(err)
				{
					console.log(result[index].username + "UPDATE GETNAME ERROR");
					index ++;
					getScores();
				}
				else
				{
					scores(result[index].username,results.session,function(err){
						if(err)
						{
							console.log(result[index].username + "UPDATE REQUEST ERROR");
						}
						else
						{
							console.log(result[index].username + "UPDATE OK");
						}
							index ++;
							getScores();
					});
				}
			});
		})();




	});
}

module.exports = func;