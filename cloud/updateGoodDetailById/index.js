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
    goods_id:event.goods_id
  }).update({
    data: {
        goods_num:parseInt(event.goods_num),
   },
  }).then(res=>{
    return db.collection("goods_classify").where({
      'children.goods_id':event.goods_id
    }).update({
      data:{
        'children.$.goods_num':event.goods_num
       
      }
    })
  })
  
 
}