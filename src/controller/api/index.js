const Base = require('../base.js');
const https = require('https');
const cheerio = require('cheerio');
const axios = require('axios');
module.exports = class extends Base {
  async indexAction() {
    const that = this.get();
    const user = Object.keys(that)[0];
    if (!user) {
      return this.fail(201, '无法获取到用户名');
    }
    let data = await this.cache(`githubcalendar:${user}`);
    if (!think.isEmpty(data)) {
      return this.json(data);
    }
    data = await this.getdata(user);
    if (data.code === 200) {
      await this.cache(`githubcalendar:${user}`, data, {
        timeout: 10 * 60 * 1000
      });
    }

    return this.json(data);
  }
  async getdata(name) {
    // 忽略证书
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const { data: res } = await axios
      .get('https://github.com/' + name, { httpsAgent: agent })
      .catch(err => err);

    if (!res) {
      return {
        total: 0,
        contributions: [],
        code: 201,
        message: '请求失败'
      };
    }

    const $ = cheerio.load(res);
    const data = $(
      '#user-profile-frame > div > div.mt-4.position-relative > div.js-yearly-contributions > div > div > div > svg > g > g'
    );

    const contributions = [];
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      const data2 = $(data[i]).children('rect');
      for (let j = 0; j < data2.length; j++) {
        //   console.log($(data2[j]).attr('data-date'));
        //   console.log($(data2[j]).attr('data-level'));

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

    return {
      total: total,
      contributions: this.listSplit(contributions, 7),
      code: 200,
      message: 'ok'
    };
  }

  listSplit(items, n) {
    const result = [];
    for (let i = 0, len = items.length; i < len; i += n) {
      result.push(items.slice(i, i + n));
    }
    return result;
  }
};
