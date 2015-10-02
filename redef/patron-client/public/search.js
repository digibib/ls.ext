Ractive.load( 'search_template.html' ).then( function ( SearchResults ) {

  var ractive = new SearchResults({
     el: "#app",
     data: {
      hits: {
        total: 0,
        hits: []
      }
     }
   });

  ractive.on({
    search: function(event) {
      var q = '"' + ractive.get("search_term") + '"';

      axios.get('http://192.168.50.12:8200/_search?q='+q)
        .then(function (response) {
          ractive.set("hits", response.data.hits);
        })
        .catch(function (response) {
          console.log(response);
        });
    }
  });
}).catch(function(err) {
  console.log(err);
});

