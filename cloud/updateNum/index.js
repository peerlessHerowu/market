const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
//更新下单商品的库存量
exports.main = async (event, context) => {

  let i = 0;
  let result
  event.goodsIdArr.forEach(e=>{
    result =  db.collection("goods_detail").where({
      goods_id:e
    }).update({
      data:{
        goods_num:_.inc(-event.goodsNumArr[i])
      }
    })
    result = db.collection("goods_classify").where({
      'children.goods_id':e
    }).update({
      data:{
        'children.$.goods_num':_.inc(-event.goodsNumArr[i])
  
      }
    })
    i++;
  })

  return  result
}