const cloud = require('wx-server-sdk')
cloud.init({
  env:"supermarket-2pc4d" 

})
exports.main = (event) => { 
  return { ...event,...cloud.getWXContext()}
}
//可同时支持返回openid和处理cloudID，获取电话号码和群ID等信息。