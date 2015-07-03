"use strict";

var plus = function(a,b) {
    return a+b;
};

module.exports = {
    plus: plus
};

// Various utilities and functions we need -------------------------------------------
/*
// HTTP request function
var http = function(method, path, onSuccess, onFailure ) {
  var req = new XMLHttpRequest();
  req.open( method, path, true );
  req.setRequestHeader( 'Content-Type','application/json; charset=UTF-8');

  req.onload = function() {
    if ( req.status >= 200 && req.status < 400 ) {
      onSuccess( req );
    } else {
      // request reached server, but we got an error
      onFailure( req.responseText );
    }
  };

  // request didn't reach server
  req.onerror = onFailure;

  req.send();
}

// HTTP GET
var get = function(path, onSuccess, onFailure) {
  http( "GET", path, onSuccess, onFailure );
};

// HTTP POST
var post = function(path, onSuccess, onFailure) {
  http( "POST", path, onSuccess, onFailure );
};
*/
// Application starts here! ---------------------------------------
/*
get("/config",
  function( response ) {
    console.log( JSON.parse(response.responseText) );
  },
  function( response ) {
    console.log( response );
});
*/