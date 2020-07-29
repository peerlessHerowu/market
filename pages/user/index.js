// pages/user/index.js
const regeneratorRuntime = require('../../utils/runtime.js')
// import regeneratorRuntime from '../../utils/runtime.js'
const DB = wx.cloud.database();

var app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    userinfo:{},
    disable:true,
    isManager:false,  
    isSuperManager:false,
    canApply:false
  },

  async onLoad(){
    var that = this
    this.openid = await app.getOpenid()

    this.setData({
      phoneNumber :app.globalData.phoneNumber
    })
    // DB.collection('manager').where({
    //   _id:'1'
    // }).get().then(res=>{
    //   console.log('允许申请',res)
    //   //状态是一 的情况下可以申请
    //   if(res.data[0].status===1){
    //     that.setData({
    //       canApply:true
    //     })
    //   }
    // })
    // const userinfo = wx.getStorageSync('userinfo');
    // console.log('userinfo',userinfo)
   if(app.globalData.scopeUserInfo === true){
    wx.cloud.callFunction({
      name:"getUserInfo",
      data:{
        _id:this.openid
      }
    }).then(res=>{
      var userinfo = res.result.data[0]
      wx.setStorageSync('userinfo',userinfo)

      this.setData({
        userinfo,
      }); 
    })
   }
    
    var manageId=[]
    DB.collection('manager').get({    
    }).then(res=>{
      console.log(res)
      res = res.data.filter(function(user, index) {
         return  user.limit === 1 || user.limit === 0
        }); 
      res.forEach(element => {
        manageId.push(element._id)
      });
      console.log("manageId",manageId)
      var index = manageId.indexOf(this.openid)
      console.log('是否存在',index)
      if(app.globalData.scopeUserInfo === true && index!=-1){
        this.setData({
          isManager:true,
        })
      }else{
        this.setData({
          isManager:false
        })
      }
    })
    // if(app.globalData.scopeUserInfo === true && this.openid==="osRvn5T19VtU9mfTUeQZ4U4Hl3js"){
    //   this.setData({
    //     isSuperManager:true
    //   })
    // }
  },
  onShow: async function (){
    this.onLoad()
  },

  //跳转地址管理页面
  toAddressList(){
    if(app.globalData.scopeUserInfo === true){
      wx.navigateTo({
        url: '/pages/addressList/index',
      });
    }else{
      wx.navigateTo({
        url: '/pages/login/index',
      });
    }
    

  },
  contactMarket(){

    wx.makePhoneCall({
      phoneNumber: app.globalData.phoneNumber,

      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  toManage(){
    wx.navigateTo({
      url: '/pages/manage/index',
    });
  },

    // 跳转至管理订单页面
    toManageOrder(){
      wx.navigateTo({
        url:"/pages/manageAddress/index", 
       
      });
    },

    
  toFeedback(){
    wx.showModal({
      title: '提示',
      content: '敬请期待',
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#3CC51F',
      
    });
  },

  toCollection(){
    wx.showModal({
      title: '提示',
      content: '敬请期待',
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#3CC51F',
      
    });
  },
  toAboutUs(){
    wx.navigateTo({
      url: '/pages/aboutUs/index',
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },

  //status=0 超级管理员
  //status=1 普通管理员
  //status=2 普通用户
  applyFor(){
    // if(app.globalData.scopeUserInfo === true){
    //   DB.collection('manager').where({
    //     _id:this.openid
    //   }).get().then(res=>{
    //     console.log(res)
    //     if(res.data.length === 0){
          
    //     }
    //     wx.showModal({
    //       title: '提示',
    //       content: '申请成功',
    //       showCancel: true,
    //       cancelText: '取消',
    //       cancelColor: '#000000',
    //       confirmText: '确定',
    //       confirmColor: '#3CC51F',
    //       success: (result) => {
    //         if(result.confirm){
              
    //         }
    //       },
    //       fail: ()=>{},
    //       complete: ()=>{}
    //     });
    //   })
    // }

    // var userInfo =  this.data.userinfo
          //  DB.collection('manager').add({
          //   data:{
          //     _id:'osRvn5Y7k8nLKd32N1kipyQVczCY',
          //     limit:1
          //   }
          //  }).then(res=>{
          //       wx.showModal({
          //       title: '提示',
          //       content: '申请成功',
          //       showCancel: true,
          //       cancelText: '取消',
          //       cancelColor: '#000000',
          //       confirmText: '确定',
          //       confirmColor: '#3CC51F',
               
          //     });
          //   })

   
  },
 

  login(){
    wx.navigateTo({
      url:"/pages/login/index"
    })
  },
  logout(){
    this.setData({
      userinfo:{},
      isManager:false,
    })
    app.globalData.scopeUserInfo  = false
    // wx.removeStorageSync("userinfo");
    wx.clearStorage();
  }

})