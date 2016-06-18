//学年成绩

var mongo = require("../mongo/mongo");
var getScores = require("./getScores");

function year (username, password, session, year, semester, update, callback) {
	// console.log("\n\nasd\n\n");
	var updateFunc = function(){
		getScores(username, session, function(err, result){
			if(err)
			{
				callback(err, result);
				return;
			}
			var updateTime = result["updateTime"];
			result = result["score"];
			var scores = returnScore(result, year, semester);
			if(!scores)
			{
				callback("No Recode");
				return;
			}

			callback(false, {updateTime : updateTime,
								score : scores
							});
		});
	}


	if(update)
	{

		updateFunc();
	}
	else
	{

		mongo.findName(username, function(err, result){
			if(err)
			{
				callback(err, result);
				return;
			}
			if(result.length === 0)
			{
				callback("No Login");
				return;
			}
			if(!result[0].json)
			{
				updateFunc();
				return;
			}
			if(password != result[0].password)
			{
				callback("Error PSW");
				return;
			}
			var s = JSON.parse(result[0].json);
			var updateTime = s["updateTime"]; 
			var scores = returnScore(s["score"], year, semester);
			if(!scores)
			{
				callback("No Recode");
				return;
			}
			callback(false, {updateTime : updateTime,
								score : scores
							});
		});
	}

}

function returnScore(scores, year, semester){
	if(!year)
		return scores;
	else
	{
		for(var yearS = 0, len = scores.length; yearS < len; yearS ++)
		{
			if(scores[yearS]["year"] == year)
			{
				scores = scores[yearS]["Terms"];
				break;
			}
		}
		if(yearS === len)
			return false;
		if(!semester)
			return scores;
		for(var semeS = 0, len = scores.length; semeS < len; semeS ++)
		{
			if(scores[semeS]["Term"] == semester)
			{
				scores = scores[semeS]["Scores"];
				break;
			}
		}
		if(semeS === len)
			return false;
		return scores;

	}
}

module.exports = year;