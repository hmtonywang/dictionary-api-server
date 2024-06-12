/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const Redis = require('ioredis');
const connection = require('../../../../../frameworks/database/redis/connection');
const { redis: redisConfig } = require('../../../../../config');

describe('redis connection', () => {
  const FakeRedis = sinon.fake();
  FakeRedis.prototype.on = sinon.fake();
  const logger = { info: sinon.fake(), error: sinon.fake() };

  afterEach(() => {
    sinon.restore();
  });

  it('should return an object with a createRedisClient function', () => {
    const config = {};

    const redisConnection = connection({
      Redis: FakeRedis,
      config,
      logger
    });

    expect(redisConnection).has.property('createRedisClient');
    expect(redisConnection.createRedisClient).to.be.a('function');
  });

  it('should create a ioredis client with the correct url', async () => {
    const redisConnection = connection({
      Redis,
      config: redisConfig,
      logger
    });
    try {
      const redisClient = await redisConnection.createRedisClient();
      expect(redisClient instanceof Redis).to.be.true;
      redisClient.disconnect();
    } catch (error) {
      expect('should create a redis client').to.be.true;
    }
  });

  it('should throw an error if invalid host and port has been provided', async () => {
    const config = {
      host: 'invalid host',
      port: 'invalid port'
    };

    const redisConnection = connection({
      Redis,
      config,
      logger
    });
    let err;
    try {
      await redisConnection.createRedisClient();
    } catch (error) {
      err = error;
    }
    expect(err instanceof Error).to.be.true;
  });
});
