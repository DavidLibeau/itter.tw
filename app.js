var tokens  = require('./tokens.json');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const util = require('util');

server.listen(8080);

console.log("app.js started");

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('static'));

var id=0;

io.on('connection', function (socket) {
	var userid=id++;
	socket.emit('init', { id: userid });
	socket.on('init', function (data) {
		console.log("//Client ["+userid+"] connected");
	});
  
	var Twit = require('twit');
 
	var T = new Twit(tokens);

	var stream = T.stream('user', { tweet_mode: 'extended' });
	//var stream = T.stream('statuses/sample');
	//var stream = T.stream('statuses/filter', { track: 'youtube' });	 
	
	stream.on('connect', function (request) {
		socket.emit('console', { data: "//Twitter.com stream connection" });
	});
	stream.on('connected', function (response) {
		socket.emit('console', { data: "//Twitter.com stream connected" });
	});
	stream.on('disconnect', function (disconnectMessage) {
		socket.emit('console', { data: "//Twitter.com stream disconnected : "+disconnectMessage });
	});
	stream.on('reconnect', function (request, response, connectInterval) {
		socket.emit('console', { data: "//Twitter.com stream reconnection : "+connectInterval+"ms" });
	});
	stream.on('warning', function (warning) {
		socket.emit('console', { data: "//Twitter.com stream warning : "+warning });
	});
	

	T.get('statuses/home_timeline', { count: 20, tweet_mode: 'extended' } , function(err, data) {
		for (var i = data.length-1; i >=  0; i--) {
			socket.emit('timelineUpdate', { tweet: data[i]});
		}
	});
	
	T.get('application/rate_limit_status', function(err, data) {
		socket.emit('console', { data: data});
	});
	
	stream.on('tweet', function (tweet) {
	  //console.log("@"+tweet.user.screen_name+": "+tweet.text);
	  socket.emit('timelineUpdate', { tweet: tweet});
	});
	
	stream.on('user_event', function (event) {
		socket.emit('console', { data: event });
	});
	
	socket.on('disconnect', function () {
		stream.stop();
		console.log("//Client ["+userid+"] disconnected");
	});

    
    // Search / Inspect
    
    socket.on('request', function (data) {
		if(data.type=='search'){
            T.get('search/tweets', { q: data.query, count: 10 }, function(err, data, response) {
              socket.emit('respond', { 
                  type: 'search',
                  response: data
              });
            });
        }else if(data.type=='tweet/lookup'){
            T.get('statuses/show', { id: data.query }, function(err, data, response) {
              socket.emit('respond', { 
                  type: 'tweet/lookup',
                  response: data
              });
            });
        }
	});
    
    
});

