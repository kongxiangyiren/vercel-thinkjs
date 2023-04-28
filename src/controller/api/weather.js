const Base = require('../base.js');
const axios = require('axios');
const cityList = require('../../../data/最新_city.json');
const jsonsql = require('jsonsql');
module.exports = class extends Base {
  async indexAction() {
    const ip = this.ip;
    // 请求ip位置
    const { data: res } = await axios.get(`//${this.ctx.host}/api/ip`, {
      params: { ip }
    });

    if (res.code !== 0) {
      return this.fail(201, '获取天气失败');
    }
    // 获取城市名称
    let city;
    if (
      res.data.ipv4 &&
      res.data.country === '中国' &&
      (!think.isEmpty(res.data.city) || !think.isEmpty(res.data.province))
    ) {
      city = !think.isEmpty(res.data.city)
        ? res.data.city.replace(/(市|区|县)$/, '')
        : res.data.province.replace(/(市|区|县)$/, '');
    } else if (res.data.ipv6 && res.data.country.slice(0, 2) === '中国') {
      city = res.data.country.split('\t')[2].replace(/(市|区|县)$/, '');
    } else {
      return this.fail(201, '获取天气失败');
    }
    // 查询城市city_code
    const cityData = jsonsql(cityList, `* where city_name ~ ${city}`);
    const cityCode = !think.isEmpty(cityData) ? cityData[0].city_code : '';
    if (think.isEmpty(cityCode)) {
      return this.fail(201, '获取天气失败');
    }
    // 读取缓存
    const cacheData = await this.cache(`weather:${cityCode}`);
    //  存在就返回缓存数据
    if (!think.isEmpty(cacheData)) {
      return this.success({ ...{ ip }, ...cacheData }, 'OK');
    }

    // https://www.sojson.com/blog/305.html

    const { data: wea } = await axios.get(
      `http://t.weather.itboy.net/api/weather/city/${cityCode}`
    );
    if (wea.status !== 200) {
      return this.fail(201, '获取天气失败');
    }
    const data = wea;
    delete data.status;
    delete data.message;
    // 缓存一小时
    await this.cache(`weather:${cityCode}`, data, {
      timeout: 1 * 60 * 60 * 1000
    });
    return this.success({ ...{ ip }, ...data }, 'OK');
  }
};
