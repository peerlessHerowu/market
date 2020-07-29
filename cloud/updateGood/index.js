// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  return db.collection("goods_classify").where({
    cat_name:event.cat_name
  }).update({
    data: {
      ["children."+[event.index]+".status"]: event.status,

      ["children."+[event.index]+".goods_name"]: event.goods_name,
      ["children."+[event.index]+".goods_price"]:parseFloat(event.goods_price),
      ["children."+[event.index]+".goods_num"]: parseInt(event.goods_num),
      ["children."+[event.index]+".goods_icon"]: event.goods_icon,
      
      // ["children."+[event.index]+".goods_detail"]: event.goods_detail,
   
   },
  }).then(res=>{
    

  })
 
}