const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  return  db.collection("user").add({
    data:({
        _id:event._id,
        nickName:event.nickName,
        country:event.country,
        province:event.province,
        avatarUrl:event.avatarUrl,
        language:event.language,
        totalCredit:parseInt(event.totalCredit)
    })
  })
}