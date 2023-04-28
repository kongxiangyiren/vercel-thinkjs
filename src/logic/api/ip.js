module.exports = class extends think.Logic {
  indexAction() {
    // 只允许get请求
    this.allowMethods = 'get';
    this.rules = {
      ip: {
        string: true,
        aliasName: 'ip地址'
      }
    };
  }
};
