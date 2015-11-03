/*
* cache.js - Redis cache implementation
*/
/*jslint node : true, continue : true,
devel : true, indent : 2, maxerr : 50,
newcap : true, nomen : true, plusplus : true,
regexp : true, sloppy : true, vars : false,
white : true
*/

'use strict';

var redisDriver = require('redis');
var redisClient = redisDriver.createClient();

var makeString,
    deleteKey,
    getValue,
    setValue;

redisClient.on("error", function (err) {
    console.log("Error " + err);
});

makeString = function(key_data) {
  return (typeof key_data === 'string')
    ? key_data
    : JSON.stringify(key_data);
};

deleteKey = function(key) {
  redisClient.del(makeString(key));
};

getValue = function(key, hit_callback, miss_callback) {
  redisClient.get(
    makeString(key),
    function(err, reply) {
      if (reply) {
        console.log('HIT');
        hit_callback(reply);
      } else {
        console.log('MISS');
        miss_callback();
      }
    }
  );
};

setValue = function(key, value) {
  redisClient.set(
    makeString(key), makeString(value)
  );
};

module.exports = {
  deleteKey: deleteKey,
  getValue: getValue,
  setValue: setValue
};