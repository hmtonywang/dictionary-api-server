'use strict';

const express = require('express');
const { param } = require('express-validator');
const rateLimitMiddleware = require('../../middlewares/rate_limit');
const validationResultMiddleware = require('../../middlewares/validation_result');
const wordController = require('../../controllers/word');
const localCache = require('../../../libs/local_cache')();
const cacheMiddleware = require('../../middlewares/cache');

module.exports = ({ config, logger }) => {
  const router = express.Router();
  const controller = wordController({ config, logger });
  const rateLimit = rateLimitMiddleware({ config });

  router
    .route('/:word')
    .get(
      rateLimit.requestsInSeconds(100, 24 * 3600),
      rateLimit.requestsInSeconds(30, 3600),
      rateLimit.requestsInSeconds(2, 5),
      param('word').trim().escape().notEmpty(),
      validationResultMiddleware,
      cacheMiddleware({ cacheImpl: localCache, logger }),
      controller.getMeaning
    );

  return router;
};
