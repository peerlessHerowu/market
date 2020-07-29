// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 存储已完成的订单进入商家数据库
exports.main = async (event, context) => {
  return db.collection("marketOrder").add({
    data:{
      _id:event._id,
      orderNumber:event.orderNumber,
      orderDetail:event.orderDetail,
      completeTime:event.completeTime

    }
  })
  

}