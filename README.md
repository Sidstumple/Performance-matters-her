# Performance Matters-her
A server-side version of my webapp from scratch.

## Contents:
1. [Dependencies](#dependencies)
2. [Dev Dependencies](#dev-dependencies)
3. [Install](#install)
4. [How it works](#how-it-works)
5. [Skeleton loading](#skeleton-loading)
6. [Performance Audit](#performance-audit)
7. [Node Minify](#node-minify)
8. [Service Worker](#service-worker)
9. [Wishlist](#wishlist)


## [Dependencies](#dependencies)
+ [`concat-stream`](https://www.npmjs.com/package/concat-stream)
+ [`dotenv`](https://www.npmjs.com/package/dotenv)
+ [`ejs`](https://www.npmjs.com/package/ejs)
+ [`express`](https://www.npmjs.com/package/express)
+ [`https`](https://www.npmjs.com/package/https)

## [Dev Dependencies](#dev-dependencies)
+ [`Browserify`](https://www.npmjs.com/package/browserify)
+ [`node-minify`](https://www.npmjs.com/package/node-minify)

## [Install](#install)
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

## [How it works](#how-it-works)
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

## [Skeleton loading](#skeleton-loading)
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
![with skeleton loading, no jump](/screenshots/nojumpskeleton.png)

# [Performance Audit](#performance-audit)
I used my Web App From Scratch assignment as a starting point for my performance audit. I applied the following methods to make the app faster:
- node-minify
- service worker

NB. Because the images are requested through the Rijksmuseum API it's not possible to compress them, which would have made the app much faster.

### [Node Minify](#node-minify)
`node-minify` is a Node module which minifies JavaScript & CSS files automatically.
```javascript
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
```
It takes your normal css/js file and uses it to make a new file with the minified code.

Everything is tested on 'Good 2G' speed of Google Chrome's Developer tools to give a more accurate audit.

Before minifying:
![before minifying](/screenshots/nominify.png)
DOMContentLoaded: 21.03 seconds

After javascript minifying:
![after minifying javascript](/screenshots/minifyjs.png)
DOMContentLoaded: 13.45 seconds

After CSS minifying:
![after minifying CSS](/screenshots/minifycss.png)
DOMContentLoaded: 33.9 seconds :/

After both:
![after minifying both](/screenshots/afterminifying.png)
DOMContentLoaded: 10.31 seconds

### [Service Worker](#service-worker)
A service worker saves specified cache data. Cached pages are not only loaded faster, they are also available offline.
Everything is tested on 'Good 2G' speed of Google Chrome's Developer tools to give a more accurate audit.

Before caching:
![before caching](/screenshots/normalloadsw.png)
- Load: 2 min
- Finish: 2 min

After caching: 
![before caching](/screenshots/aftercachingsw.png)
- Load: 766 miliseconds
- Finish: 1.96 seconds

Viewing cached page offline:
![before caching](/screenshots/offlinecachedpagesw.png)
- Load: 718 miliseconds
- Finish: 1.66 seconds

Viewing uncached page offline: 
![before caching](/screenshots/offlineversionsw.png)
- Load: 147 miliseconds
- Finish: 131 seconds

## [Wishlist](#wishlist)
+ Giving the user a list of pages they can still view while offline
