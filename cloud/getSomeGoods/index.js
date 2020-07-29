const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  return  db.collection("goods_detail").where({
    // goods_id:_.in(["0Ry1cyoymxSzqs", "0Ry1dFf95Ms1sx"])
    goods_id:_.in(event.goodsIdArr)

  }).get()
}