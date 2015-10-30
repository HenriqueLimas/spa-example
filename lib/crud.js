/*
 * crud.js - module to provide CRUD db capabilities
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

var mongoServer;
var dbHandle;

var validator;

var loadSchema;
var checkSchema;
var clearIsOnline;
var checkType;
var constructObj;
var readObj;
var updateObj;
var destroyObj;

var objTypeMap = {
  user: {}
};

mongoServer = new mongodb.Server(
  'localhost',
  27017
);

dbHandle = new mongodb.Db(
  'spa',
  mongoServer, {
    w: 1
  }
);

validator = JSV.createEnvironment();

// ------------ BEGIN UTILITY METHODS ---------------
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

clearIsOnline = function() {
  updateObj(
    'user', {
      is_online: true
    }, {
      is_online: false
    },
    function(response_map) {
      console.log('All user ar offline.', response_map);
    }
  );
};
// ------------ END UTILITY METHODS ---------------

checkType = function(obj_type) {
  if (!objTypeMap[obj_type]) {
    return ({
      error_msg: 'Object type "' + obj_type + '" is not supported.'
    });
  }

  return null;
};

constructObj = function(obj_type, obj_map, callback) {
  let type_check_map = checkType(obj_type);

  if (type_check_map) {
    callback(type_check_map);
    return;
  }

  checkSchema(
    obj_type,
    obj_map,
    function(error_list) {
      if (!error_list.length) {
        dbHandle.collection(
          obj_type, (err, collection) => {
            let options_map = {
              safe: true
            };

            collection.insert(
              obj_map,
              options_map, (err, result_map) => {
                callback(result_map);
              }
            );
          }
        );
      } else {
        callback({
          error_msg: 'Input document not valid',
          error_list: error_list
        });
      }
    }
  );
};

readObj = function(obj_type, find_map, fields_map, callback) {
  let type_check_map = checkType(obj_type);

  if (type_check_map) {
    callback(type_check_map);
    return;
  }

  dbHandle.collection(
    obj_type, (err, collection) => {
      collection.find(find_map, fields_map).toArray(
        (err, obj) => {
          callback(obj);
        }
      );
    }
  );
};

updateObj = function(obj_type, find_map, set_map, callback) {
  let type_check_map = checkType(obj_type);

  if (type_check_map) {
    callback(type_check_map);
    return;
  }

  checkSchema(
    obj_type,
    set_map,
    function(error_list) {
      if (!error_list.length) {
        dbHandle.collection(
          obj_type, (err, collection) => {
            collection.update(
              find_map, {
                $set: set_map
              }, {
                safe: true,
                multi: true,
                upsert: false
              }, (err, updated_map) => {
                callback(updated_map);
              }
            );
          }
        );
      } else {
        callback({
          error_msg: 'Input document not valid',
          error_list: error_list
        });
      }
    }
  );
};

destroyObj = function(obj_type, find_map, callback) {
  let type_check_map = checkType(obj_type);

  if (type_check_map) {
    callback(type_check_map);
    return;
  }

  dbHandle.collection(
    obj_type,
    (err, collection) => {
      var options_map = {
        safe: true,
        single: true
      };

      collection.remove(
        find_map,
        options_map,
        (err, delete_count) => {
          callback(delete_count);
        }
      );
    }
  );
};

module.exports = {
  makeMongoId: mongodb.ObjectID,
  checkType: checkType,
  construct: constructObj,
  read: readObj,
  update: updateObj,
  destroy: destroyObj
};

console.log('** CRUD module loaded **');

dbHandle.open(() => {
  console.log('** Connected to MongoDB ** ');
});

(function() {
  for(let schema_name in objTypeMap) {
    if (objTypeMap.hasOwnProperty(schema_name)) {
      let schema_path = __dirname + '/' + schema_name + '.json';

      loadSchema(schema_name, schema_path);
    }
  }
})();