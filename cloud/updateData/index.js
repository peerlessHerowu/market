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
    cat_id:1
  }).get()
  // return db.collection("goods_classify").doc('时令水果').update({
  //   data: {   
  //     fileID:_.push({
  //       'age':44,
  //       'name':'wujd'
  //     })
  //   }
  // })

  // return cloud.database().collection("image").add({
  //   data: {
  //     // 'fileID.0.age':455,
  //     //   'fileID.0.name':"hhh"   
  //     fiilID:[
  //       {
  //         'age':666,
  //         'name':"hhh"
  //       }
  //     ]
  //   }
  // })

}