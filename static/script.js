(function($) {
    $.fn.getCursorPosition = function() {
        var input = this.get(0);
        if (!input) return; // No (input) element found
        if ('selectionStart' in input) {
            // Standard-compliant browsers
            return input.selectionStart;
        } else if (document.selection) {
            // IE
            input.focus();
            var sel = document.selection.createRange();
            var selLen = document.selection.createRange().text.length;
            sel.moveStart('character', -input.value.length);
            return sel.text.length - selLen;
        }
    }
})(jQuery);




var tweetTemplate = $("#tweetTemplate").html();

var socket = io.connect('http://demo.itter.tw');
socket.on('init', function (data) {
    console.log("//Connected to server //Client id:["+data.id+"]");
    socket.emit('init', { data: 'ping' });
});
socket.on('console', function (json) {
    console.log(json.data);
});

socket.on('timelineUpdate', function (data) {
    //console.log(data);
    renderTweet(data.tweet,"#homeTimeline>ul")
    if($('[href="#homeTimeline"]~.dropdown-menu .autoscroll>input').is(":checked")==false){
        var timelineToScroll=$("#homeTimeline").scrollTop()+$("#tweet"+data.tweet.id_str).outerHeight(true);
        $("#homeTimeline").scrollTop(timelineToScroll);
    }
});


function renderTweet(tweet,location){
    var datapreprocess={ twitter:tweet, preprocess:preprocess(tweet)}
    console.log(datapreprocess);

    $(location).prepend(Mark.up(tweetTemplate, datapreprocess));
}


function preprocess(tweet){
    var preprocessdata={tweet:""};
    if(tweet.full_text!=undefined){
        preprocessdata.tweet=tweet.full_text;
    }else{
        preprocessdata.tweet=tweet.text;
    }

    var tweet_entities=tweet.entities;
    var tweet_extended_entities=tweet.extended_entities;
    if(tweet.extended_tweet!=undefined){ //Truncated tweet
        preprocessdata.tweet=tweet.extended_tweet.full_text;
        tweet_entities=tweet.extended_tweet.entities;
        tweet_extended_entities=tweet.extended_tweet.extended_entities;
    }

    preprocessdata.source=tweet.source.replace('rel="nofollow"','target="_blank"');

    if(tweet.retweeted_status!=undefined){ //It's a RT
        preprocessdata.retweeted_status=preprocess(tweet.retweeted_status);
        preprocessdata.retweeted_status.source=tweet.retweeted_status.source.replace('rel="nofollow"','target="_blank"');
    }
    if(tweet.quoted_status!=undefined){ //It's a quoted tweet
        preprocessdata.quoted_status=preprocess(tweet.quoted_status);
        preprocessdata.quoted_status.source=tweet.quoted_status.source.replace('rel="nofollow"','target="_blank"');
    }

    //console.log(util.inspect(tweet.entities.hashtags));
    for(var i in tweet_entities.hashtags){ //hashtags
        var hashtag=tweet_entities.hashtags[i];
        preprocessdata.tweet=preprocessdata.tweet.replace(new RegExp("[^>]#"+hashtag.text+"($|(<\/a>){0})","i"),Mark.up($("#hashtagTemplate").html(), hashtag));
    }
    for(var i in tweet_entities.urls){ //links
        var link=tweet_entities.urls[i];
        preprocessdata.tweet=preprocessdata.tweet.replace(link.url,Mark.up($("#linkTemplate").html(), link));
    }
    for(var i in tweet_entities.user_mentions){ //mention
        var mention=tweet_entities.user_mentions[i];
        preprocessdata.tweet=preprocessdata.tweet.replace(new RegExp("@"+mention.screen_name+"($|(<\/a>){0})","i"),Mark.up($("#mentionTemplate").html(), mention));
    }
    if(tweet_extended_entities){
        var medias="";
        for(var i in tweet_extended_entities.media){ //media
            var media=tweet_extended_entities.media[i];
            if(media.type=="photo"){
                medias+=Mark.up($("#imgTemplate").html(), media);
            }else if(media.type=="animated_gif" || media.type=="video"){
                medias+=Mark.up($("#videoTemplate").html(), media);
            }
        }
        preprocessdata.tweet=preprocessdata.tweet.replace(media.url,"<br/>"+medias);
    }
    preprocessdata.tweet=twemoji.parse(preprocessdata.tweet);
    //console.log(preprocessdata);


    /* Timestamp */		
    var date=new Date(tweet.created_at);
    preprocessdata.date=date.toLocaleString();


    return preprocessdata;
}


//Bootstrap
$(function () { //Bootstrap init
  $('[data-toggle="tooltip"]').tooltip();
});

$(".dropdown-menu>li>form").click(function(evt){ evt.stopPropagation() });

/* Timeline*/
$('.nav-tabs a').click(function(e) {
    e.preventDefault()
    var thisparent=$(this);
    setTimeout(function(){thisparent.tab('show')},100);
    setTimeout(function(){
        //$(thisparent.attr("href")).scrollTop($(thisparent.attr("href")).scrollTop()+1-1);
        console.log(thisparent.attr("href")+" "+$(thisparent.attr("href")).scrollTop())
    },200);
    
    if($(this).attr("aria-expanded")=="true"){
        $($(this).attr("href")+".timeline").animate( { scrollTop: 0 }, 200 );
    }
    
    console.log($(this).attr("href")+".timeline>ul : "+$($(this).attr("href")+".timeline>ul").length+" && "+$(this).attr("href")+".timeline : "+$($(this).attr("href")+".timeline").scrollTop());
    if($($(this).attr("href")+".timeline>ul").length==1 && $($(this).attr("href")+".timeline").scrollTop()!=0){ // There is tweet(s) and the timeline is not scrolled to top 
        console.log("shadow on");
        $(".nav-tabs").css({
            "-webkit-box-shadow": "0 5px 10px -5px rgba(0,0,0,0.5)",
            "box-shadow": "0 5px 10px -5px rgba(0,0,0,0.5)"
        });
    }else{
        console.log("shadow off");
        $(".nav-tabs").css({
            "-webkit-box-shadow": "",
            "box-shadow": ""
        });
    }
});

$(".timeline").scroll(function(){
    //console.log($(this).scrollTop());
    if($(this).scrollTop()!=0){
        $(".nav-tabs").css({
            "-webkit-box-shadow": "0 5px 10px -5px rgba(0,0,0,0.5)",
            "box-shadow": "0 5px 10px -5px rgba(0,0,0,0.5)"
        });
    }else{
        $(".nav-tabs").css({
            "-webkit-box-shadow": "",
            "box-shadow": ""
        });
    }
});



/* Tweet composer */

$(".hiddenTweetComposer").hide();
$("#cancelTweetComposer").click(function(){
    $(".hiddenTweetComposer").hide();
    $("#plusTweetComposer").show();
});
$("#plusTweetComposer").click(function(){
    $(".hiddenTweetComposer").show();
    $(this).hide();
});



/* Omnisearch */

function addonRefresh(){
    $(".btn-addon").click(function(){
        $("#omnisearch .input-group-addon").remove();
        $('#omnisearch input[type="text"]').before('<span class="input-group-addon">'+$(this).data("addon")+'</span>');
    });
}

addonRefresh();

$('#omnisearch input[type="text"]').on("change",function(){
    //console.log($(this).val());
    if(/^inspect:\/\//i.test($(this).val())){
        $("#omnisearch .input-group-addon").remove();
        $('#omnisearch input[type="text"]').before('<span class="input-group-addon">inspect://</span>');
        $(this).val($(this).val().replace("inspect://",""));
    }else if(/^view:\/\//i.test($(this).val())){
        $("#omnisearch .input-group-addon").remove();
        $('#omnisearch input[type="text"]').before('<span class="input-group-addon">view://</span>');
        $(this).val($(this).val().replace("view://",""));
    }
});

$('#omnisearch input[type="text"]').keydown(function(e){
    //if($(this).val()=="" || $(this).val()==undefined){
    //console.log($(this).getCursorPosition());
    if($(this).getCursorPosition()==0){
        if(e.keyCode == 8 || e.keyCode == 46) {
            $("#omnisearch .input-group-addon").remove();
        }
    }
});

$("#omnisearch").on("submit",function(evt){
    evt.preventDefault();
    $("#omnisearchResults").html("");
    var search=$('#omnisearch input[type="text"]').val();
    if(search==undefined || search==""){ //Nothing is searched
        $("#omnisearchResults").html('<li class="alert alert-danger" role="alert"> <strong>Empty search</strong> Type something before searching.</li>');
    }
    if($("#omnisearch .input-group-addon").html()==undefined || $("#omnisearch .input-group-addon").html()==""){ //Without addon
        if(/^http(s?):\/\/twitter.com\//i.test(search)){ //A twitter.com link is searched
            $("#omnisearchResults").html('<li class="alert alert-warning" role="alert">Did you mean <strong class="btn-addon" data-addon="inspect://">inspect://'+search+'</strong> ?</li>');
            addonRefresh();
        }else{ // Regular search
            socket.emit('request', { 
                type: 'search',
                query: search
            });
        }
    }else if($("#omnisearch .input-group-addon").html()=="inspect://" || $("#omnisearch .input-group-addon").html()=="view://"){ //Addon inspect
        search=search.split("/");
        for(each in search){
            if($.isNumeric(search[each])){
                socket.emit('request', { 
                    type: 'tweet/lookup',
                    query: search[each]
                });
                console.log("tweet/lookup:"+search[each]);
                break;
            }
        }
    }
});

socket.on('respond', function (data) {
    if(data.type=='search'){
        console.log(data.response);
        if(data.response.statuses.length==0){
            $("#omnisearchResults").append('<li class="alert alert-info" role="alert"> <strong>No results :(</strong> Try to search something else.</li>');
        }else{
            for(tweet in data.response.statuses){
                renderTweet(data.response.statuses[tweet],"#omnisearchResults");
            }
        }
    }else if(data.type=='tweet/lookup'){
        console.log(data.response);
        renderTweet(data.response,"#omnisearchResults");
        if($("#omnisearch .input-group-addon").html()=="inspect://"){
            $("#omnisearchResults").append('<li><pre>'+JSON.stringify(data.response, null, ' ').replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</pre></li>');
        }
    }
});

