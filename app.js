/*
  Author: Matthew Dobie
  Author URL: mattdobie.com
  Description: Server file for URL Shortener Microservice
*/


// Imports
var express = require('express');
var mongo = require('mongodb').MongoClient;
var isURL = require('is-url');

// Variables
var app = express();
var port = process.env.PORT || 8080;
var root = "https://fcc-url-shortener-md.glitch.me/";
var mongoURL = process.env.MONGO_URL;
var db;

// Connect to mongo and listen for requests
mongo.connect(mongoURL, function(err, database) {
  if (err) return console.log(err);
  db = database;
  app.listen(port, function() {
    console.log("Listening on port " + port + "...");
  });
});

// Serve static index page
app.use(express.static('public'));

// Route to index page
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Get call to insert new shortUrl
app.get('/new/*', function(req, res) {

  var originalUrl = req.params[0];
  var data = {
    _id: null,
    original_url: originalUrl,
    short_url: null
  }
  var output = {
    original_url: originalUrl,
    short_url: null
  }

  if (!isURL(originalUrl)) {
    res.send({Error: "Not a valid URL"});
  }
  else {
    var urls = db.collection('urls');
    urls.find({original_url: originalUrl}).toArray(function(err, doc) {
      if (err) {
        console.log(error);
      }
      else if (doc.length === 0) {
        data._id = generateId();
        data.short_url = root.concat(data._id);
        urls.insert(data);
      }
      else {
        data.short_url = root.concat(doc[0]._id);
        
      }
      output.short_url = data.short_url;
      res.send(JSON.stringify(output));
    });
  }
});

// Get shortUrl to redirect to original site
app.get('/:id', function(req, res) {
  var id = req.params.id;
  var urls = db.collection("urls");
  urls.find({_id: id}).toArray(function(err, doc) {
    if (err) {
      console.log(err);
    }
    else if (doc.length === 1) {
      var link = doc[0].original_url;
      res.redirect(link);
    }
    else {
      res.send({Error: "Not a valid shortUrl"});
    }
  });
});

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if (err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

// Generate random Id for short_url
function generateId() {
  var randomId = "";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 5; i++){
    randomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomId;
}
