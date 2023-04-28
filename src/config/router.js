module.exports = [
  ['/api', '/api/index'],
  [/^\/api\/(\w+)\/index$/i, '/404'], // 设置404
  [/^\/api\/(\w+)\/(\w+)\/(.*)$/i, '/404'], // 设置404
  [/^\/api\/(.*)/i, '/api/:1'], // vue历史模式api路由规则
  [/^\/(.*)/i, '/index'] // vue历史模式规则
];
