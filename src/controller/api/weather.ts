import Base from '../base.js';
import axios from 'axios';
// @ts-expect-error
import cityList from '../../../data/最新_city.json';
export default class extends Base {
  /**
   * @api {get} /api/weather 天气查询
   * @apiDescription 天气查询
   * @apiGroup weather API
   *
   * @apiErrorExample {json} 错误返回值:
   * {
   *   "code": 201,
   *   "msg": "获取天气失败"
   * }
   *
   * @apiSuccess  {Object}  data     天气数据信息
   * @apiSuccess  {String}  data.ip       IP 地址
   * @apiSuccess  {String}  data.date     当前天气的当天日期
   * @apiSuccess  {String}  data.time     系统更新时间
   * @apiSuccess  {String}  data.cityInfo     请求城市信息
   * @apiSuccess  {String}  data.data     天气信息
   * @apiSuccess  {Number}  code=0   状态码
   * @apiSuccess  {String}  msg      状态信息
   * @apiSuccessExample {json} 正确返回值:
   * HTTP/1.1 200 OK
   * {
   *  "code": 0,
   *  "msg": "ok",
   *  "data": {
   *    "ip": "xxx",
   *    "date": "20230829",
   *    "time": "2023-08-29 08:41:25",
   *    "cityInfo": {
   *        "city": "xx",
   *        "citykey": "101210201",
   *        "parent": "xx",
   *        "updateTime": "06:16"
   *    },
   *    "data": {
   *      略
   *    }
   *  }
   * }
   */
  async indexAction() {
    const ip = this.get('ip')
      ? this.get('ip')
      : (await this.header('CF-Connecting-IP'))
        ? await this.header('CF-Connecting-IP')
        : this.ip.match(/\./g) &&
            this.ip.match(/\./g).length === 3 &&
            this.ip.match(/:/g) &&
            this.ip.match(/:/g).length === 1
          ? this.ip.replace(/:.*$/, '')
          : this.ip;

    // 请求ip位置
    const { data: res } = await axios
      .get(
        process.env.INSCODE_API_KEY
          ? `http://127.0.0.1:${this.config('port') ?? 8360}/api/ip`
          : `${this.ctx.protocol}://${this.ctx.host}/api/ip`,
        {
          params: { ip }
        }
      )
      .catch((err) => err);

    if (!res || res.code !== 0) {
      return this.fail(201, '获取天气失败');
    }

    if (res.result.ad_info.nation !== '中国') {
      return this.fail(201, '获取天气失败');
    }

    if (think.isEmpty(res.result.ad_info.city) && think.isEmpty(res.result.ad_info.province)) {
      return this.fail(201, '获取天气失败');
    }
    const city = !think.isEmpty(res.result.ad_info.city)
      ? res.result.ad_info.city.replace(/(市|区|县)$/, '')
      : res.result.ad_info.province.replace(/(市|区|县)$/, '');

    const cityData = cityList.filter((item: { city_name: string | any[] }) => {
      return item.city_name.includes(city);
    });
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
    const { data: wea } = await axios
      .get(`http://t.weather.itboy.net/api/weather/city/${cityCode}`)
      .catch((err) => err);
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
}
