'use strict';

const http = require('http');
const express = require('express');
const Redis = require('ioredis');
const bunyan = require('bunyan');
const config = require('./config');
const serverConfig = require('./frameworks/webserver/server');
const loggerConfig = require('./frameworks/webserver/logger');
const expressConfig = require('./frameworks/webserver/express');
const redisConnection = require('./frameworks/database/redis/connection');
const routes = require('./frameworks/webserver/routes');
const errorHandlingMiddleware = require('./frameworks/webserver/middlewares/error_handling');

const logger = loggerConfig(bunyan, config.logger)('app');
const app = express();
const httpServer = http.createServer(app);

redisConnection({
  Redis,
  url: config.redis,
  logger
})
  .createRedisClient()
  .then(redisClient => {
    expressConfig({
      app,
      config,
      logger
    });

    serverConfig({
      app,
      server: httpServer,
      config: config.server,
      redisClient,
      logger
    }).launch();

    routes({
      app,
      express,
      config,
      logger,
      redisClient
    });

    app.use(errorHandlingMiddleware({ logger, config }));

    process.on('uncaughtException', (error) => {
      logger.error({ error }, 'Uncaught exception');
    });
  })
  .catch(error => {
    logger.error({ error }, 'Create redis connection error');
    process.exit(1);
  });

module.exports = app;
