import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import Base from '../base.js';
export default class extends Base {
  /**
   * @api {get} /api/djt 毒鸡汤
   * @apiDescription 毒鸡汤
   * @apiGroup 毒鸡汤 API
   *
   * @apiErrorExample {json} 错误返回值:
   * HTTP/1.1 500
   *
   * @apiSuccess  {String}  data     毒鸡汤内容
   * @apiSuccess  {Number}  code=0   状态码
   * @apiSuccess  {String}  msg      状态信息
   * @apiSuccessExample {json} 正确返回值:
   * HTTP/1.1 200 OK
   * {
   *  "code": 0,
   *  "msg": "ok",
   *  "data": "最近一个月，总有那么三十天很不顺。"
   * }
   */
  indexAction() {
    // https://github.com/able8/nows-nodejs-serverless
    const djtPath = join(think.ROOT_PATH, '/data/毒鸡汤.txt');
    if (!existsSync(djtPath)) {
      return this.fail(201, '数据库错误');
    }
    const data = readFileSync(djtPath, 'utf-8');
    const lines = data.replace(/\r/g, '').split('\n');
    const filteredArr = lines.filter((item) => item.trim() !== ''); // 过滤掉空字符串
    const n = Math.floor(Math.random() * filteredArr.length);
    return this.success(filteredArr[n], 'ok');
  }
}
