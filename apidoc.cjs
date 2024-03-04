module.exports = {
  name: 'vercel API',
  version: require('./package.json').version,
  description: '',
  title: require('./package.json').name,
  url: 'http://127.0.0.1:8360',
  sampleUrl: 'http://127.0.0.1:8360',
  template: {
    forceLanguage: 'zh_cn',
    withGenerator: false,
    withCompare: false,
    aloneDisplay: true,
    showRequiredLabels: true
  },
  header: {
    title: '说明',
    filename: 'md/head.md'
  }
};
