function json (res,err,result) {
	if(err)
	{
		switch(err){
			case "Server Error":
				res.status(500).jsonp({error:result});
				break;
			default: 
				// res.json({
				// 	error: true,
				// 	result: err
				// });
				res.jsonp({
					error: true,
					result: err
				});
		}
	}
	else{
		res.jsonp({
			error: false,
			result: result
		})
	}
}

module.exports = json;