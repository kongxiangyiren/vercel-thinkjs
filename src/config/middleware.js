const path = require('path');
const cors = require('@koa/cors');
const isDev = think.env === 'development';
const isVercel = think.env === 'vercel';
module.exports = [
  {
    handle: 'meta',
    options: {
      logRequest: isDev,
      sendResponseTime: isDev
    }
  },

  // 添加 跨域配置
  {
    handle: cors,
    options: {
      origin: function(ctx) {
        // 设置允许来自指定域名请求
        if (ctx.url.slice(0, 4) === '/api') {
          return '*'; // 允许来自所有域名请求
        }
      },
      maxAge: 5, // 指定本次预检请求的有效期，单位为秒。
      credentials: true // 是否允许发送Cookie
      // allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
      // allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
      // exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
    }
  },
  // 静态文件设置
  {
    handle: 'resource',
    enable: isDev || isVercel,
    options: {
      root: path.join(think.ROOT_PATH, 'www'),
      publicPath: /^\/(static|favicon\.ico|swagger)/,
      gzip: true
    }
  },
  {
    handle: 'trace',
    enable: !think.isCli,
    options: {
      debug: isDev
    }
  },
  {
    handle: 'payload',
    options: {
      uploadDir: isVercel ? '/tmp/_tmp' : path.join(think.RUNTIME_PATH, '_tmp'),
      keepExtensions: true,
      limit: '5mb'
    }
  },
  {
    handle: 'router',
    options: {}
  },
  'logic',
  'controller'
];
