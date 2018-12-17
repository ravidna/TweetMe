let express = require("express");
let app = express();
let bodyParser= require ("body-parser");
let path = require("path");

let Twitter = require('twitter');
let config = require('./config.js');
let T = new Twitter(config);
let username = "NaouriRavid";


app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());


app.get('/',function(req,res){
    res.sendfile("client.html");
});


app.get('/logo.png',function(req,res){
    res.sendfile("logo.png");
});

// Post a tweet
app.post("/", function (req, res) {
    if(req.body) {
        let tweet = (req.body.tweetMessage); //get the user's tweets value from client
        let params = {
            status: tweet
        }
        T.post('statuses/update', params, function(err, data, res) {
            if(!err){
                var username1 = data.user.screen_name;
                var tweetId = data.id_str;
                console.log('your tweet have been posted! you can find it here:', `https://twitter.com/${username1}/status/${tweetId}`);
            } else {
                console.log(err);
            }
        })
        res.status(200).send("your tweet have been posted! you can find it here:" +" "+`https://twitter.com/${username}`);
    }
    else {
        res.status(404).send({error: "There was a problem posting the tweet"})
    }
});


// Retweet a tweet

app.post("/retweet", function (req, res) {
    if(req.body) {
        let id = (req.body.tweetID); //get the user's tweet id value from client
        let params2 = { //params can be added - according to client API using twitter API parameters
            id: id //instead of id
        }
        T.post('statuses/retweet/', params2, function(err, data, res) { //retweet
            if(!err){
                var username1 = data.user.screen_name;
                var tweetId = data.id_str;
                console.log('your tweet have been retweeted! you can find it here:', `https://twitter.com/${username1}/status/${tweetId}`);
            } else {
                console.log(err);
            }
        });
        res.status(200).send("your tweet have been retweeted! you can find it here:" +" "+`https://twitter.com/${username}/status/${id}`);
    }
    else {
        res.status(404).send({error: "There was a problem retweeting the tweet"})
    }
});


// Follow the author's tweets that have been come up in search

app.post("/friendship", function (req, res) {
    if(req.body) {
        let q = (req.body.q);
        let count = (req.body.count);
        let result_type = (req.body.result_type);
        let lang = (request.body.lang);
        let params3 = {
            q: q, //Search query
            count: count, // Number of tweets
            result_type: 'recent', //User's choice between mixed,recent,popular results
            lang: 'en' //Language
        }
        T.get('search/tweets', params3, function(err, data, response) {
            // If there is no error, proceed
            if(!err){
                // Loop through the returned tweets
                for(let i = 0; i < data.statuses.length; i++) {
                    let screen_name = data.statuses[i].user.screen_name;
                    // create friendship with the tweet's author
                    T.post('friendships/create', {screen_name}, function (err, res) {
                        if (err) {
                            console.log(err);
                        } else { // success, log the names of the users the user now follow
                            console.log(screen_name, ': **FOLLOWED**');
                        }
                    });
                }
            } else {
                console.log(err);
            }
        })
        res.status(200).send("you are now following many new users! you can find how are they here:" +" "+`https://twitter.com/${username}/following`);
    }
    else {
        res.status(404).send({error: "There was a problem searching and following new people"})
    }
});


// Get and print list of favourite tweets

app.post("/favourite", function (req, res) {
    if(req.body) {
        let count = (req.body.count);
        let since_id = (req.body.since_id);
        let params4 = {
            count: count, // Number of tweets
            since_id: 'recent' // Results with an ID greater than this ID
        }
        // Get and print list of favourite tweets
        T.get('favorites/list', params4, function(err, data, res) {
            if(err) throw err;
            console.log(data);  // successfully log The favorites.
        });
        res.status(200).send();
    }
    else {
        res.status(404).send({error: "There was a problem get and print a list of favourite tweets"})
    }
});


// Stream statuses filtered by keyword, number of tweets per second depend on topic popularity

app.post("/stream", function (req, res) {
    if(req.body) {
        let track = (req.body.count);
        let location = (req.body.since_id);
        let params5 = { //params can be added - according to client API using twitter API parameters choices
            track: track, // Keyword to track
            locations: location // Specifies a set of bounding boxes to track
        }
        // Get and print list of favourite tweets
        T.stream('statuses/filter', params5,  function(stream) {
            stream.on('start', function(start) {
                console.log("start");
            });
            stream.on('data', function(data) {
                console.log(data.text);
            });
            stream.on('error', function(error) {
                console.log(error);
            });
            stream.on('end', function(end) {
                console.log("end");
            });
        });
        res.status(200).send("streaming successfully!");
    }
    else {
        res.status(404).send({error: "There was an error streaming the tweets"});
    }
});


// Posting an image
app.post("/image", function (req, res) {
    if(req.body) {
        let path = (req.body.path); // Path to image
        let tweet = (req.body.tweet); // Tweet's value
        let data = require('fs').readFileSync(path);

        // Make post request on media endpoint. Pass file data as media parameter
        T.post('media/upload', {media: data}, function(error, media, response) {

            if (!error) {
                // If successful, a media object will be returned.
                console.log(media);
                // tweet it
                let status = {
                    status: tweet,
                    media_ids: media.media_id_string // Pass the media id string
                }
                T.post('statuses/update', status, function(err, data, res) {
                    if (!err) {
                        var username1 = data.user.screen_name;
                        var tweetId = data.id_str;
                        console.log('your tweet have been posted! you can find it here:', `https://twitter.com/${username1}/status/${tweetId}`);
                    }
                });

            }
        });

        res.status(200).send("your tweet including image have been posted! you can find it here:" +" "+`https://twitter.com/${username}`);
    }
    else {
        res.status(404).send({error: "There was a get and print list of favourite tweets"})
    }
});


// Search for tweets, loop through the returned tweets and favourite each of them
app.post("/searchtweet", function (req, res) {
    if(req.body) {
        let q = (req.body.q);
        let count = (req.body.count);
        let result_type = (req.body.result_type);
        let lang = (request.body.lang);
        let params = {
            q: q, //Search query
            count: count, // Number of tweets
            result_type: 'recent', //User's choice between mixed,recent,popular results
            lang: 'en' //Language
        }
        T.get('search/tweets', params, function(err, data, response) {
            // If there is no error, proceed
            if(!err){
                // Loop through the returned tweets
                for(let i = 0; i < data.statuses.length; i++){
                    // Get the tweet Id from the returned data
                    let id = { id: data.statuses[i].id_str }
                    // Favorite the selected Tweet
                    T.post('favorites/create', id, function(err, response){
                        // If the favorite fails, log the error message
                        if(err){
                            console.log(err[0].message);
                        }
                        // If the favorite is successful, log the url of the tweet
                        else{
                            let username = response.user.screen_name;
                            let tweetId = response.id_str;
                            console.log('Favorited: ', `https://twitter.com/${username}/status/${tweetId}`)
                        }
                    });
                }
            } else {
                console.log(err);
            }
        })
        res.status(200).send("searched and favourite tweets successfully! find your favourite tweets here" +" "+`https://twitter.com/${username}/likes`);
    }
    else {
        res.status(404).send({error: "There was a problem search and favurite the tweets"})
    }
});


// Retweets "count" number of user's tweets

app.post("/retweetscount", function (req, res) {
    if(req.body) {
        let user_id = (req.body.user_id);
        let count = (req.body.count);
        let params6 = {
            count: count, // Number of tweets
            user_id: user_id
        }
        //get a list of favourite tweets
        T.get('statuses/user_timeline', params6, function(err, data, response) {
            // If there is no error, proceed
            if(!err){
                // Loop through the returned tweets
                for(let i = 0; i < data.length; i++){
                    // Get the tweet Id from the returned data
                    let id = data[i].id_str;
                    //console.log(id);
                    // Retweet the tweets
                    T.post('statuses/retweet/'+id, function(err, data, response) {
                        if(!err){
                            let tweetId = response.id_str;
                            console.log('Retweeted: ', `https://twitter.com/${username}/status/${id}`) //Success, log the tweets
                        } else {
                            console.log(err);
                        }
                    });
                }
            } else {
                console.log(err);
            }
        })
        res.status(200).send("retweet successfully!");
    }
    else {
        res.status(404).send({error: "There was a problem retweet the tweets"})
    }
});


app.listen(8081 ,function(){
    console.log("Live at Port " + 8081);
});