const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  return  db.collection("goods_detail")
  .orderBy('goods_sales_volumn', 'desc')
  .skip(parseInt(event.currentPage) * parseInt(event.pageSize)) //从第几个数据开始
  .limit(parseInt(event.pageSize))
  .get()
}