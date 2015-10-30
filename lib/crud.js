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

var checkType;
var constructObj;
var readObj;
var updateObj;
var destroyObj;

checkType = function() {};
constructObj = function() {};
readObj = function() {};
updateObj = function() {};
destroyObj = function() {};

module.exports = {
  makeMongoId: null,
  checkType: checkType,
  construct: constructObj,
  read: readObj,
  update: updateObj,
  destroy: destroyObj
};

console.log('** CRUD module loaded **');