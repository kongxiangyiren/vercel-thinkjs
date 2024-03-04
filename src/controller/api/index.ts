import axios from 'axios';
import Base from '../base.js';
import https from 'https';
import * as cheerio from 'cheerio';
export default class extends Base {
  /**
   * @api {get} /api github提交统计
   * @apiDescription
   *  *  [githubcalendar 配置参考](./githubcalendar.md)
   * @apiGroup github API
   *
   * @apiParamExample {string} 请求参数格式:
   *    http://127.0.0.1:8360/api?kongxiangyiren
   *
   * @apiError    {Number}  code=201         状态码
   * @apiError    {String}  msg              状态信息
   * @apiErrorExample {json} 错误返回值:
   * {
   *   "code": 201,
   *   "msg": "无法获取到用户名"
   * }
   * @apiSuccess  {Number}  [total]          github 一年提交的总数.
   * @apiSuccess  {Number}  [contributions]  github每天提交统计
   * @apiSuccess  {Number}  code=0           状态码
   * @apiSuccess  {String}  msg              状态信息
   * @apiSuccessExample {json} 正确返回值:
   * {
   *   "total": 559,
   *   "contributions": [
   *     [
   *       {
   *         "date": "2022-08-14",
   *         "count": 0
   *       },
   *       {
   *         "date": "2022-08-15",
   *         "count": 1
   *       },
   *       {
   *         "date": "2022-08-16",
   *         "count": 2
   *       },
   *       {
   *         "date": "2022-08-17",
   *         "count": 0
   *       },
   *       {
   *         "date": "2022-08-18",
   *         "count": 3
   *       },
   *       {
   *         "date": "2022-08-19",
   *         "count": 0
   *       },
   *       {
   *         "date": "2022-08-20",
   *         "count": 0
   *       }
   *     ],
   *     略
   *   ],
   *   "code": 0,
   *   "msg": "ok"
   * }
   */
  async indexAction() {
    // 获取get参数
    const that = this.get();
    // 获取github用户名
    const user = Object.keys(that)[0];
    // 判断用户名是否存在
    if (!user) {
      // 没有 返回
      return this.fail(201, '无法获取到用户名');
    }
    // 获取缓存
    let data = await this.cache(`githubcalendar:${user}`);
    //  存在就返回缓存数据
    if (!think.isEmpty(data)) {
      return this.json(data);
    }
    // 请求github获取数据
    data = await this.getdata(user);
    // 如果获取成功 就缓存10分钟
    if (data.code === 0) {
      await this.cache(`githubcalendar:${user}`, data, {
        timeout: 10 * 60 * 1000
      });
    }
    // 返回结果
    return this.json(data);
  }

  async getdata(name: string) {
    // 忽略证书 本地开了代理时使用
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    // 请求github
    const { data: res } = await axios
      .get('https://github.com/' + name, { httpsAgent: agent })
      .catch((err) => err);
    // 判断有没有获取成功
    if (!res) {
      // 失败返回
      return {
        total: 0,
        contributions: [],
        code: 201,
        msg: '请求失败'
      };
    }
    // 解析页面数据
    const $ = cheerio.load(res);
    const data = $(
      '#user-profile-frame > div > div.mt-4.position-relative > div.js-yearly-contributions > div > div > div > div:nth-child(1)  table > tbody > tr'
    );
    const contributions = [];
    let total = 0;
    for (const item of data) {
      const data2 = $(item).children('td');
      for (const item2 of data2) {
        const githubcalendarId = $(item2).attr('id');
        if (githubcalendarId) {
          let count: string | number = $(`tool-tip[for="${githubcalendarId}"]`)
            .text()
            .replace(/^(.*) contribution(.*)$/, '$1');
          count = count === 'No' ? 0 : Number(count);
          if (!isNaN(count) && $(item2).attr('data-date')) {
            total += count;
            contributions.push({
              date: $(item2).attr('data-date'),
              count
            });
          }
        }
      }
    }

    const sortedData = contributions.sort((a, b) => {
      const dateA = +new Date(a.date);
      const dateB = +new Date(b.date);
      return dateA - dateB;
    });

    // 成功返回
    return {
      total,
      contributions: this.listSplit(sortedData, 7),
      code: 0,
      msg: 'ok'
    };
  }

  // 获取的内容分组
  listSplit(items: string | any[], n: number) {
    const result = [];
    for (let i = 0, len = items.length; i < len; i += n) {
      result.push(items.slice(i, i + n));
    }
    return result;
  }
}
