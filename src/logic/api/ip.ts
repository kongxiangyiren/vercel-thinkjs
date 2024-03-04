import Base from '../base.js';
export default class extends Base {
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
}
