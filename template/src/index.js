/*
 *	如果同一组件需要在不同平台（美团、点评等）展示出不同的样式
 *	可以通过约定process.env.CSS_ENV来引入不同的css
 *	本地开发可以使用例如npm run dev --DP来指定CSS_ENV
 *	demo如下：
 */

// if (process.env.CSS_ENV === 'DX') {
// 	require('./DX.scss');
// } else if (process.env.CSS_ENV === 'MT') {
// 	require('./MT.scss');
// } else if (process.env.CSS_ENV === 'DP') {
// 	require('./DP.scss');
// }

module.exports = require('./index.vue');
