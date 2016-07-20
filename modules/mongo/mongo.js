var mongoose = require("mongoose");

var options = {  
		server: {
			auto_reconnect: true,
			poolSize: 5
		}
	};

mongoose.connect('mongodb://127.0.0.1:27017/scores', options, function(err, res){
	if(err)
		console.log(err);
});

var db = mongoose.connection;

var mongooseSchema = new mongoose.Schema({
	username : {type: String},
	password : {type: String},
	name : {type: String},
	info : {type: String},
	json : {type: String}
});

mongooseSchema.statics.findbyId = function(username, callback) {
    return this.model('scores').find({username: username}, callback);
};

var mongooseModel = db.model('scores', mongooseSchema);

var add = function(doc, callback){
	mongooseModel.create(doc, function(error){
	    if(error) {
	        console.log(error);
	    } else {
	        console.log('save ' + doc.username);
	    }
	    if(callback)
	    	callback();
	    // db.close();
	});
};

var findName = function(username, callback){
	mongooseModel.findbyId(username, function(error, result){
		if(error)
		{
			console.log(error);
			callback("Server Error",error);
			return;
		}
		callback(false,result);
		// db.close();
	});
}

var update = function(username, newData, callback){
	mongooseModel.update(
		{username: username},
		{$set : newData},
		{upsert : true},
		function(err){
			if(err)
				console.log(err);
			if(callback)
				callback();
		}
	);
}

var getAllUser = function(callback){
	mongooseModel.find({},{username : 1, password : 1, _id : 0},callback);
}


exports.getAllUser = getAllUser;
exports.add = add;
exports.findName = findName;
exports.update = update;
