var request = require("request");
var iconv = require('iconv-lite');
var cheerio = require("cheerio");
var mongo = require("../mongo/mongo");

function getScores (username, session, callback) {
	mongo.findName(username, function(err, result){
		if(err)
		{
			callback(err, result);
			return;
		}
		if(result.length === 0)
		{
			callback("NO LOGIN");
			return;
		}
		var name = result[0].name;
		var url = "http://222.24.62.120/xscjcx.aspx?gnmkdm=N121605&"+
					"xh=" + username + "&xm=" + encodeURI(name);;
		request(
		{
			url: url,
			method: "GET",
			encoding: null,
			headers: {
				Referer: "http://222.24.62.120/xs_main.aspx?xh=" + username,
				Cookie: session
			}
		},
		function(err, res, body){
			if(err)
			{
				callback("Server Error",err);
				return;
			}
			if(Math.floor(res.statusCode / 100) === 3)
			{
				callback("Session Out");
				return;
			}
			body = iconv.decode(body, "GB2312").toString();
			if(body.indexOf("你还没有进行本学期的课堂教学质量评价") != -1)
			{
				callback("Need Assess");
				return;
			}
			var $ = cheerio.load(body);
			// console.log(body);
			var viewstate = $("input[name='__VIEWSTATE']").val();
			saveScores(username, name, session, viewstate, callback);
		}

		);


	});
}

function saveScores (username, name, session, viewstate, callback) {
	var url = "http://222.24.62.120/xscjcx.aspx?gnmkdm=N121605&"+
					"xh=" + username + "&xm=" + encodeURI(name);;
	var form = {
		__EVENTTARGET: "",
		__EVENTARGUMENT: "",
		__VIEWSTATE: viewstate,
		hidLanguage: "",
		ddlXN:"",
		ddlXQ:"",
		ddl_kcxz:"",
		btn_zcj:"历年成绩"
	};

	request(
	{
		url: url,
		method: "POST",
		encoding: null,
		headers: {
			Referer: "http://222.24.62.120/xs_main.aspx?xh=" + username,
			Cookie: session
		},
		form : form
	},
	function(err, res, body){
		if(err)
		{
			callback("Server Error",err);
			return;
		}
		if(Math.floor(res.statusCode / 100) === 3)
		{
			callback("Session Out");
			return;
		}
		body = iconv.decode(body, "GB2312").toString();
		var $ = cheerio.load(body);
		var allviewstate = $("input[name='__VIEWSTATE']").val();
		var newviewstate = viewstateScores(allviewstate);
		mongo.update(username, {json: JSON.stringify(newviewstate)});
		console.log("json " + username);
		callback(false, newviewstate);
	}
	);

}

function viewstateScores (viewstate){
	var scoreStr = new Buffer(viewstate, 'base64').toString();
	var index = scoreStr.indexOf("在校学习成绩");
	scoreStr = scoreStr.substr(index, scoreStr.length - 1);
	scoreStr = scoreStr.replace(/</g, "");
    scoreStr = scoreStr.replace(/>/g, " ");
    scoreStr = scoreStr.replace(/&nbsp/g, "");
    scoreStr = scoreStr.replace(/Text/g, "");
    scoreStr = scoreStr.replace(/\\/g, "");
    scoreStr = scoreStr.replace(/;t/g, "");
    scoreStr = scoreStr.replace(/;p/g, "");
    scoreStr = scoreStr.replace(/;l/g, "");
    scoreStr = scoreStr.replace(/;i/g, "");
    scoreStr = scoreStr.replace(/;/g, "");
    scoreStr = scoreStr.replace(/ppl/g, "");
    scoreStr = scoreStr.replace(/Visible/g, "");
    scoreStr = scoreStr.replace(/ot /g, "");

    var strArr = scoreStr.split("i0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27  t");
	
	var t1 = strArr[0].replace("    i1 3 5 7 9 11 13 15 17 18 19 21 23 25 27 29 35 41 43 44  t of     @0PageCount_!ItemCount_!DataSourceItemCountDataKeys 1 73 73    lstyle DISPLAY:block   @0@0pl of    @0pl of    @0pl of    @0pl of    @0pl      i0  ti1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73  t","");

	//获取学生信息
	// var II = t1.split(' ');

	// var id = II[5].replace("学号：","");
	// var name = II[10].replace("姓名：","");
	// var school = II[15].replace("学院：","");
	// var major = II[25];
	// var cls = II[35].replace("行政班：","");

	strArr[strArr.length - 1] =  strArr[strArr.length - 1].substr(0, strArr[strArr.length - 1].indexOf("e    "));
	
	var YearData = [],
		T1ScoreData = [],
		T2ScoreData = [];
	var year = false;
	for(var i = 1, len = strArr.length; i < len; i ++){
		var temList = [];
		var temArr = strArr[i].split(" ");
		var count = 0;
		for(var j = 0; j < temArr.length; j++){
			if(temArr[j] && temArr[j] != "e")
			{
				count++;
				temList.push(temArr[j]);
			}
		}
		if(!year)
			year = temList[0];
		else
		{
			if(year != temList[0])
			{
				var Terms = [];
				var yearScore = {};
				yearScore.year = year;
				var tt1 = {
					Term : "1",
					Scores : T1ScoreData
				};
				Terms.push(tt1);
				if(T2ScoreData){
					var tt2 = {
						Term : "2",
						Scores : T2ScoreData
					};
					Terms.push(tt2);
				}
				yearScore.Terms = Terms;
				YearData.push(yearScore);
				T1ScoreData = [];
				T2ScoreData = [];
				year = temList[0];

			}
		}

		if(temList[4].indexOf("（") != -1)
			temList.splice(4,1);
		if(!isNaN(Number(temList[5])))
			temList.splice(5,1);
		var info = {
			Code :  temList[2],
			Title : temList[3],
			Type : temList[4],
			Credit : temList[5],
			UsualScore : temList[6],
			RealScore : temList[7]
		};
		var sc, k;
		for(k = temList.length - 1; k > 0; k--)
		{
			sc = temList[k];
			if(sc === temList[k - 1])
			{
				info.EndScore = sc;
				break;
			}
		}
		var TestScoreList = [];
		for(var m = 8; m < k - 1; m++){
			TestScoreList.push(temList[m]);
		}
		info.TestScore = TestScoreList;
		if(!info.EndScore)
			info.EndScore = info.RealScore;
		if(info.EndScore === "优秀" || info.EndScore === "良好" || info.EndScore === "中等" || info.EndScore === "及格")
		{
			for(var n = 0; n < temList.length; n++)
			{
				if(temList[n] === info.EndScore)
				{
					if(!isNaN(Number(temList[n + 1])))
					{
						TestScoreList.push(temList[n + 1]);
						break;
					}
				}
			}
		}
		info.Exam = "正考通过";
		var EndSc = 60;
		if(info.Credit == 0)
		{
			if(!isNaN(Number(info.EndScore)))
			{
				EndSc = info.EndScore - 0;
			}
			else
			{
				if(info.EndScore === "优秀" || info.EndScore === "良好" || info.EndScore === "中等" || info.EndScore === "及格")
					EndSc = 60;
				else
					EndSc = 59;
			}
			if(EndSc < 60)
			{
				for(var n = temList.length - 1; n > k; n--)
				{
					var rs = 60;
					if(!isNaN(Number(temList[n])))
					{
						info.ReScore = temList[n];
						rs = info.ReScore - 0;
						if(rs >= 60)
							info.Exam = "补考通过";
						else
							info.Exam = "补考未通过";
						break;
					}
					// else {
					// 	if(info.ReScore === "优秀" || info.ReScore === "良好" || info.ReScore === "中等" || info.ReScore === "及格")
					// 	{
					// 		rs = 60;
					// 	}
					// 	else
					// 		rs = 59;
					// }
				}
				if(!info.ReScore || info.ReScore == 0)
					info.Exam = "补考未通过";
			}
		}
		if(temList[temList.length - 1] === "重修")
		{
			var redos = 60;
			if(!isNaN(Number(info.EndScore)))
			{
				redos = info.EndScore - 0;
			}
			else
			{
				if(info.EndScore === "优秀" || info.EndScore === "良好" || info.EndScore === "中等" || info.EndScore === "及格")
				{
					redos = 60;
				}
				else
					redos = 59;
			}
			if(redos >= 60)
				info.Exam = "重修通过";
			else
				info.Exam = "重修未通过";
			info.School = temList[temList.length - 2];
		}
		else if(temList[temList.length - 1] === "缺考"){
			info.Exam = "缺考";
			info.School = temList[temList.length - 2];
		}
		else{
			info.School = temList[temList.length - 1];
		}

		if(temList[1] == 1)
			T1ScoreData.push(info);
		else if(temList[1] == 2)
			T2ScoreData.push(info);
		if(info.Exam == "正考通过" || info.Exam == "重修通过"){
			info.ReScore = "";
		}
	}

	var Terms1 = [], yearScore1 = {};
	yearScore1.year = year;
	var tt11 = {
		Term : "1",
		Scores : T1ScoreData
	};
	Terms1.push(tt11);
	if(T2ScoreData)
	{
		var tt21 = {
			Term : "2",
			Scores : T2ScoreData
		};
		Terms1.push(tt21);
	}
	yearScore1.Terms = Terms1;
	YearData.push(yearScore1);

	return {updateTime : (new Date()).toString(),
			score : YearData
			};
}

module.exports = getScores;