# Performance Matters-her
A server-side version of my webapp from scratch.

## Dependencies
+ [`concat-stream`](https://www.npmjs.com/package/concat-stream)
+ [`dotenv`](https://www.npmjs.com/package/dotenv)
+ [`ejs`](https://www.npmjs.com/package/ejs)
+ [`express`](https://www.npmjs.com/package/express)
+ [`https`](https://www.npmjs.com/package/https)

## Dev Dependencies
+ [`Browserify`](https://www.npmjs.com/package/browserify)

## Install
- Clone this repository
- Navigate to the directory in your terminal
- Add `.env` file:
```.env
APIKEY=//Your Rijksmuseum API key
```
- Install the dependencies with:
```
npm install
```
- Run this app 
```
node app.js
```
- Use the app at http://localhost:3000/search

## How it works
This app uses [Express](https://www.npmjs.com/package/express) to handle routing. 
```javascript
app.get('/', function (req, res) {
  res.render('index'); //renders index.ejs
});
```
`app.get` checks the path that is declared (`'/'`) and a function handles the request and response, on response the function renders the html page.

[Embedded JS Templates (EJS)](https://www.npmjs.com/package/ejs) is used to render all html partials, it also allows me to send data from my JS files to my HTML files.
```javascript
res.render('search', {data: data, query: query});
// search is the ejs file, data and query are usable in the HTML files.
```

To handle API requests I use [https](https://www.npmjs.com/package/https) in combination with [concat](https://www.npmjs.com/package/concat-stream).
```javascript
load(callback, url); //calls function load, gives the query and calls function callback
function callback(data) {
  res.render('search', {data: data, query: query}); // renders search with an object, these properties are now accessible in index.ejs
 }
function load(callback, url) {
  https.get(url, function(res) {
    res.pipe(concat(onfinish));
  });

  function onfinish(buffer) {
    callback(JSON.parse(buffer));
  }
}
```

The search input has an html attribute `name="q"` (q is for query), when the search page is rendered it requests that the value that is in the input field with `name="q"` is put in the parameters of the url. I can use this variable now to add the user query to the API url and request the according data.
```javascript
var query = req.param('q');
```

To enhance the app I used client side javascript with node modules, which I render with [browserify](https://www.npmjs.com/package/browserify).
```javascript
input.addEventListener('input', function(){
  search(event.target.value);
});
```

To edit the client side Javascript with Browserify: 
- Make changes in index.js. 
- Navigate in terminal to `static/js`
- Run this line:
```
browserify index.js > bundle.js
```

## Skeleton loading:
The images from the Rijksmuseum API are very large and high in resolution, that's why they take a long time to load. Because the images take so long to load there is a moment where the height of the image is not reserved. When the image does get processed, the page looks very jumpy.
![without skeleton loading](/screenshots/noskeleton1.png) ![without skeleton loading, image height pushes down next blocks](/screenshots/noskeleton-jump.png) 
I added skeleton loading to make the page seem to load faster and not be 'jumpy' when the images are loaded.
```css
img {
  width: 100%;
  min-height: 20em;
  background: teal;
}
```
![with skeleton loading](/screenshots/withskeleton.png)
![with skeleton loading](/screenshots/nojumpskeleton.png)



## Wishlist
