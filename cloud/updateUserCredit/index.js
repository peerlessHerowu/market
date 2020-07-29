const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
// 商家根据订单号获得用户id，然后更新该用户积分
exports.main = async (event, context) => {
  return db.collection("user").where({
    _id:event._id
  }).update({
    data:{
        totalCredit:_.inc(parseInt(-event.totalCredit))
    }
  }) 
   
}