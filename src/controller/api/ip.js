const Base = require('../base.js');
const helper = require('think-helper');
const { join } = require('path');
// 导入ipv4包
// https://github.com/lionsoul2014/ip2region/tree/master/binding/nodejs
const Searcher = require('node-ip2region');

// 导入ipv6包
const IPDBv6 = require('zxinc-ipv6');

// 指定node-ip2region数据文件路径
// 数据下载地址: https://github.com/lionsoul2014/ip2region/blob/master/data/ip2region.xdb
const dbPath = join(think.ROOT_PATH, '/data/ip2region.xdb');

// 读取ipv4库
let searcher;
try {
  // 同步读取buffer
  const buffer = Searcher.loadContentFromFile(dbPath);
  // 创建searcher对象
  searcher = Searcher.newWithBuffer(buffer);
} catch (e) {
  think.logger.error(e);
}

// ipv6
// 数据下载地址： http://ip.zxinc.org/ip.7z
const db = new IPDBv6(join(think.ROOT_PATH, '/data/ipv6wry.db'));

module.exports = class extends Base {
  async indexAction() {
    const ip = this.get('ip') ? this.get('ip') : this.ip;

    if (!helper.isIP(ip)) {
      return this.fail(201, '无法获取有效IP', {
        ipv4: false,
        ipv6: false
      });
    }

    if (helper.isIPv4(ip)) {
      // 查询 await 或 promise均可
      const data = await searcher.search(ip);
      // 国家|区域|省份|城市|ISP
      // data: {region:'中国|0|江苏省|苏州市|电信', ioCount: 0, took: 0.063833}
      const IpContent = data.region.split('|');

      return this.success(
        {
          ip,
          country: IpContent[0].trim() === '0' ? '' : IpContent[0].trim(),
          district: IpContent[1].trim() === '0' ? '' : IpContent[1].trim(),
          province: IpContent[2].trim() === '0' ? '' : IpContent[2].trim(),
          city: IpContent[3].trim() === '0' ? '' : IpContent[3].trim(),
          isp: IpContent[4].trim() === '0' ? '' : IpContent[4].trim(),
          ipv4: true,
          ipv6: false
        },
        'OK'
      );
    }

    if (helper.isIPv6(ip)) {
      const data = db.getIPAddr(ip);

      /*
    {
        myip: '240e:473:fb40:2733::',
        ip: { start: '240E:0470:1000:0000::', end: '240E:0473:FFFF:FFFF::' },
        location: '中国浙江省 中国电信',
        country: '中国浙江省',
        local: '中国电信',
        type: 'normal',
        isNormalIPv6: true,
        ipv4: undefined,
        serveripv4: undefined
    }
*/
      return this.success(
        {
          ip: data.myip,
          location: data.location,
          country: data.country,
          local: data.local,
          type: data.type,
          ipv4: false,
          ipv6: true
        },
        'OK'
      );
    }
  }
};
