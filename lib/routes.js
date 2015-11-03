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

var agent_text =  'Enter the modern single page web application(SPA).'
+ 'With the near universal availability of capable browsers and '
+ 'powerful hardware, we can push most of the web application to'
+ ' the browser; including HTML rendering, data, and business '
+ 'logic. The only time a client needs to communicate with the '
+ 'server is to authenticate or synchronize data. This means users'
+ ' get a fluid, comfortable experience whether they\'re surfing '
+ 'at their desk or using a phone app on a sketch 3G connection.'
+ '<br><br>'
+ '<a href="/index.htm#page=home">;Home</a><br>'
+ '<a href="/index.htm#page=about">About</a><br>'
+ '<a href="/index.htm#page=buynow">Buy Now!</a><br>'
+ '<a href="/index.htm#page=contact us">Contact Us</a><br>';

configRoutes = function(app, server) {
  app.all('*', (request, response, next) => {
    if (request.headers['user-agent'] === 'Googlebot/2.1 (+http://www.googlebot.com/bot.html)') {
      response.contentType('html');
      response.end(agent_text);
    } else {
      next();
    }
  });

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
