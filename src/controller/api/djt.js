const { join } = require('path');
const Base = require('../base.js');
const { readFileSync, existsSync } = require('fs');
module.exports = class extends Base {
  indexAction() {
    // https://github.com/able8/nows-nodejs-serverless
    const djtPath = join(think.ROOT_PATH, '/data/毒鸡汤.txt');
    if (!existsSync(djtPath)) {
      return this.fail(201, '数据库错误');
    }

    const data = readFileSync(djtPath, 'utf-8');
    const lines = data.replace(/\r/g, '').split('\n');
    const filteredArr = lines.filter(item => item.trim() !== ''); // 过滤掉空字符串
    const number = Math.floor(Math.random() * filteredArr.length);
    return this.success(filteredArr[number], 'ok');
  }
};
