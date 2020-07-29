// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  return db.collection("goods_detail").where({
    goods_name:event.goods_name
  }).update({
    data: {
        status:event.status,
        goods_name: event.goods_name,
        goods_detail:event.goods_detail,
        goods_price:parseFloat(event.goods_price),
        goods_num:parseInt(event.goods_num ),
        goods_pics:event.goods_icon,
   
   },
  }).then(res=>{
    

  })
 
}