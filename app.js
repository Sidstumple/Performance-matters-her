var express = require('express');
var concat = require('concat-stream');
var https = require('https');
var app = express();
var compressor = require('node-minify');

require('dotenv').config(); //makes apikey invisible

app.use(express.static('./'))
app.set('view engine', 'ejs'); //render all html via ejs

compressor.minify({
  compressor: 'clean-css',
  input: 'static/css/styles.css',
  output: 'static/css/styles-min.css',
  callback: function (err, min) {}
});

compressor.minify({
  compressor: 'gcc',
  input: 'static/js/bundle.js',
  output: 'static/js/bundle-min.js',
  callback: function (err, min) {}
});

// for the API url:
var startUrl = 'https://www.rijksmuseum.nl/api/nl/collection';
var apikey = process.env.APIKEY; //invisible apiKey

app.get('/', function (req, res) {
  res.render('index'); //renders index.ejs
});

app.get('/search/:query?', function (req, res) {
  var query = req.param('q');
  var url = `${startUrl}?key=${apikey}&ps=4&format=json&q=${query}`;
  load(callback, url); //calls function load, gives the query and calls function callback
  function callback(data) {
    res.render('search', {data: data, query: query}); // renders search with an object, these properties are now accessible in index.ejs
   }
});

app.get('/detail/:id', function (req, res) {
  var id = req.params.id;
  var url = `${startUrl}/${id}?key=${apikey}&format=json`;

  load(callback, url); //calls function load, gives the query and calls function callback
  function callback(detail) {
    res.render('detail', {detail: detail}); // renders search with an object, these properties are now accessible in index.ejs
   }
});


app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!')
});

function load(callback, url) {
  console.log(url);
  https.get(url, function(res) {
    res.pipe(concat(onfinish));
  });

  function onfinish(buffer) {
    callback(JSON.parse(buffer));
  }
}
