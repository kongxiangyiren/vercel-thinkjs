import Base from '../base.js';
import { join } from 'path';
import helper from 'think-helper';
import { IP2Location } from 'ip2location-nodejs';
// @ts-expect-error
import IpCn from '../../../data/ip-cn.json';

export default class extends Base {
  /**
   * @api {get} /api/ip 获取ip信息
   * @apiDescription 获取ip信息
   *
   * 此站点或产品所使用的 IP2Location LITE 数据来自于 <a rel="noopener" target="_blank" href="https://lite.ip2location.com">https://lite.ip2location.com</a>.
   *
   * hexo 参考 [https://www.fomal.cc/posts/d739261b.html](https://www.fomal.cc/posts/d739261b.html)
   *
   * 把
   *
   * ```javascript
   * $.ajax({
   *     type: 'get',
   *     url: 'https://apis.map.qq.com/ws/location/v1/ip',
   *     data: {
   *         key: '你的key',
   *         output: 'jsonp',
   *     },
   *     dataType: 'jsonp',
   *     success: function (res) {
   *         ipLoacation = res;
   *     }
   * })
   * ```
   *
   * 替换为
   *
   * ```javascript
   * $.ajax({
   *   type: 'get',
   *   url: 'http://127.0.0.1:8360/api/ip',
   *   success: function (res) {
   *     ipLoacation = res;
   *   }
   * });
   * ```
   * @apiGroup IP API
   * @apiParam {String} [ip] ip地址
   * @apiParamExample {String} 请求参数格式:
   *    http://127.0.0.1:8360/api/ip?ip=127.0.0.1
   * @apiError    {Number}  code=201         状态码
   * @apiError    {String}  msg              状态信息
   * @apiErrorExample {json} 错误返回值:
   * {
   *   "code": 201,
   *   "msg": "无法获取有效IP"
   * }
   * @apiSuccess  {Object}  result                  ip 返回结果
   * @apiSuccess  {String}  result.ip               ip地址
   * @apiSuccess  {Object}  result.location         ip经纬度信息
   * @apiSuccess  {Number}  [result.location.lat]   纬度
   * @apiSuccess  {Number}  [result.location.lng]   经度
   * @apiSuccess  {Object}  result.ad_info                 ip地址信息
   * @apiSuccess  {String}  result.ad_info.nation          ip所在国家
   * @apiSuccess  {String}  result.ad_info.province        ip所在省份
   * @apiSuccess  {String}  result.ad_info.city            ip所在市
   * @apiSuccess  {String}  result.ad_info.district        ip所在地区
   * @apiSuccess  {Number}  code=0                  状态码
   * @apiSuccess  {String}  msg                     状态信息
   * @apiSuccess  {String}  message                 此站点或产品所使用的 IP2Location LITE 数据来自于 <a rel="noopener" target="_blank" href="https://lite.ip2location.com">https://lite.ip2location.com</a>
   * @apiSuccessExample {json} 正确返回值:
   * {
   *   "code": 0,
   *    "message":"此站点或产品所使用的 IP2Location LITE 数据来自于 https://lite.ip2location.com"
   *   "msg": "OK",
   *   "result": {
   *     "ip": "ip地址",
   *     "location": {
   *        lat: 纬度,
   *        lng: 经度
   *     },
   *   "ad_info": {
   *     "nation": "国家",
   *     "province": "省份",
   *     "city": "市",
   *     "district": "地区"
   *   }
   *   }
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

    if (!helper.isIP(ip)) {
      return this.fail(201, '无法获取有效IP');
    }

    const ip2location = new IP2Location();
    // 每月更新 https://lite.ip2location.com/database/db5-ip-country-region-city-latitude-longitude?lang=zh_CN
    // 下载ipv6的bin文件
    ip2location.open(join(think.ROOT_PATH, '/data/IP2LOCATION-LITE-DB5.IPV6.BIN'));

    const data = ip2location.getAll(ip);

    data.countryLong = this.gj(data.countryShort)[0] ? this.gj(data.countryShort)[0].cn : '';
    if (data.countryShort === 'CN') {
      data.region = this.cityTochinese(data.region)[0].name;
      data.city = this.cityTochinese(data.city, data.region)[0].name;
    }
    ip2location.close();
    return this.json({
      code: 0,
      message: '此站点或产品所使用的 IP2Location LITE 数据来自于 https://lite.ip2location.com',
      msg: 'OK',
      result: {
        ip,
        location: {
          lat: data.latitude,
          lng: data.longitude
        },
        ad_info: {
          nation: data.countryLong === '-' ? '' : data.countryLong,
          province: data.region === '-' ? '' : data.region,
          city: data.city === '-' ? '' : data.city,
          district: ''
        }
      }
    });
  }

  cityTochinese(name: string, regionChinese?: string) {
    return IpCn.中国城市.filter((item: { merger_name: string; pinyin: string }) => {
      return regionChinese
        ? item.merger_name.includes(regionChinese) && item.pinyin.includes(name.toLowerCase())
        : item.pinyin.includes(name.toLowerCase());
    });
  }

  gj(name: string) {
    return IpCn.国家.filter((item: { code: string }) => {
      return item.code.includes(name);
    });
  }
}
