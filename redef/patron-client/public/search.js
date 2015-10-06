(function (root, factory) {
    "use strict";
    if (typeof module === "object" && module.exports) {
        var Ractive = require("../public/ractive.min.js");
        Ractive.events = require("../public/ractive-events-keys.js");

        var axios = require("../public/axios.min.js");
        module.exports = factory(Ractive, axios);
    } else {
        root.Search = factory(root.Ractive, root.axios);
    }
}(this, function (Ractive, axios) {
    "use strict";
    Ractive.DEBUG = false;

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

                axios.get("http://192.168.50.12:8200/_search?q=" + q)
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