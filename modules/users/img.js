

var request = require("request");
var mongo = require("../mongo/mongo");

function getImg (username, session, res, callback) {

	mongo.findName(username, function(err,result){
		if(err)
		{
			callback(err, result);
			return;
		}
		if(result.length === 0)
		{
			callback("NO Login");
			return;
		}

		var url = "http://222.24.62.120/readimagexs.aspx?xh=" + username;
		var referer = "http://222.24.62.120/xsgrxx.aspx?gnmkdm=N121501&" +
						"xh=" + username + "&xm=" + encodeURI(result[0].name);
		request(
		{
			url: url,
			method: "GET",
			// encoding: null,
			Accept : "image/webp,image/*,*/*;q=0.8",
			headers: {
				Referer: referer,
				Cookie: session
			}
		}
		).pipe(res);
	});	
}


module.exports = getImg;


