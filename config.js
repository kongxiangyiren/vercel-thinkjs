// 生产环境使用
module.exports = {
  port: process.env.ASPNETCORE_PORT || 8360, // 服务器端口,默认 8360
  workers: process.env.ASPNETCORE_PORT ? 1 : 0, // 多进程 iis 启动时设置为1 加快启动速度
  // model: {
  //   type: 'mysql',
  //   mysql: {
  //     database: '',
  //     prefix: 'think_',
  //     encoding: 'utf8mb4',
  //     host: '127.0.0.1',
  //     port: '',
  //     user: 'root',
  //     password: 'root',
  //     dateStrings: true
  //   }
  // },
  session: {
    file: {
      cookie: {
        name: 'thinkjs' // session 名称
      }
    }
  }
};
