import 'thinkjs3-ts';
import path from 'path';
import { ParameterizedContext } from 'koa';
import { Stats, readFileSync } from 'fs';
import cors from '@koa/cors';
const isDev = think.env === 'development';
const isVercel = think.env === 'vercel';

export = [
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
      origin(ctx) {
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
    } as cors.Options
  },
  {
    handle: 'resource',
    enable: true,
    options: {
      root: path.join(think.ROOT_PATH, 'www'),
      publicPath: /^\/(assets|githubcalendar\.md|robots\.txt)/,
      notFoundNext: true,
      gzip: true,
      setHeaders: (res: ParameterizedContext['res'], url: string, stats: Stats) => {
        const file = path.join(think.ROOT_PATH, 'www/assets/main.bundle.js');
        if (url === file) {
          const data = readFileSync(file, { encoding: 'utf-8' });

          const reg = new RegExp('http://127.0.0.1:8360', 'g');
          const re = data.replace(
            reg,
            res.req.headers.referer.split('/')[0] + '//' + res.req.headers.host
          );

          res.writeHead(200, {
            'Content-Length': Buffer.byteLength(re),
            'Content-Type': 'text/javascript'
          });
          return res.end(re);
        }
      }
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
