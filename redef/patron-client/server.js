/*globals process */
"use strict";

var express = require('express'),
    hbs = require('hbs'),
    http = require('http'),
    config = require('./lib/config'),
    graph = require('ld-graph'),
    app = express(),
    Server;

app.set('view engine', 'hbs');
app.use(express.static('public', { extensions: ['html'] }));

function getData(body) {
  var data = {};
  try {
    data = {ok: true, data: JSON.parse(body)};
  } catch (error) {
    data = {ok: false, data: error};
  }
  return data;
}

app.get('/config', function (request, response) {
  response.json(config.get(process.env));
});

app.get('/person/:id', function (request, response) {
  response.type(".html");
  response.status(200);
  response.sendFile(__dirname +'/public/person.html');
});

app.get('/work/:id', function (request, response) {
  var parameters = config.get(process.env);
  parameters.path = "/work/" + request.params.id;

  // fetch work
  http.get(parameters, function (res) {
    var workjson = '';
    res.on('data', function (chunk) {
      workjson += chunk;
    })
    .on('end', function () {
      console.log("Received reply from services for '" + parameters.path + "' with status code: " + res.statusCode);
      var workData = getData(workjson);
      var parsedWorkData = graph.parse(workData.data);
      if (workData.ok) {
        var publications = [];
        parsedWorkData.byType("deichman:Publication").forEach(function (publication){
            publications.push({
              id: publication.id,
              name: publication.getAll("name")[0].value,
              language: publication.outAll("language").map(function(lang){return lang.get("label").value;}).join(", "),
              format: publication.out("format").get("label").value,
              items: []
            });
        });
        var responseData = {
          work: {
            name: parsedWorkData.byType("deichman:Work")[0].getAll("name").map(function(name){return name.value;}).join(", "),
            year: parsedWorkData.byType("deichman:Work")[0].getAll("year").map(function(year){return year.value;}).join(", "),
            creator: parsedWorkData.byType("deichman:Work")[0].outAll("creator").map(function(creator){return creator.get("name").value;}).join(", "),
            publications: publications,
            hasItems: function() {
              var retVal = false;
              publications.find(function (publication) {
                if(publication.items.length > 0) {
                  retVal = true;
                }
              });
              return retVal;
            }
          }
        };

        parameters.path += '/items';
        http.get(parameters, function (res) {
          var itemsjson = '';
          res.on('data', function (chunk) {
            itemsjson += chunk;
          })
          .on('end', function () {
            var itemData = getData(itemsjson);
            console.log("Received reply from services for '" + parameters.path + "' with status code: " + res.statusCode);
            if (itemData.ok) {
              responseData.items = [];
              var parsedItemData = graph.parse(itemData.data);
              parsedItemData.byType("deichman:Item").forEach(function(item){
                responseData.work.publications.forEach(function(pub){
                  var item = parsedItemData.byType("deichman:Item")[0];
                  if (pub.id === item.out("editionOf").id) {
                    pub.items.push({
                      barcode: item.get("barcode").value,
                      status: item.get("status").value,
                      location: item.get("location").value,
                      onloan: item.get("onloan").value,
                      shelfmark: item.get("shelfmark").value
                    });
                  }
                });
              });
            }
            response.render('index', responseData);
          })
          .on('error', function (e) {
            console.log("Got error: ", e);
          });
        });
      } else {
        response.status(res.statusCode);
        response.render('error', {data: res.statusMessage});
      }
    })
    .on('error', function (e) {
      console.log("Got error: ", e);
    });
  });
});

Server = app.listen(8000, function () {
  var host = Server.address().address,
      port = Server.address().port;
  console.log('Server listening at http://%s:%s', host, port);
});
