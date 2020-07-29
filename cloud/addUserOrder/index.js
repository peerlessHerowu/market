const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  return  db.collection("userOrder").doc(event._id).update({
    data:{
      goods_order:_.unshift([

       event.goods_order

      //   orderNumber :event.orderNumber,
      //   consigneeAddr :event.consigneeAddr ,
      //   orderPrice :event.orderPrice,
      //   startDate : event.startDate,

      //  // 1:下单成功
      //  // 2、已送达
      //  // 3、缺货中
      //  orderStatus  : event.orderStatus,

      //  //1、上门付款
      //  orderPayModel : event.orderPayModel,
      //  orderTime : event.orderTime,

      //  theOrder:event.theOrder
      ])
    }
  })
}