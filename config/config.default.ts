import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import { join } from 'path';
export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1670311573895_1461';

  // add your egg config in here
  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ['http://localhost:7001'],
  };

  config.view = {
    defaultViewEngine: 'nunjucks',
  };

  config.bcrypt = {
    saltRounds: 10,
  };

  config.session = {
    encrypt: false,
  };
  config.jwt = {
    secret: '_1670311573OIS95_AKLIF',
    enable: true,
    match: [
      '/api/user/getUserInfo',
      '/api/works',
      '/api/utils/fileUpload',
      '/api/utils/uploadToOSS',
      '/api/channel',
    ],
  };

  // config.cors = {
  //   origin: 'http://localhost:8080',
  //   allowMethods: 'GET,HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
  // };

  config.multipart = {
    mode: 'stream',
    whitelist: ['.png', '.jpg', '.jpeg', '.svg'],
    fileSize: '300kb',
  };

  config.oss = {
    client: {
      accessKeyId: process.env.ACL_ACCESS_KEY!,
      accessKeySecret: process.env.ACL_SECRET_KEY!,
      bucket: 'lhj-private',
      endpoint: 'oss-cn-shenzhen.aliyuncs.com',
    },
  };

  config.static = {
    dir: [
      {
        prefix: '/public',
        dir: join(appInfo.baseDir, 'app/public'),
      },
      {
        prefix: '/uploads',
        dir: join(appInfo.baseDir, 'uploads'),
      },
    ],
  };

  // gitee oauth config
  const giteeConfig = {
    clientId:
      'dbfe3de4bb363e9be545aedcc8aa80075f606106df7635392374b5003caa89d6',
    clientSecret:
      '91b1909e1bb691207047fa73c7bb6ff677dd2c6f98ed2168bff32f773d87db7b',
    redirectUrl: 'http://localhost:7001/api/user/passport/gitee/callback',
    authUrl: 'https://gitee.com/oauth/token?grant_type=authorization_code',
    giteeUserApi: 'https://gitee.com/api/v5/user',
  };

  const githubOauthConfig = {
    client_id: 'ae9b32fc2800538a12f9',
    ClientSecrets: '8c6206dcfc38622c7c475239d615e509a6a7f234',
    redirect_uri: 'http://localhost:7001/api/user/passport/github/callback',
    authUrl: 'https://github.com/login/oauth/authorize',
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    tnLogger: {
      allowedMethod: ['post'],
    },
    baseUrl: 'default.url',
    thirdParty: {
      A: {
        accessKeyId: process.env.ACL_ACCESS_KEY!,
        accessKeySecret: process.env.ACL_SECRET_KEY!,
        endPoint: 'dysmsapi.aliyuncs.com',
        SMS_CONFIG: {
          signName: 'CPMLHJTINY',
          templateCode: {
            verifyCode: 'SMS_264135488',
          },
        },
      },
    },
    giteeConfig,
    githubOauthConfig,
    jwtExpires: '1h',
  };

  // the return config will combines to EggAppConfig
  const base = { ...config } as {};

  return {
    ...base,
    ...bizConfig,
  };
};
