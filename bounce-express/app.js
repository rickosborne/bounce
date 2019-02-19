const http = require('http');
const express = require('express');
const logger = require('morgan');
const mysql2 = require('mysql2');
const fs = require('fs');

const HTTP_400_BAD_REQUEST = 400;
const HTTP_404_NOT_FOUND = 404;
const HTTP_500_QUERY_FAIL = 500;

const KEY_RE = /^[-_.a-zA-Z0-9/]+$/;

const LINK_BY_ID = `
  SELECT link_id AS id, link_name AS name, link_to AS href, link_title AS title
  FROM bounce_link
  WHERE (link_name = ?)
`;

const UPDATE_PEEKS = `
  UPDATE bounce_link
  SET link_peeks = link_peeks + 1
  WHERE (link_id = ?)
`;

const UPDATE_HITS = `
  UPDATE bounce_link
  SET link_hits = link_hits + 1
  WHERE (link_id = ?)
`;

const DB_HOST = envParam('DB_HOST', '127.0.0.1');
const DB_PORT = envParam('DB_PORT', 3306);
const DB_USER = envParam('DB_USER');
const DB_PASS = envParam('DB_PASS');
const DB_SCHEMA = envParam('DB_SCHEMA');
const LOG_PATH = envParam('LOG_PATH', '/var/log/bounce.log');

const logStream = fs.createWriteStream(LOG_PATH, {flags: 'a'});

const db = mysql2.createPool({
  waitForConnections: true,
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_SCHEMA,
  connectionLimit: 4,
  queueLimit: 0
});

const app = express();

/**
 * Get port from environment and store in Express.
 */
const port = envParam('PORT', 3000, port => Math.floor(port));
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);

server.on('error', error => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

const PICS_ROOT = 'https://pics.rickosborne.org/';
const HREF_DEFAULT = 'https://rickosborne.org/';

app.use(logger('combined', {stream: logStream}));

// noinspection JSUnresolvedFunction
app.get('/p/:photoPath', (req, res, next) => {
  const photoPath = req.params['photoPath'];
  res.redirect(PICS_ROOT + photoPath);
  next();
});

app.all('/:key', (req, res, next) => {
  const key = req.params['key'];
  if (['HEAD', 'GET'].indexOf(req.method) < 0 || !KEY_RE.test(key)) {
    res.status(HTTP_400_BAD_REQUEST).end();
    next();
    return;
  }
  const isPeek = req.method === 'HEAD';
  db.query(LINK_BY_ID, [key], (err, rows) => {
    if (err) {
      res.status(HTTP_500_QUERY_FAIL).end();
      next();
      return;
    }
    if (!Array.isArray(rows) || rows.length !== 1) {
      res.status(HTTP_404_NOT_FOUND).end();
      next();
      return;
    }
    const row = rows[0];
    const href = row['href'];
    const id = row['id'];
    db.query(isPeek ? UPDATE_PEEKS : UPDATE_HITS, [id], (err) => {
      // ignore any errors
    });
    res.redirect(href);
    next();
  });
});

// noinspection JSUnresolvedFunction
app.get('/', (req, res, next) => {
  res.redirect(HREF_DEFAULT);
  next();
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).end();
  next();
});

module.exports = app;

function envParam(name, defaultValue = null, normalizer = (value) => {
  return value;
}) {
  const value = process.env[name];
  if (value == null) {
    if (defaultValue == null) {
      throw new Error(`Missing required param: ${name}`);
    }
    return defaultValue;
  }
  if (normalizer) {
    return normalizer(value);
  }
  return value;
}
