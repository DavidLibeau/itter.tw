# itter.tw
Self hosted, open source, hackable and fully customizable Twitter client for everyone and for you.

More info at http://itter.tw.
You can follow [@ittertwclient](https://twitter.com/ittertwclient).


## Installation
>This client can be launched in local host. 

### What you need
* [NodeJS](https://nodejs.org/)
* Node modules :
  - [Twit](https://www.npmjs.com/package/twit)
  - [socket.io](https://socket.io/)
  - [ExpressJS](https://expressjs.com/)
* a web browser
* a valid Twitter account

### How to
1. Install all requirements
2. Put the _app.js_ and _index.html_ files in your server/localhost directory
3. Create an Twitter app at [apps.twitter.com](https://apps.twitter.com/app/new) with these info :
  * Name : <code>itter.tw</code>
  * Description : <code>itter.tw, cool Twitter client.</code>
  * Website : <code>https://itter.tw/</code>
4. Create a _tokens.json_ file, with the data of your app

 ```
 {
    "consumer_key":"...",
    "consumer_secret":"...",
    "access_token":"...",
    "access_token_secret":"..."
 }
 ```
 
5. Put your server adress in _index.html_

 ```
 var socket = io.connect('...');
 ```
 
6. Launch the script

 ```
 node apps.js
 ```
 
7. Connect to your page _index.html_ on port :8080
8. That'ts it. So simple!


##Contribute

>Yay!

Just contact me at [@DavidLibeau](https://twitter.com/DavidLibeau)! 
