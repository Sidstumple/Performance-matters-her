/*jslint browser: true, devel: true, eqeq: true, plusplus: true, sloppy: true, vars: true, white: true*/

(function(){
    "use strict";
    var config = {
        //routes:
        home: document.getElementById('home'),
        rijksmuseum: document.getElementById('rijksmuseum'),
        artObject: document.getElementById('artObject'),
        getUserQuery: document.getElementById('getUserQuery'),
        queryResult: document.getElementById('queryResult'),
        detailArt : document.getElementById('detailArt'),
        materials : document.getElementById('materials'),
        search : document.getElementById('search_painter'),
        error: document.getElementById('error')
    };

    var app = {
        init: function() {
            //routes is initiated
            routes.init();
            //event listener on submit
            config.getUserQuery.addEventListener('input', function (){
              event.preventDefault();
              collection.search();
            });
            //event listener on select dropdown
            config.materials.addEventListener('change',function(el){
              event.preventDefault();
              collection.filter(this.value);
              console.log(this.value);
              //this.value gives back the value of the selected option, this is added to the url in renderFilter()
            });

        }
    };

    //routes listens to the hashchange and gives the route to sections.toggle
    var routes = {
        init: function(){
            //routie checks the url for hashes. When there is no hash in the url #home is added
            routie({
                '': function() {
                    location.hash = '#home';
                },
                //this.path is equal to the hash, a hashtag needs to be added to work. It is faster than using location.hash, because routie has already defined 'this'.
                'home': function(){
                    console.log(this.path);
                    sections.toggle('#' + this.path );
                },

                'rijksmuseum': function() {
                    sections.toggle('#' + this.path);
                    console.log('Youre searching');
                },
                'rijksmuseum/:id': function(id) {
                    sections.toggle('#' + this.path);
                    collection.artObject();
                    console.log('Youre viewing details');
                }
            });
        }
    };

    // collection collects all the data I need to assemble the pages.
    var collection = {
        //search collects the most data by checking the user query
        search: function() {
            var userQuery = document.getElementById('user-input-field').value;
            //for api results:
            //this replaces all spaces in user queries with %20 so the link doesn't break.
            userQuery = userQuery.replace(/\s/g, '%20');

            //url that only checks shows the results of the query
            var apiUrl= 'https://www.rijksmuseum.nl/api/nl/collection?key=epHseGj4&q=&ps=50&format=json&imageonly=true&q=' + userQuery;

            // the value of 'alles' is 0, so when it's bigger than 0 it should check which filter is applied.
            if(config.materials.value.length > 0){
                //&material is added to the apiURL & the value of the selected option
                apiUrl = apiUrl + '&material=' + config.materials.value;
            }
            //GET data for query
            aja()
                .url(apiUrl)
                .on('success', function(data){
                    //if the array is empty show error-item
                    if (data.artObjects.length === 0) {
                        sections.renderError();
                    } else {
                        //error-item has to be deleted when the array is bigger than 0 because it's not in the same div as the queryresult.
                    config.error.innerHTML = '';
                    }
                    console.log('Search api is loaded');
                    //this calls renderSearch which assembles the HTML
                    sections.renderSearch(data);
                })
                //error handler
                .on('40x', function(response){
                    console.log('something is definitely wrong');
                    // 'x' means any number (404, 400, etc. will match)
                })
                .go();
        },
        // filter collects the data according to the applied filter
        filter: function(value) {
            var userQuery = document.getElementById('user-input-field').value;
            //replace spaces with %20
            userQuery = userQuery.replace(/\s/g, '%20');
            //makes sure api url has the right userquery and adds the value of the selected option
            var apiUrl = 'https://www.rijksmuseum.nl/api/nl/collection?key=epHseGj4&q=&ps=50&format=json&imageonly=true&q=' + userQuery + '&material=' + value;
            // GET data for applied filter
            aja()
            .url(apiUrl)
            .on('success', function(filter){
                //if the array is empty renderError
                if(filter.artObjects.length === 0) {
                    console.log('nothing available');
                    sections.renderError();
                } else {
                    //error-item has to be deleted when the array is bigger than 0 because it's not in the same div as the queryresult.
                    config.error.innerHTML = '';
                }
                console.log('filter api is loaded');
                // this calls renderSearch and changes the html according to the applied filter
                sections.renderSearch(filter);
            })
            //error handler
            .on('40x', function(response){
                    console.log('something is definitely wrong');
                    // 'x' means any number (404, 400, etc. will match)
                })
            .go();
        },

        artObject: function() {
            // the route is rijksmuseum/ :id in order to use only the id in the api url I had to slice the first 12 characters off
            var route = location.hash;
            var idRoute = route.slice(12);

            //the id has to be placed in the middle of the url
            var detailUrl= 'https://www.rijksmuseum.nl/api/nl/collection' + idRoute + '?key=epHseGj4&q=&ps=50&format=json';

            aja()
            .url(detailUrl)
            .on('success', function(detail){
                console.log("detail api was loaded");
                //render artObject (detail page) html
                sections.renderArtObject(detail);
            })
            //error handler
            .on('40x', function(response){
                    console.log('something is definitely wrong');
                    // 'x' means any number (404, 400, etc. will match)
                })
            .go();
        }
    };


    var sections = {
        //html renderer for search
        renderSearch: function(data) {
            //this is the script template in the html
            var source = document.getElementById('queryTemplate').innerHTML;
            // template uses the source to know where to compile
            var template = Handlebars.compile(source);
            // htmlCollection corresponds with the element's id in the html in which the template will be shown. Data is added when I called the function inthe parameters. Data is used in the html script to get attributes from the array.
            var htmlCollection = template(data);
            //htmlCollection is now connected to the innerHTML of the element in which I want to place my code.
            config.queryResult.innerHTML = htmlCollection;
        },

        renderArtObject: function(detail) {
            var element = detail.artObject;
            console.log(element);
            var route = location.hash;
            var idRoute = route.slice(12);

            //you can also add the content here instead of the html script
            var content  = {
                idroute: idRoute,
                imageSource: element.webImage.url,
                title: element.title,
                description: element.description,
                artist: element.principalOrFirstMaker
            };

            var source = document.getElementById('detailTemplate').innerHTML;
            var template = Handlebars.compile(source);
            //content is the object above
            var htmlDetail = template(content);
            console.log(htmlDetail);
            config.detailArt.innerHTML = htmlDetail;
        },
        renderError: function() {
            var source = document.getElementById('errorTemplate').innerHTML;
            var template = Handlebars.compile(source);
            var errorHTML = template();

            config.error.innerHTML = errorHTML;
             console.log(template);
        },

        toggle: function(route) {
            //selects all sections in the document
            var section = document.querySelectorAll('section');

            //loop through all sections
            for (var i = 0; i < section.length; i++) {
                //sectionList shows all sections
                var sectionList = section[i];
                //sectionsId adds a hashtag to all section id's, so it will be the same as the location hash
                var sectionsId = '#' + section[i].id;

                //if sectionsId is the same as route remove the hide class
                if (sectionsId === route) {
                    sectionList.classList.remove('hide');

                } else if (route.length > 12) { //if the length of route is bigger than 12 add hide to all sections and then remove the hide class from artobject section
                    sectionList.classList.add('hide');
                    config.artObject.classList.remove('hide');
                }else { // else add class hide to section
                    sectionList.classList.add('hide');
                }
            }
        }
    };

   app.init();
}());
