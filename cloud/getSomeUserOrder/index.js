const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
const $ =db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  return  db.collection("userOrder").aggregate()
  .project({
    goods_order: $.filter({
      input: '$goods_order',
      as: 'item',
      cond: $.eq(['$$item.orderStatus', event.status])
    })
  })
  .end()
}