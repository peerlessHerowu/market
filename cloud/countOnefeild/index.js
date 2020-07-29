const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
const $ =db.command.aggregate

// 获得已完成的订单
exports.main = async (event, context) => {
    return db.collection('marketOrder')
    .aggregate().match({
      completeTime:_.and(_.gte(event.minTime),_.lt(event.maxTime))
    })
    .group({
      _id: null,
      totalSell: $.sum('$orderDetail.totalNum'),
      totalIncome: $.sum('$orderDetail.orderPrice'),
      goodTotalShell: $.sum('$orderDetail.totalSell'),
      creditTotalShell: $.sum('$orderDetail.creditTotalShell'),
      totalCredit: $.sum('$orderDetail.orderCredit'),
    })
    .end()
  // else if(event.status === 0){//普通商品销量、收入
  //   return db.collection('marketOrder')
  //   .aggregate().match({
  //     completeTime:_.and(_.gte(event.minTime),_.lt(event.maxTime)),
      
  //   }).project({
  //     'orderDetail.theOrder': $.filter({
  //       input: '$orderDetail.theOrder',
  //       as: 'item',
  //       cond: $.eq(['$$item.status', event.status])
  //     })
  //   }).project({
  //     'orderDetail.theOrder': $.arrayToObject('$orderDetail.theOrder')
  //   })
  //   .group({
  //     _id: null,
  //     totalShell: $.sum(
  //       $.sum('$orderDetail.theOrder.num')
  //       ),
  //   })
  //   .end()
  // }
  // else if(event.status === 1){//积分商品销量、积分
  //   return db.collection('marketOrder')
  //   .aggregate().match({
  //     completeTime:_.and(_.gte(event.minTime),_.lt(event.maxTime)),
  //     'orderDetail.theOrder.$.status':event.status
  //   })
  //   .group({
  //     _id: null,
  //     totalNum: $.sum('$orderDetail.totalNum'),
  //     totalIncome: $.sum('$orderDetail.orderPrice'),
  //   })
  //   .end()
  // }
}