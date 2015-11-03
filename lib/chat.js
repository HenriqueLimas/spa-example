/*
 * chat.js - module to provide chat messaging
 */
/*jslint node : true, continue : true,
 devel : true, indent : 2, maxerr : 50,
 newcap : true, nomen : true, plusplus : true,
 regexp : true, sloppy : true, vars : false,
 white : true
*/

'use strict';

var socket = require('socket.io');
var crud = require('./crud');

var chatObj;

chatObj = {
  connect: function(server) {
    var io = socket.listen(server);

    io
      .set('blacklist', [])
      .of('/chat')
      .on('connection', function(socket) {
        socket.on('adduser', function() {});
        socket.on('updatechat', function() {});
        socket.on('leavechat', function() {});
        socket.on('disconnect', function() {});
        socket.on('updateavatar', function() {});
      });
    return io;
  }
};

module.exports = chatObj;
