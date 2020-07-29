// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数   
exports.main = async (event, context) => {
  // var results = await db.collection('goods_classify').where({
  //   cat_name: event.cat_name // 根据cat_name获得_id
  // }).get()
 return db.collection("goods_classify").doc(event.id).update({
    data: {   
      children:_.push({
        status:event.status,
        goods_icon:event.goods_icon[0],
        goods_id:event.goods_id,
        goods_name:event.goods_name,
        goods_price:parseFloat(event.goods_price),
        goods_num:parseInt(event.goods_num ),
        goods_sales_volumn:event.goods_sales_volumn
      })
    }
  }).then(res=>{
    return db.collection("goods_detail").add({
      data: {   
        _id:event._id,
        cat_id:event.id,
        cat_name:event.cat_name,

        status:event.status,

        goods_id:event.goods_id,
        goods_name: event.goods_name,
        goods_detail:event.goods_detail,
        goods_price:parseFloat(event.goods_price),
        goods_num:parseInt(event.goods_num ),
        goods_pics:event.goods_icon,
        goods_sales_volumn:event.goods_sales_volumn

      }
    })
  })

 
}