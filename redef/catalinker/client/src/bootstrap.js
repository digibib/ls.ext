require('es5-shim');
require('babel-polyfill');
var Main = require('./main');
Main.init().then(function(){
    require("jquery")(window).resize(Main.repositionSupportPanelsHorizontally);
});
