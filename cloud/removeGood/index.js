// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  return db.collection('goods_classify').doc(event._id).update({
    data: {
      children: _.pull({
        goods_name:_.eq(event.goods_name)
      })
    }
  })
 
}