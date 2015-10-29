/*
 * socket.js - simple socket.io example
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
var socketIo = require('socket.io');
var fs = require('fs');

var app = express();
var server = http.createServer(app);
var io = socketIo.listen(server);

var setWatch;
var watchMap = {};

setWatch = function(url_path, file_type) {
  console.log('setWatch called on ' + url_path);

  if (!watchMap[url_path]) {
    console.log('setting watch on ' + url_path);
    fs.watchFile(
      __dirname + url_path,
      function(current, previous) {
        console.log('file acessed');
        console.log(current.mtime, previous.mtime);
        if (current.mtime.toString() !== previous.mtime.toString()) {
          io.sockets.emit(file_type, url_path);
        }
      }
    );

    watchMap[url_path] = true;
  }
};

app.configure(function() {
  app.use(function(request, response, next) {
    if (request.url.indexOf('/js/') >= 0) {
      setWatch(request.url, 'script');
    } else if (request.url.indexOf('/css/') >= 0) {
      setWatch(request.url, 'stylesheet');
    }

    next();
  });

  app.use(express.static(__dirname + '/'));
});

app.get('/', function(request, response) {
  response.redirect('/socket.html');
});

server.listen(3000);

console.log('Server listening on port %d in %s mode', server.address().port, app.settings.env);
