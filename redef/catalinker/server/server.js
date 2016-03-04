var express = require('express');
var path = require('path');
var logger = require('morgan');
var browserify = require('browserify-middleware');
var axios = require('axios');
var compileSass = require('express-compile-sass');
var app = express();
var requestProxy = require('express-request-proxy');

if (app.get('env') === 'development') {
  var livereload = require('express-livereload');
  livereload(app, {});

  app.use(require('connect-livereload')({
    port: 35729
  }));
}
var Server;

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '/../public')));

app.get('/js/bundle.js', browserify(['./client/src/main', 'jquery', 'ractive-decorators-select2', 'select2', 'ractive-multi-decorator', {'./client/src/bootstrap': {run: true}}]));
app.get('/js/bundle_for_old.js', browserify(['./client/src/main_old']));

app.get('/css/vendor/:cssFile', function (request, response) {
  response.sendFile(request.params.cssFile, {root: path.resolve(path.join(__dirname, "/../node_modules/select2/dist/css/"))});
});


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
  res.sendFile('main_old.html', {title: 'Katalogisering', root: __dirname + '/../public/'});
});

app.get('/workflow', function (req, res, next) {
  res.sendFile('main.html', {title: 'Katalogisering', root: __dirname + '/../public/'});
});

app.get('/:type(person|work|publication|placeOfPublication)', function (req, res, next) {
  newResource(req.params.type).then(function (response) {
    res.redirect('/cataloguing/' + req.params.type + '?resource=' + response.headers.location);
  });
});

app.get('/config', function (request, response) {
  var config =
    {
      kohaOpacUri: (process.env.KOHA_OPAC_PORT || 'http://192.168.50.12:8080').replace(/^tcp:\//, 'http:/'),
      kohaIntraUri: (process.env.KOHA_INTRA_PORT || 'http://192.168.50.12:8081').replace(/^tcp:\//, 'http:/'),
      ontologyUri:  '/services/ontology',
      resourceApiUri: '/services/',
      tabs: [
            {
              id: "confirm-person",
              rdfType: "Work",
              label: "Bekreft person",
              inputs: [
                  {rdfProperty: "creator", type: "searchable-person"}
              ],
              nextStep: {
                buttonLabel: "Bekreft verk",
                createNewResource: "Work"
              }
            },
            {
              id: "confirm-work",
              rdfType: "Work",
              label: "Bekreft verk",
              inputs: [
                  {rdfProperty: "mainTitle"},
                  {rdfProperty: "subtitle"},
                  {rdfProperty: "partTitle"},
                  {rdfProperty: "partNumber"}
              ],
              nextStep: {
                buttonLabel: "Beskriv verket"
              }
            },
            {
              id: "describe-work",
              rdfType: "Work",
              label: "Beskriv verket",
              inputs: [
                  {rdfProperty: "publicationYear"},
                  {rdfProperty: "language", multiple: true},
                  {rdfProperty: "literaryForm", multiple: true},
                  {rdfProperty: "audience", multiple: true},
                  {rdfProperty: "biography", multiple: true},
                  {rdfProperty: "adaptationOfWorkForParticularUserGroups", multiple: true}
              ],
              nextStep: {
                buttonLabel: "Beskriv utgivelsen",
                createNewResource: "Publication"
              }
            },
            {
              id: "describe-publication",
              rdfType: "Publication",
              label: "Beskriv utgivelsen",
              inputs: [
                  {rdfProperty: "publicationOf", type: "entity"},
                  {rdfProperty: "mainTitle"},
                  {rdfProperty: "subtitle"},
                  {rdfProperty: "partTitle"},
                  {rdfProperty: "partNumber"},
                  {rdfProperty: "edition"},
                  {rdfProperty: "publicationYear"},
                  {rdfProperty: "numberOfPages"},
                  {rdfProperty: "illustrativeMatter"},
                  {rdfProperty: "isbn"},
                  {rdfProperty: "binding"},
                  {rdfProperty: "language"},
                  {rdfProperty: "format", multiple: true},
                  {rdfProperty: "writingSystem", multiple: true},
                  {rdfProperty: "adaptationOfPublicationForParticularUserGroups", multiple: true},
                  {
                    rdfProperty: "placeOfPublication",
                    authority: true, // this indicates it is an authorized entity
                    nameProperties: ["place", "country"], // these are proeprty names used to label already connected entities
                    indexType: "placeOfPublication", // this is the name of the elasticsearch index type from which authorities are searched within
                    indexDocumentFields: ["place", "country"] // these are indexed document JSON properties from which the labels for authoroty select list are concatenated
                  }
                ],
              nextStep: {
                buttonLabel: "Bekreft biinførsler"
              }
            },
            {
              // additional entries, such as translator, illustrator, composer etc
              id: "confirm-addedentry",
              rdfType: "Work",
              label: "Bekreft biinførsler",
              inputs: [
                    {
                      predicateType: "role", // the possible values for this input is fetched from predefined list in services with this name (...ontology#role in this case)
                      subjects: ["Work", "Publication"], // the triple may have a subject of one of these types as subject, fetched from one of the loaded resources
                      type: "searchable-person", // type if input widget
                      label: "Legg til biinførsel",
                      multiple: true, // there may be more than one additional entry
                      dataAutomationId: "search_role_player" // override or define automation-id for test purposes
                    }
                ],
              nextStep: {
                buttonLabel: "Avslutt registrering av utgivelsen",
                restart: true
              }
            }

        ]
    };
  response.json(config);
});

app.get('/version', function (request, response) {
  response.json({ 'buildTag': process.env.BUILD_TAG, 'gitref': process.env.GITREF });
});

var services = (process.env.SERVICES_PORT || 'http://services:8005').replace(/^tcp:\//, 'http:/');
app.all('/services/*', requestProxy({
  url: services + '/*'
}));

app.use("/style", compileSass({
  root: path.join(__dirname, '/../client/scss'),
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
