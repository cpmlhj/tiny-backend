// import { EggPlugin } from 'egg';

// const plugin: EggPlugin = {
//   // static: true,
//   nunjucks: {
//     enable: true,
//     package: 'egg-view-nunjucks',
//   },
// };

exports.static = {
  enable: true,
  package: 'egg-static',
};
exports.mongoose = {
  enable: true,
  package: 'egg-mongoose',
};

exports.nunjucks = {
  enable: true,
  package: 'egg-view-nunjucks',
};

exports.validate = {
  enable: true,
  package: 'egg-validate',
};
exports.bcrypt = {
  enable: true,
  package: 'egg-bcrypt',
};

exports.redis = {
  enable: true,
  package: 'egg-redis',
};

exports.jwt = {
  enable: true,
  package: 'egg-jwt',
};

exports.cors = {
  enable: true,
  package: 'egg-cors',
};

exports.oss = {
  enable: true,
  package: 'egg-oss',
};

// export default plugin;
