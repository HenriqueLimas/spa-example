/*
 * routes.js - module to provide routing
 */
/*jslint node : true, continue : true,
 devel : true, indent : 2, maxerr : 50,
 newcap : true, nomen : true, plusplus : true,
 regexp : true, sloppy : true, vars : false,
 white : true
*/

'use strict';

var crud = require('./crud');
var chat = require('./chat');

var configRoutes;
var makeMongoId = crud.makeMongoId;

configRoutes = function(app, server) {
  app.get('/', (request, response) => {
    response.redirect('/spa.html');
  });

  app.all('/:obj_type/*?', (request, response, next) => {
    response.contentType('json');
    next();
  });

  app.get('/:obj_type/list', (request, response) => {
    crud.read(
      request.params.obj_type, {}, {},
      function(map_list) {
        response.send(map_list);
      }
    );
  });

  app.post('/:obj_type/create', (request, response) => {
    crud.construct(
      request.params.obj_type,
      request.body,
      function(result_map) {
        response.send(result_map);
      }
    );
  });

  app.get('/:obj_type/read/:id', (request, response) => {
    crud.read(
      request.params.obj_type,
      {_id: makeMongoId(request.params.id)},
      {},
      function(map_list) {
        response.send(map_list);
      }
    );
  });

  app.post('/:obj_type/read/:id', (request, response) => {
    crud.update(
      request.params.obj_type,
      {_id: makeMongoId(request.params.id)},
      request.body,
      function(result_map) {
        response.send(result_map);
      }
    );
  });

  app.get('/:obj_type/delete/:id', (request, response) => {
    crud.destroy(
      request.params.obj_type,
      {_id: makeMongoId(request.params.id)},
      function(result_map) {
        response.send(result_map);
      }
    );
  });

  chat.connect(server);
};

module.exports = {
  configRoutes: configRoutes
};
