// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

// 云函数入口函数
exports.main = async (event, context) => {
 return cloud.database().collection("goods_classify").field({
   _id:true,
   cat_icon:true,
   cat_name:true
 }).
 get();
}