import fs from 'fs';
import { execSync } from 'child_process';
import pack from './package.json' assert { type: 'json' };
function build() {
  // 判断dist文件夹是否存在
  if (fs.existsSync('./dist')) {
    // 删除dist文件夹
    fs.rmSync('./dist', { recursive: true });
  }

  // 判断app文件夹是否存在
  if (fs.existsSync('./app')) {
    // 删除app文件夹
    fs.rmSync('./app', { recursive: true });
  }

  // 安装
  execSync('yarn install', {
    stdio: 'inherit'
  });
  // 编译
  execSync('npm run format && npx tslint "src/**/*.ts" --fix && npx tsc', {
    stdio: 'inherit'
  });

  // 复制
  fs.cpSync('./pack', './dist/pack', { recursive: true });
  fs.cpSync('./app', './dist/app', { recursive: true });
  fs.cpSync('./data/IP2LOCATION-LITE-DB5.IPV6.BIN', './dist/data/IP2LOCATION-LITE-DB5.IPV6.BIN', {
    recursive: true
  });
  fs.cpSync('./data/毒鸡汤.txt', './dist/data/毒鸡汤.txt', { recursive: true });
  fs.cpSync('./data/最新_city.json', './dist/data/最新_city.json', { recursive: true });
  fs.cpSync('./data/ip-cn.json', './dist/data/ip-cn.json', { recursive: true });
  // fs.cpSync('./package.json', './dist/package.json', { recursive: true });
  fs.cpSync('./config.js', './dist/config.js', { recursive: true });
  fs.cpSync('./view', './dist/view', { recursive: true });
  if (fs.existsSync('./www')) fs.cpSync('./www', './dist/www', { recursive: true });
  fs.cpSync('./production.js', './dist/production.js', { recursive: true });
  if (fs.existsSync('./pm2.json')) fs.cpSync('./pm2.json', './dist/pm2.json');
  if (fs.existsSync('./Web.config')) fs.cpSync('./Web.config', './dist/Web.config');
  fs.cpSync('./.npmrc', './dist/.npmrc');
  delete pack.scripts.postinstall;
  delete pack.devDependencies;
  const pac = pack;
  fs.writeFileSync('./dist/package.json', JSON.stringify(pac, null, 2));
}

build();
