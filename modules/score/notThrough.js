var request = require("request");
var iconv = require('iconv-lite');
var cheerio = require("cheerio");
var mongo = require("../mongo/mongo");

function notThrough (username, session, callback) {
	mongo.findName(username, function(result){
		if(result.length === 0)
		{
			callback("NO LOGIN");
			return;
		}
		var name = result[0].name;
		var url = "http://222.24.62.120/xscjcx.aspx?gnmkdm=N121605&"+
					"xh=" + username + "&xm=" + name;
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
			body = iconv.decode(body, "GB2312").toString();
			var $ = cheerio.load(body);
			var table = $("#Datagrid3 tr").slice(1);
			var datas = [];
			table.each(function(i){
				var data = {};
				var item = $(this).find("td");
				data.className = item.eq(1).text();
				data.nature = item.eq(2).text();
				data.credit = item.eq(3).text();
				data.highest = item.eq(4).text();
				datas.push(data);
			});
			callback(false,datas);
		}

		);


	});
}

module.exports = notThrough;