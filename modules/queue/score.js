//成绩等待队列

var queue = {};


exports.addUser = function(username, handler){
	queue[username] = handler;
}


exports.removeUser = function(username){
	if(queue[username].event)
		queue[username].event.call();
	delete queue[username];
}

exports.testUser = function(username){
	if(queue[username])
		return true;
	else
		return false;
}

exports.addEvent = function(username, event){
	queue[username].event = event;
}