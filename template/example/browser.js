/*
 * 将Vue及组件挂在window下，避免webpack时丢失
 * 本文件仅服务于demo文件，通常不需要更改本文件
 * demoComponent的使用逻辑请写入browser.html
 */

window.Vue = require('vue');

window.demoComponent = require('../src/index.js');

console.log(window.Vue.version);
