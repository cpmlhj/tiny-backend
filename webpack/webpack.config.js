const path = require('path');
const htmlPlugin = require('html-webpack-plugin');
const cssPlugin = require('mini-css-extract-plugin');
const buildFileDist = path.resolve(__dirname, '../app/public');
const fileManager = require('filemanager-webpack-plugin');
const tempalteFile = path.resolve(__dirname, '../app/view');
const clean = require('clean');
module.exports = (env) => {
  return {
    mode: 'production',
    context: path.resolve(__dirname, '../webpack'),
    entry: './index.js',
    output: {
      path: buildFileDist,
      filename: 'bundle.[hash].js',
      publicPath: env.production
        ? 'http://lhj-private.oss-cn-shenzhen.aliyuncs.com/static/renderer/'
        : '/public/',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [cssPlugin.loader, 'css-loader'],
        },
      ],
    },
    plugins: [
      new cssPlugin({
        filename: '[name].[hash].css',
      }),
      new htmlPlugin({
        filename: 'renderer.nj',
        template: path.resolve(__dirname, 'template.html'),
      }),
      new fileManager({
        events: {
          onEnd: {
            copy: [
              {
                source: path.join(buildFileDist, 'renderer.nj'),
                destination: path.join(tempalteFile, 'renderer.nj'),
              },
            ],
          },
        },
      }),
    ],
  };
};
