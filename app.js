/*
 * app.js - Hello World
 */
/*jslint node : true, continue : true,
devel : true, indent : 2, maxerr : 50,
newcap : true, nomen : true, plusplus : true,
regexp : true, sloppy : true, vars : false,
white : true
*/
/*global */
'use strict';

var http = require('http');
var express = require('express');
var routes = require('./routes');
var server,
    app;

app = express();

server = http.createServer(app);

// -------- BEGIN SERVER CONFIGURATION --------
app.configure(() => {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function() {
  app.use(express.logger());
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

routes.configRoutes(app, server);
// -------- END SERVER CONFIGURATION ----------

server.listen(3000);

console.log('Listening  on port %d in %s mode', server.address().port, app.settings.env);
