module.exports = class extends think.Logic {
  indexAction() {
    // 只允许get请求
    this.allowMethods = 'get';
  }
};
