import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  config.baseUrl = 'prod.url';
  config.mongoose = {
    url: 'mongodb://tiny-mongo:27017/tiny',
    options: {
      dbName: 'tiny',
      user: process.env.MONGO_DB_USERNAME,
      pass: process.env.MONGO_DB_PASSWORD,
    },
  };
  config.redis = {
    client: {
      port: 6379,
      host: 'tiny-redis',
      password: process.env.REDIS_PASSWORD,
      db: 0,
    },
  };

  config.security = {
    domainWhiteList: [''],
  };

  config.jwtExpires = '2 days';

  return config;
};
