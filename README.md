# itter.tw
Open source hackable Twitter client for everyone.

## Installation
>This client can be launch in local host. 

### What you need
1. NodeJS
2. Node modules :
  * Twit
  * socket.io
  * ExpressJS
3. a web browser
4. a valid Twitter account

### How to
1. Install all requirements
2. Put the _app.js_ and _index.html_ files in your server/localhost directory
3. Create an Twitter app at [apps.twitter.com](https://apps.twitter.com/app/new) with these info :
  * Name : <code>itter.tw</code>
  * Description : <code>itter.tw, cool Twitter client.</code>
  * Website : <code>https://itter.tw/</code>
4. Create a _tokens.json_ file like this with the info Twitter provided you
 <code>
 {
    "consumer_key":"...",
    "consumer_secret":"...",
    "access_token":"...",
    "access_token_secret":"..."
 }
 </code>
5. Put your server adress in _index.html_
 <code>var socket = io.connect('...');</code>
6. Launch the script
 <code>node apps.js</code>
7. Connect to your page _index.html_
8. That'ts it. So simple!
