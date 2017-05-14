//modules
var https = require('https');
var concat = require('concat-stream');

// for the API url:
var startUrl = 'https://www.rijksmuseum.nl/api/nl/collection';
var apikey = 'epHseGj4';
var input = document.getElementById('user-input-field');
var article = document.getElementById('add-content');
var zoekOpdracht = document.getElementById('zoek-opdracht');

input.addEventListener('input', function(){
  search(event.target.value);
});

function search(event){
  var query = event;
  zoekOpdracht.innerHTML = '';
  //replace spaces with %20
  query = query.replace(/\s/g, '%20');
  var url = `${startUrl}?key=${apikey}&ps=4&format=json&q=${query}`;
  load(callback, url); //calls function load, gives the query and calls function callback
  var html = '';
  function callback(data) {
    data.artObjects.map(function(obj){ //use the variable data to map (loop through and apply a function) the array artObjects, this is the array that contains all the properties of the API I want to use.
      if (obj.webImage !== null) { //check if an image is available when webImage is not equal to null it contains a url to the image
        html +=
          `<div class="media-item" id=${obj.objectNumber}>
            <h1> <a href="/detail/${obj.objectNumber}">${obj.principalOrFirstMaker}</a> </h1>
            <p>${obj.title}</p>
            <img src="${obj.webImage.url}" alt="${obj.title}">
          </div>`
        }
    article.innerHTML = html;
    });
   }
 }

 function load(callback, url) {
   https.get(url, function(res) {
     res.pipe(concat(onfinish));
   });

   function onfinish(buffer) {
     callback(JSON.parse(buffer));
   }
 }
