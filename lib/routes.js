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

var fs = require('fs');
var mongodb = require('mongodb');
var JSV = require('JSV').JSV;
var crud = require('./crud');

var validator = JSV.createEnvironment();

var mongoServer;
var dbHandle;
var configRoutes;
var makeMongoId;

var loadSchema;
var checkSchema;
var objTypeMap = {
  user: {}
};

loadSchema = function(schema_name, schema_path) {
  fs.readFile(schema_path, 'utf-8', function(err, data) {
    objTypeMap[schema_name] = JSON.parse(data);
  });
};

checkSchema = function(obj_name, obj_map, callback) {
  var schema_map = objTypeMap[obj_name];

  var reporter_map = validator.validate(obj_map, schema_map);

  callback(reporter_map.errors);
};

(function() {
  for(let schema_name in objTypeMap) {
    if (objTypeMap.hasOwnProperty(schema_name)) {
      let schema_path = __dirname + '/' + schema_name + '.json';

      loadSchema(schema_name, schema_path);
    }
  }
})();

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

  app.all('/:obj_type/*?', (request, response, next) => {
    response.contentType('json');
    if (objTypeMap[request.params.obj_type]) {
      next();
    } else {
      response.send({
        error_msg: request.params.obj_type + ' is not valid object type'
      });
    }
  });

  app.get('/:obj_type/list', (request, response) => {
    dbHandle.collection(
      request.params.obj_type,
      (err, collection) => {
        collection.find().toArray(function(err, items) {
          response.send(items);
        });
      }
    );
  });

  app.post('/:obj_type/create', (request, response) => {
    let obj_type = request.params.obj_type;
    let obj_map = request.body;

    checkSchema(
      obj_type,
      obj_map,
      function(error_list) {
        if (!error_list.length) {
          dbHandle.collection(
            obj_type,
            (err, collection) => {
              let options_map = {
                safe: true
              };

              collection.insert(
                obj_map,
                options_map,
                (err, result_map) => {
                  response.send(result_map);
                }
              );
            }
          );
        } else {
          response.send({
            error_msg: 'Input document not valid',
            error_list: error_list
          });
        }
      }
    );
  });

  app.get('/:obj_type/read/:id', (request, response) => {
    var find_map = {
      _id: makeMongoId(request.params.id)
    };

    dbHandle.collection(
      request.params.obj_type,
      (err, collection) => {
        collection.findOne(
          find_map,
          (err, obj) => {
            response.send(obj);
          }
        );
      }
    );
  });

  app.post('/:obj_type/read/:id', (request, response) => {
    let obj_map = request.body;
    let obj_type = request.params.obj_type;

    checkSchema(
      obj_type,
      obj_map,
      function(error_list) {
        let find_map = {_id: makeMongoId(request.params.id)};

        if (!error_list.length) {
          dbHandle.collection(
            obj_type,
            (err, collection) => {
              let sort_order = [];
              let options_map = {'new': true, upsert: false, safe: true};

              collection.findAndModify(
                find_map,
                sort_order,
                obj_map,
                options_map,
                (err, updated_map) => {
                  response.send(updated_map);
                }
              );
            }
          );
        } else {
          response.send({
            error_msg: 'Input document not valid',
            error_list: error_list
          });
        }
      }
    );
  });

  app.get('/:obj_type/delete/:id', (request, response) => {
    var find_map = {_id: makeMongoId(request.params.id)};

    dbHandle.collection(
      request.params.obj_type,
      (err, collection) => {
        var options_map = {safe: true, single: true};

        collection.remove(
          find_map,
          options_map,
          (err, delete_count) => {
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

dbHandle.open(() => {
  console.log('** Connected to MongoDB ** ');
});