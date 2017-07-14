const
  uuid = require('uuid'),
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session);

function Middleware(sessionSecret, sessionName, dbPromise) {

  if (!sessionSecret) {
    throw new Error('sessionSecret must be provided');
  }

  if (!sessionName) {
    throw new Error('sessionName must be provided');
  }

  if (!dbPromise) {
    throw new Error('dbPromise must be provided');
  }

  let mongoStore = new MongoStore({
    dbPromise: dbPromise,
    ttl: 60 * 60 * 2 // 2 hours
  });

  let sessionMiddleware = session({
    store: mongoStore,
    httpOnly: true,
    secret: sessionSecret,
    genid: uuid,
    name: sessionName,
    cookie: { //secure: false,
      maxAge: 1000 * 60 * 60 * 2, // two hours
      path: '/'
    },
    maxAge: 60 * 60 * 2,
    resave: false,
    //rolling: false,
    saveUninitialized: true
  });

  return sessionMiddleware;

}

module.exports = Middleware;
