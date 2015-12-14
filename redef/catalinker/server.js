var express = require('express');
var path = require('path');
var logger = require('morgan');
var browserify = require('browserify-middleware');
var axios = require('axios');
var compileSass = require('express-compile-sass');
var app = express();
if (app.get('env') === 'development') {
    var livereload = require('express-livereload');
    livereload(app, {});

    app.use(require('connect-livereload')({
        port: 35729
    }));
}
var Server;

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/js/bundle.js', browserify(['./client/src/main', 'jquery']));

function newResource(type) {
    return axios.post(process.env.SERVICES_PORT + "/" + type, {}, {
            headers: {
                Accept: "application/ld+json",
                "Content-Type": "application/ld+json"
            }
        })
        .catch(function (response) {
            if (response instanceof Error) {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', response.message);
            } else {
                // The request was made, but the server responded with a status code
                // that falls out of the range of 2xx
                console.log(response.data);
                console.log(response.status);
                console.log(response.headers);
                console.log(response.config);
            }
        });
}

app.get('/', function (res) {
    res.redirect("index.html");
});

app.get('/cataloguing/*', function (req, res, next) {
    res.sendFile('main_old.html', {title: 'Katalogisering', root: __dirname + '/public/'});
});

app.get('/workflow', function (req, res, next) {
    res.sendFile('main.html', {title: 'Katalogisering', root: __dirname + '/public/'});
});

app.get('/:type(person|work|publication)', function (req, res, next) {
    newResource(req.params.type).then(function (response) {
        res.redirect('/cataloguing/' + req.params.type + '?resource=' + response.headers.location);
    });
});

app.get('/config', function (request, response) {
    var config =
    {
        kohaOpacUri: (process.env.KOHA_OPAC_PORT || 'http://192.168.50.12:8080').replace(/^tcp:\//, 'http:/'),
        kohaIntraUri: (process.env.KOHA_INTRA_PORT || 'http://192.168.50.12:8082').replace(/^tcp:\//, 'http:/'),
        ontologyUri: (process.env.SERVICES_PORT || 'http://192.168.50.12:8005').replace(/^tcp:\//, 'http:/') + '/ontology',
        resourceApiUri: (process.env.SERVICES_PORT || 'http://192.168.50.12:8005').replace(/^tcp:\//, 'http:/') + '/',
        tabs: [
            {
                id: "confirm-person",
                rdfType: "Work",
                label: "Bekreft person",
                rdfProperties: [/* isbn later*/"creator"],
                nextStep: {
                    buttonLabel: "Verifisér verk",
                    createNewResource: "Work"
                }
            },
            {
                id: "confirm-work",
                rdfType: "Work",
                label: "Bekreft verk",
                rdfProperties: ["title", "originalTitle"],
                nextStep: {
                    buttonLabel: "Mer om verket"
                }
            },
            {
                id: "describe-work",
                rdfType: "Work",
                label: "Beskriv verket",
                rdfProperties: ["year"],
                nextStep: {
                    buttonLabel: "Mer om utgivelsen",
                    createNewResource: "Publication"
                }
            },
            {
                id: "describe-publication",
                rdfType: "Publication",
                label: "Beskriv utgivelsen",
                rdfProperties: ["title", /*"year",*/ "language", "format"],
                nextStep: {
                    buttonLabel: "Avslutt registrering av utgivelsen"
                }
            }
        ]
    };

    response.json(config);
})
;

app.use("/style", compileSass({
    root: path.join(__dirname, 'client/scss'),
    sourceMap: true, // Includes Base64 encoded source maps in output css
    sourceComments: false, // Includes source comments in output css
    watchFiles: true, // Watches sass files and updates mtime on main files for each change
    logToConsole: true // If true, will log to console.error on errors
}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

Server = app.listen(process.env.BIND_PORT || 8010, process.env.BIND_IP, function () {
    var host = Server.address().address,
        port = Server.address().port;
    console.log('Catalinker server listening at http://%s:%s', host, port);
});


module.exports = app;
