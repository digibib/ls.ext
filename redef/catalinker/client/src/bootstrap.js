var Main = require('./client/src/main');
Main.init().then(function(){
    require("jquery")(window).resize(Main.repositionSupportPanelsHorizontally);
});
