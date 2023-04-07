const Base = require('../base.js');
const https = require('https');
const cheerio = require('cheerio');
const axios = require('axios');
module.exports = class extends Base {
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
    if (data.code === 200) {
      await this.cache(`githubcalendar:${user}`, data, {
        timeout: 10 * 60 * 1000
      });
    }
    // 返回结果
    return this.json(data);
  }
  async getdata(name) {
    // 忽略证书 本地开了代理时使用
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    // 请求github
    const { data: res } = await axios
      .get('https://github.com/' + name, { httpsAgent: agent })
      .catch(err => err);
    // 判断有没有获取成功
    if (!res) {
      // 失败返回
      return {
        total: 0,
        contributions: [],
        code: 201,
        message: '请求失败'
      };
    }
    // 解析页面数据
    const $ = cheerio.load(res);
    const data = $(
      '#user-profile-frame > div > div.mt-4.position-relative > div.js-yearly-contributions > div > div > div > svg > g > g'
    );
    const contributions = [];
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      const data2 = $(data[i]).children('rect');
      for (let j = 0; j < data2.length; j++) {
        let count = $(data2[j])
          .text()
          .replace(/^(.*) contribution(.*)$/, '$1');
        count = count === 'No' ? 0 : Number(count);
        total += count;
        contributions.push({
          date: $(data2[j]).attr('data-date'),
          count: count
        });
      }
    }
    // 成功返回
    return {
      total: total,
      contributions: this.listSplit(contributions, 7),
      code: 200,
      message: 'ok'
    };
  }

  // 获取的内容分组
  listSplit(items, n) {
    const result = [];
    for (let i = 0, len = items.length; i < len; i += n) {
      result.push(items.slice(i, i + n));
    }
    return result;
  }
};
