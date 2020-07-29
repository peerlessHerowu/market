// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
 db.collection(param.name)
    .field(param.field || {})
    .orderBy(param.orderName, 'desc')
    .skip(param.skip)
    .limit(param.limit)
    .get()
}