const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  return db.collection("userOrder").add({
    data:({
        _id:event._id,
        
    })
  }).then(res=>{
    return db.collection("marketOrder").add({
      data:({
          _id:event._id,
      })
    })
  })
}