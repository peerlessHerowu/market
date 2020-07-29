const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
const $ =db.command.aggregate

// 获得已完成的订单
exports.main = async (event, context) => {
  return  db.collection("marketOrder").where({
    completeTime:_.and(_.gte(parseInt(event.minTime)),_.lt(parseInt(event.maxTime)))
    
  }).count()
}