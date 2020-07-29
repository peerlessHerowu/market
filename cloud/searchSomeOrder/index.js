// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"supermarket-2pc4d" 
})

const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {

    return await db.collection('goods_detail').where(_.or([{
      cat_name: db.RegExp({
        regexp: '.*' + event.key,
        options: 'i',
      })
    },
     {
        goods_name: db.RegExp({
          regexp: '.*' + event.key,
          options: 'i',
        })
     } 
    ]))
    .orderBy(event.feild, event.orderRule)
    .skip(parseInt(event.currentPage) * parseInt(event.pageSize)) //从第几个数据开始
    .limit(parseInt(event.pageSize))
    .get()
}
