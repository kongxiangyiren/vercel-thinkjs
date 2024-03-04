const path = require('path');
const Application = require('thinkjs');
const Loader = require('thinkjs/lib/loader');

class VercelLoader extends Loader {
  writeConfig() {}
}

const app = new Application({
  ROOT_PATH: __dirname,
  APP_PATH: path.join(__dirname, 'app'),
  VIEW_PATH: path.join(__dirname, 'view'),
  proxy: true, // use proxy
  env: 'vercel',
  external: {
    log4js: {
      stdout: path.join(__dirname, 'node_modules/log4js/lib/appenders/stdout.js'),
      console: path.join(__dirname, 'node_modules/log4js/lib/appenders/console.js')
    },
    static: {
      www: path.join(__dirname, 'www')
    },
    data: path.join(__dirname, 'data')
  }
});

const loader = new VercelLoader(app.options);
loader.loadAll('worker');
think.app.emit('appReady');
module.exports = think.app.callback();
