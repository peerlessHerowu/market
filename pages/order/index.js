import { async } from "../../utils/runtime";
const regeneratorRuntime = require('../../utils/runtime.js')
const db = wx.cloud.database();

// pages/order/index.js
var app =  getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scopeUserInfo:false,

    totalComplete :0,
    totalDeliver:0,
    totalLack:0,
    
    goods_orders:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
   this.openid = await app.getOpenid()

    },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */

  //  需要在这里同时获得openid
  onShow: async function () {
    this.openid = await app.getOpenid()

    this.setData({
      scopeUserInfo : app.globalData.scopeUserInfo
    })

    const success = wx.getStorageSync('success')

    
  
    if(success){
      wx.showToast({
        title: '下单成功',
        icon: 'success',
        duration: 1000,
        mask: true
      })
      // 缓存中存入成功标志
      wx.removeStorageSync("success");
    }

    const goods_orders = wx.getStorageSync("goods_orders");
    //缓存没有数据就用数据库的
    if(!goods_orders){
      this.getTheUserOrder()
    }else{
      //数据没有过期就直接用(5分钟内)
      if(Date.now() - goods_orders.time > 1000*60*5){
        //数据过期就重新发送请求
        this.getTheUserOrder()
      }else{
        this.setData({
          goods_orders:goods_orders.data
        })
      }
      
    }
   
  },

  //用户获得自己的订单
  getTheUserOrder(){
    if(!this.data.scopeUserInfo) return
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 2500,
      mask:true,
    });
    wx.cloud.callFunction({
      name:'getUserOrder',
      data:{
        _id:this.openid
      }
    }).then(res=>{
      console.log(res)
      //获得数据后存入缓存
      let goods_orders = res.result.data[0].goods_order
      wx.setStorageSync("goods_orders",{time:Date.now(),data:goods_orders});
      this.setData({
        goods_orders
      })
      var totalComplete = 0
      var totalDeliver = 0
      var totalLack = 0
      goods_orders.forEach(element => {
        if(element.orderStatus===1 || element.orderStatus===0){
          totalDeliver++
        }else if(element.orderStatus===2){
          totalLack++
        }else{
          totalComplete++
        }
      });
      this.setData({
        totalComplete,
        totalDeliver,
        totalLack
      })
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500,
        mask:true,
      });
      
      //关闭下拉窗口
      wx.stopPullDownRefresh();
    })
  },

  //再来一单
  oneMore(){
    wx.switchTab({
      url: '/pages/category/index',
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
  },
  handleModifyOrder(e){
    const {index} = e.currentTarget.dataset
    var theOrder = this.data.goods_orders[index].theOrder
    wx.setStorageSync("fromLackGoods",{orderNumber:this.data.goods_orders[index].orderNumber,index:index});
    wx.setStorageSync("orderHint",true);
    theOrder = theOrder.filter(function(x, index) {
      return x.orderStatus != 2
      
    }); 
    wx.cloud.callFunction({
      name:'updateUserCart',
      data:{
       _id: this.openid,
       cart:theOrder
      }
    })
    
    wx.switchTab({
      url: '/pages/category/index',
      success: (result)=>{
        
      },
      fail: ()=>{},
      complete: ()=>{}
    });
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

  //删除订单，只删除用户表的订单
  deleteOrder(e){
    var that = this
    wx.showModal({
      title: '提示',
      content: '确认删除该订单吗？',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if(result.confirm){
          const {index} = e.currentTarget.dataset
          var deleteOrderNumber = this.data.goods_orders[index].orderNumber
          var goods_orders = that.data.goods_orders
          goods_orders.splice(index,1);
          this.setData({
            goods_orders
          })
          const _ = db.command
         wx.cloud.callFunction({
           name:'deleteUserOrder',
           data:{
             openid:that.openid,
             deleteOrderNumber:deleteOrderNumber
           }
         }).then(res=>{
           wx.showToast({
             title: '删除成功',
             icon: 'success',
           });
           this.getTheUserOrder()
         })
        }
      },
      fail: ()=>{},
      complete: ()=>{}
    });
   
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    this.getTheUserOrder()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})