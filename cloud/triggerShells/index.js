// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log('开始执行')
 try {
  db.collection("goods_classify").get().then(res=>{
    console.log("--------",res)
    let array  = res.data
    array.forEach(e=>{
      var children = e.children
      children.forEach(e1=>{
        let _id = e1.goods_id || '';
        let shells = e1.goods_sales_volumn
         console.log(_id)
      db.collection('goods_classify').where({
        'children.goods_id':_id
      }).update({
        data:{
          'children.$.totalVolumn':_.inc(shells),
          'children.$.goods_sales_volumn':0
        }
      }).then(res=>{
        console.log(res)
      })
      })
     
    })
  })
  return await db.collection("goods_detail").get().then(res=>{
    let array  = res.data
    array.forEach(e=>{
      console.log(e)
      let _id = e._id;
      let shells = e.goods_sales_volumn
      db.collection('goods_detail').doc(_id).update({
        data:{
          totalVolumn:_.inc(shells),
          goods_sales_volumn:0
        }
      }).then(res=>{
        console.log(res)
      })
    })
  })
 } catch (error) {
   
 }
 
}