(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        var Ractive = require("ractive");
        Ractive.events = require("ractive-events-keys");

        var axios = require("axios");
        module.exports = factory(Ractive, axios);
    } else {
        root.Search = factory(root.Ractive, root.axios);
    }
}(this, function (Ractive, axios) {
    "use strict";

    Ractive.DEBUG = false;

    if (window && !window.Promise) {
        // axios needs a Promise polyfill, so we use the one provided by ractive.
        window.Promise = Ractive.Promise;
    }

    return axios.get( "http://192.168.50.12:8000/search_template.html" ).then( function ( response ) {
        return response.data;
    }).then(function(data){
        var searchRactive = new Ractive({
            el: "#app",
            template: data,
            data: {
                hits: {
                    total: 0,
                    hits: []
                }
            }
        });

        searchRactive.on({
            search: function () {
                var q = "\"" + searchRactive.get("search_term") + "\"";

                axios.get("http://192.168.50.12:8005/search/work/_search?q=" + q)
                    .then(function (response) {
                        searchRactive.set("hits", response.data.hits);
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
        });
        return searchRactive;
    });

}));