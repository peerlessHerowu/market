const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
// 商家根据订单号获得用户id，然后更新该用户积分
exports.main = async (event, context) => {
  return cloud.database().collection("userOrder").where({
    'goods_order.orderNumber':event.orderNumber
  }).get()
  .then(res=>{
    console.log('id',res.data[0]._id)
    console.log(event.totalCredit)
    db.collection("user").where({
      _id:res.data[0]._id
    }).update({
      data:{
          totalCredit:_.inc(parseInt(event.totalCredit))
      }
    }) 
  })
   
}
// .aggregate()
//   .project({
//     goods_order: $.filter({
//       input: '$goods_order',
//       as: 'item',
//       cond: $.eq(['$$item.orderNumber', 'MSMK20200530192327890104'])
//     })
//   })
//   .end()