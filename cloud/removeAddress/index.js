const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {

  return  db.collection("user").doc(event._id).update({
    data:{
      // goods_cart:_.push([event.cart])
      deliverAddress:event.deliverAddress
    }
  })
  // return  db.collection("user").doc(event._id).update({
  //   data:{
  //     ["deliverAddress."+[event.index]]:_.remove()
  //     // deliverAddress:_.pull(_.eq{event.removeAddr})
  //     // goods_cart:event.cart
  //   }
  // })
}