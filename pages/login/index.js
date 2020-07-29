// pages/login/index.js
const regeneratorRuntime = require('../../utils/runtime.js')

var getIdUtil = require('../../utils/getId.js')
var app = getApp();

Page({

  handleGetUserInfo :async function(e){
    if (e.detail.userInfo) {
      console.log("点击了同意授权");
   

      const {userInfo} = e.detail;
      console.log(userInfo)
      wx.setStorageSync('userinfo',userInfo)
      this.openid = await app.getOpenid()

      //获得user表的openid，判断是否存在这个用户，没有就创建
      wx.cloud.callFunction({
        name:"getUserInfo",
        data:{
          _id:this.openid
        }
      }).then(res=>{

        //没有就创建
        if(res.result.data.length === 0){
          wx.cloud.callFunction({
            name :"operateUserInfo",
            data:{
              _id:this.openid,
              nickName:userInfo.nickName,
              country:userInfo.country,
              province:userInfo.province,
              avatarUrl:userInfo.avatarUrl,
              language:userInfo.language,
              totalCredit:0
            }
          }).then(res=>{
            app.globalData.scopeUserInfo = true

            console.log(res)
            let pages = getCurrentPages();
            let prevpage = pages[pages.length - 2];
            if(prevpage.route === "pages/category/index"){
              wx.redirectTo({
                url: '/pages/pay/index',
              
              });
            }else{
              wx.navigateBack({
                delta:1
              });
            }
          
          })
        }else{
          app.globalData.scopeUserInfo = true
          wx.setStorageSync('userinfo',res.result.data[0])

            let pages = getCurrentPages();
            let prevpage = pages[pages.length - 2];
            console.log(prevpage.route)
            if(prevpage.route === "pages/category/index"){
              wx.redirectTo({
                url: '/pages/pay/index',
              });
            }else{
              wx.navigateBack({
                delta:1
              });
            }
        }
        
      })
      //获得userOrder表的openid，判断是否存在这个用户，没有就创建

      wx.cloud.callFunction({
        name:"getUserOrder",
        data:{
          _id:this.openid
        }
      }).then(res=>{
        console.log(res)
        //没有就创建
        if(res.result.data.length === 0){
          console.log("该用户没有订单记录")
          wx.cloud.callFunction({
            name :"addNewUserForOrder",
            data:{
              _id:this.openid
            }
          })
        }
      })
  
    } else {
      console.log("点击了拒绝授权");
      wx.navigateBack({
        delta: 1
      });
    }
  } 
  
}) 