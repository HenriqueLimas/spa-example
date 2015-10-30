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

var mongodb = require('mongodb');
var mongoServer;
var dbHandle;
var configRoutes;
var makeMongoId;

mongoServer = new mongodb.Server(
  'localhost',
  27017
);

dbHandle = new mongodb.Db(
  'spa',
  mongoServer,
  {w: 1}
);

makeMongoId = mongodb.ObjectID;

configRoutes = function(app) {
  app.get('/', (request, response) => {
    response.redirect('/spa.html');
  });

  app.all('/:obj_type/*?', function(request, response, next) {
    response.contentType('json');
    next();
  });

  app.get('/:obj_type/list', (request, response) => {
    dbHandle.collection(
      request.params.obj_type,
      function(err, collection) {
        collection.find().toArray(function(err, items) {
          response.send(items);
        });
      }
    );
  });

  app.post('/:obj_type/create', (request, response) => {
    var options_map = {
      safe: true
    };

    var obj_map = request.body;

    dbHandle.collection(
      request.params.obj_type,
      function(err, collection) {
        collection.insert(
          obj_map,
          options_map,
          function(err, result_map) {
            response.send(result_map);
          }
        );
      }
    );
  });

  app.get('/:obj_type/read/:id', (request, response) => {
    var find_map = {
      _id: makeMongoId(request.params.id)
    };

    dbHandle.collection(
      request.params.obj_type,
      function(err, collection) {
        collection.findOne(
          find_map,
          function(err, obj) {
            response.send(obj);
          }
        );
      }
    );
  });

  app.post('/:obj_type/read/:id', (request, response) => {
    var find_map = {_id: makeMongoId(request.params.id)};
    var obj_map = request.body;

    dbHandle.collection(
      request.params.obj_type,
      function(err, collection) {
        var sort_order = [];
        var options_map = {'new': true, upsert: false, safe: true};

        collection.findAndModify(
          find_map,
          sort_order,
          obj_map,
          options_map,
          function(err, updated_map) {
            response.send(updated_map);
          }
        );
      }
    );
  });

  app.get('/:obj_type/delete/:id', (request, response) => {
    var find_map = {_id: makeMongoId(request.params.id)};

    dbHandle.collection(
      request.params.obj_type,
      function(err, collection) {
        var options_map = {safe: true, single: true};

        collection.remove(
          find_map,
          options_map,
          function(err, delete_count) {
            response.send(delete_count);
          }
        );
      }
    );
  });
};

module.exports = {
  configRoutes: configRoutes
};

dbHandle.open(function() {
  console.log('** Connected to MongoDB ** ');
});