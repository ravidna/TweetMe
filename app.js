let express = require("express");
let bodyParser= require ("body-parser");
let app = express();
let path = require("path");

let Twitter = require('twitter');
let config = require('./config.js');
let twitter = new Twitter(config);
let username = "NaouriRavid";


app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());


app.get('/',function(req,res){
    res.sendFile(path.join(__dirname, 'client.html'));
});


app.get('/logo.png',function(req,res){
    res.sendFile(path.join(__dirname, 'logo.png'));
});

app.post('/',function(req,res){
    res.sendFile(path.join(__dirname, 'client.html'));
});

// Post a tweet
app.post("/posttweet", function (req, res) {
    if(req.body) {
        let tweet = (req.body.tweetMessage); // Get the user's tweets value from client
        let params = {
            status: tweet
        }
        twitter.post('statuses/update', params, function(err, data, res) {
            if(!err){
                let username = data.user.screen_name;
                let tweetId = data.id_str;
                console.log('your tweet have been posted! you can find it here:', `https://twitter.com/${username}/status/${tweetId}`);
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
        let params = { //params can be added - according to client API using twitter API parameters
            id: id //instead of id
        }
        twitter.post('statuses/retweet/', params, function(err, data, res) { //retweet
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


// Search tweets and follow the authors
app.post("/friendship", function (req, res) {
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
        twitter.get('search/tweets', params, function(err, data, response) {
            if(!err){
                // Loop through the returned tweets
                for(let i = 0; i < data.statuses.length; i++) {
                    let screen_name = data.statuses[i].user.screen_name;
                    // create friendship with the tweet's author
                    twitter.post('friendships/create', {screen_name}, function (err, res) {
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
        let params = {
            count: count, // Number of tweets
            since_id: since_id // Results with an ID greater than this ID
        }
        // Get and print list of favourite tweets
        twitter.get('favorites/list', params, function(err, data, res) {
            if(err) throw err;
            console.log(data);  // Successfully log The favorites.
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
        let params = { // params can be added - according to client API using twitter API parameters choices
            track: track, // Keyword to track
            locations: location // Specifies a set of bounding boxes to track
        }
        // Get and print list of favourite tweets
        twitter.stream('statuses/filter', params,  function(stream) {
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
        twitter.post('media/upload', {media: data}, function(error, media, response) {
            if (!error) {
                // If successful, a media object will be returned.
                console.log(media);
                // Tweet it
                let status = {
                    status: tweet,
                    media_ids: media.media_id_string // Pass the media id string
                }
                twitter.post('statuses/update', status, function(err, data, res) {
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
        twitter.get('search/tweets', params, function(err, data, response) {
            // If there is no error, proceed
            if(!err){
                // Loop through the returned tweets
                for(let i = 0; i < data.statuses.length; i++){
                    // Get the tweet Id from the returned data
                    let id = { id: data.statuses[i].id_str }
                    // Favorite the selected Tweet
                    twitter.post('favorites/create', id, function(err, response){
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
        let params = {
            count: count, // Number of tweets
            user_id: user_id
        }
        // Get a list of favourite tweets
        twitter.get('statuses/user_timeline', params, function(err, data, response) {
            // If there is no error, proceed
            if(!err){
                // Loop through the returned tweets
                for(let i = 0; i < data.length; i++){
                    // Get the tweet Id from the returned data
                    let id = data[i].id_str;
                    // Console.log(id);
                    // Retweet the tweets
                    twitter.post('statuses/retweet/'+id, function(err, data, response) {
                        if(!err){
                            let tweetId = response.id_str;
                            console.log('Retweeted: ', `https://twitter.com/${username}/status/${id}`) // Success, log the tweets
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