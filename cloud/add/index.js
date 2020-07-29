// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

// 云函数入口函数
exports.main = async (event, context) => {
  // console.log(event);
  // console.log(that.data.openid);
  // console.log(this.getId());
  // console.log("----" +event._id);
  try {
    return await cloud.database().collection("goods_classify").add({
      
      // data 字段表示需新增的 JSON 数据
      data: { 
        _id:event._id,
        name: event.name,
        password:event.password
      }
    })
  } catch(e) {
    console.error(e)
  }     
}