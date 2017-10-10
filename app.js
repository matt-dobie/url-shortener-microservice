/*
  Author: Matthew Dobie
  Author URL: mattdobie.com
  Description: Server file for URL Shortener Microservice
*/


// Import express
var express = require('express');

// Create instance of express & port variable
var app = express();
var port = process.env.PORT || 8080;

// Serve static index page
app.use(express.static('public'));

// Route to index page
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Get call to return JSON browser info
app.get('/new', function(req, res) {

  res.json({
    working: "yes"
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

// Listen for requests
app.listen(port, function() {
  console.log("Listening on port " + port + "...");
});
