import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  config.baseUrl = 'http://localhost:7001';

  config.mongoose = {
    url: 'mongodb://localhost:27077/tiny',
    options: {
      dbName: 'tiny',
      user: 'cpm',
      pass: '81109044',
      authSource: 'admin',
    },
  };

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0,
    },
  };
  return config;
};
