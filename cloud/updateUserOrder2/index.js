// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数，商家更新用户订单信息，主要是状态
exports.main = async (event, context) => {
  return db.collection("userOrder").where({
    'goods_order.orderNumber':event.orderNumber
  }).update({
    data:{
      'goods_order.$.orderStatus':event.orderStatus,
      ['goods_order.$.theOrder.$[].orderStatus']:event.orderStatus,

    }
  })
  

}