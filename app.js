var tokens  = require('./tokens.json');
/* File tokens.json (get yours at https://apps.twitter.com/ )
{
  "consumer_key":"...",
  "consumer_secret":"...",
  "access_token":"...",
  "access_token_secret":"..."
}
*/

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	socket.emit('init', { data: 'ping' });
	socket.on('init', function (data) {
		console.log("//Connected");
	});
  
	var Twit = require('twit');
 
	var T = new Twit(tokens);

	var stream = T.stream('user');
	 
	stream.on('tweet', function (tweet) {
	  //console.log("@"+tweet.user.screen_name+": "+tweet.text);
	  socket.emit('timelineUpdate', { newTweet: tweet });
	});

});

